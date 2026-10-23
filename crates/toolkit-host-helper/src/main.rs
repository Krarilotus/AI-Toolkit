//! Private length-prefixed stdio, one blocking worker, independently reading cancels.
use std::{
    collections::HashMap,
    io::{self, Read, Write},
    sync::{mpsc, Arc, Mutex},
    thread,
};
use toolkit_core::contracts::*;

fn read_frame(reader: &mut impl Read) -> io::Result<Option<Vec<u8>>> {
    let mut header = [0; 4];
    let first = reader.read(&mut header[..1])?;
    if first == 0 {
        return Ok(None);
    }
    reader.read_exact(&mut header[1..])?;
    let length = u32::from_le_bytes(header) as usize;
    if length == 0 || length > MAX_FRAME_BYTES {
        return Err(io::Error::new(
            io::ErrorKind::InvalidData,
            "invalid frame length",
        ));
    }
    let mut frame = vec![0; length];
    reader.read_exact(&mut frame)?;
    Ok(Some(frame))
}
fn write_frame(writer: &mut impl Write, output: Output) -> io::Result<()> {
    let mut bytes = serde_json::to_vec(&output)?;
    if bytes.len() > MAX_FRAME_BYTES {
        // Do not leave a live connection waiting forever for an unsendable result.
        let Output::Reply { id, .. } = output else {
            return Err(io::Error::other("response too large"));
        };
        bytes = serde_json::to_vec(&Output::Reply {
            id,
            result: OperationResult::Rejected {
                code: "response-too-large".into(),
            },
        })?;
    }
    writer.write_all(&(bytes.len() as u32).to_le_bytes())?;
    writer.write_all(&bytes)?;
    writer.flush()
}
#[derive(Clone, Copy)]
enum State {
    Queued,
    Cancelled,
    Running,
}
struct Work {
    id: u64,
    operation: Operation,
}

fn run() -> io::Result<()> {
    // Keep stdout backpressure out of the cancellation reader too. Each admitted
    // request emits at most Started + Reply. A peer flooding rejections beyond
    // this bounded output budget is disconnected; accepted work still drains.
    let (output, outputs) = mpsc::sync_channel::<Output>(2 * (QUEUE_CAPACITY + 1) + 1);
    let writer = thread::spawn(move || {
        let mut stdout = io::stdout().lock();
        let mut failed = None;
        for message in outputs {
            if failed.is_none() {
                if let Err(error) = write_frame(&mut stdout, message) {
                    failed = Some(error);
                }
            }
        }
        failed.map_or(Ok(()), Err)
    });
    output
        .send(Output::Hello { hello: hello() })
        .map_err(|_| io::Error::other("output stopped"))?;
    let states = Arc::new(Mutex::new(HashMap::new()));
    let (sender, receiver) = mpsc::sync_channel::<Work>(QUEUE_CAPACITY);
    let worker_states = states.clone();
    let worker_output = output.clone();
    let worker = thread::spawn(move || {
        for work in receiver {
            // Admission is the transition to Running, serialized against Cancel/EOF.
            let cancelled = {
                let mut states = worker_states.lock().unwrap();
                if matches!(states.get(&work.id), Some(State::Cancelled)) {
                    true
                } else {
                    states.insert(work.id, State::Running);
                    false
                }
            };
            let result = if cancelled {
                OperationResult::Cancelled
            } else {
                // A lost stdout must never abandon an accepted transaction.
                let _ = worker_output.send(Output::Started { id: work.id });
                toolkit_core::execute(work.operation)
            };
            let _ = worker_output.send(Output::Reply {
                id: work.id,
                result,
            });
            worker_states.lock().unwrap().remove(&work.id);
        }
    });
    let mut reader = io::stdin().lock();
    let read_result = (|| -> io::Result<()> {
        let mut last_id = 0;
        while let Some(frame) = read_frame(&mut reader)? {
            // Same raw duplicate/Unicode/depth preflight as metadata, before serde collapse.
            let raw = toolkit_core::profiles::parse_wire(&frame)
                .map_err(|code| io::Error::new(io::ErrorKind::InvalidData, code))?;
            let input: Input = serde_json::from_value(raw)?;
            match input {
                Input::Cancel { id } => {
                    if let Some(state @ State::Queued) = states.lock().unwrap().get_mut(&id) {
                        *state = State::Cancelled;
                    }
                }
                Input::Request { id, operation } => {
                    if id == 0 || id > MAX_REQUEST_ID || id <= last_id {
                        return Err(io::Error::new(
                            io::ErrorKind::InvalidData,
                            "request IDs must increase",
                        ));
                    }
                    last_id = id;
                    let mut state = states.lock().unwrap();
                    if state.len() > QUEUE_CAPACITY {
                        drop(state);
                        output
                            .try_send(Output::Reply {
                                id,
                                result: OperationResult::QueueFull,
                            })
                            .map_err(|_| io::Error::other("output capacity exhausted"))?;
                        continue;
                    }
                    state.insert(id, State::Queued);
                    drop(state);
                    match sender.try_send(Work { id, operation }) {
                        Ok(()) => (),
                        Err(mpsc::TrySendError::Full(_)) => {
                            states.lock().unwrap().remove(&id);
                            output
                                .try_send(Output::Reply {
                                    id,
                                    result: OperationResult::QueueFull,
                                })
                                .map_err(|_| io::Error::other("output capacity exhausted"))?;
                        }
                        Err(mpsc::TrySendError::Disconnected(_)) => {
                            return Err(io::Error::other("worker stopped"))
                        }
                    }
                }
            }
        }
        Ok(())
    })();
    // EOF/protocol failure stops admission; queued work cancels, accepted work drains.
    for state in states.lock().unwrap().values_mut() {
        if matches!(state, State::Queued) {
            *state = State::Cancelled;
        }
    }
    drop(sender);
    worker
        .join()
        .map_err(|_| io::Error::other("worker panicked"))?;
    drop(output);
    let written = writer
        .join()
        .map_err(|_| io::Error::other("output panicked"))?;
    read_result.and(written)
}
fn main() {
    if let Err(error) = run() {
        eprintln!("Toolkit helper protocol: {error}");
        std::process::exit(2);
    }
}
