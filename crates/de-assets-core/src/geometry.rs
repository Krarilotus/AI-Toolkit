//! One private float32 stream/stride/alignment policy for validation and pixels.
use crate::*;
pub(crate) struct FloatStreams {
    streams: std::collections::BTreeMap<u8, (u64, u64)>,
}
impl FloatStreams {
    pub(crate) fn validate(v: &VertexData, work: &mut Work) -> Result<Self> {
        // Initial usable geometry supports float32 streams, with Unity's
        // 16-byte alignment between streams. Other encodings remain metadata.
        // Unknown encodings are metadata-valid but not usable by this validator.
        let mut streams = std::collections::BTreeMap::<u8, (u64, u64)>::new();
        let mut channel_spans = Vec::new();
        for c in &v.channels {
            work.charge(1)?;
            if c.dimension == 0 {
                continue;
            }
            if c.format != 0 || c.stream > 15 || c.dimension > 4 {
                return Err(Error::UnsupportedLayout("vertex encoding/stream"));
            }
            let entry = streams.entry(c.stream).or_default();
            let end = add(u64::from(c.offset), mul(u64::from(c.dimension), 4)?)?;
            for &(stream, start, stop) in &channel_spans {
                work.charge(1)?;
                if stream == c.stream && u64::from(c.offset) < stop && end > start {
                    return Err(Error::Corrupt("overlapping vertex channels"));
                }
            }
            channel_spans
                .try_reserve(1)
                .map_err(|_| Error::Limit("geometry allocation"))?;
            channel_spans.push((c.stream, u64::from(c.offset), end));
            entry.0 = add(entry.0, mul(u64::from(c.dimension), 4)?)?;
        }
        if v.vertex_count > 0 && streams.is_empty() {
            return Err(Error::Corrupt("vertices without channels"));
        }
        let mut stream_end = 0;
        for (expected, (stream, (stride, offset))) in streams.iter_mut().enumerate() {
            work.charge(1)?;
            if usize::from(*stream) != expected {
                return Err(Error::UnsupportedLayout("noncontiguous vertex streams"));
            }
            *offset = add(stream_end, (16 - stream_end % 16) % 16)?;
            stream_end = add(*offset, mul(*stride, u64::from(v.vertex_count))?)?;
            if stream_end > v.data.len() as u64 {
                return Err(Error::Corrupt("vertex stream range"));
            }
        }
        for &(stream, _, end) in &channel_spans {
            work.charge(1)?;
            if end > streams[&stream].0 {
                return Err(Error::Corrupt("channel exceeds stream stride"));
            }
        }
        let layout = Self { streams };
        for c in &v.channels {
            work.charge(1)?;
            if c.dimension == 0 {
                continue;
            }
            for i in 0..v.vertex_count {
                work.charge(1)?;
                for j in 0..c.dimension {
                    work.charge(1)?;
                    if !layout.scalar(v, c, i, j)?.is_finite() {
                        return Err(Error::Corrupt("nonfinite sprite geometry"));
                    }
                }
            }
        }
        Ok(layout)
    }
    fn scalar(&self, v: &VertexData, c: &Channel, vertex: u32, component: u8) -> Result<f32> {
        let (stride, offset) = self.streams[&c.stream];
        let start = add(
            offset,
            add(mul(u64::from(vertex), stride)?, u64::from(c.offset))?,
        )?;
        let p = usize_of(add(start, mul(u64::from(component), 4)?)?)?;
        let b = v
            .data
            .get(p..p.checked_add(4).ok_or(Error::Corrupt("vertex end"))?)
            .ok_or(Error::Corrupt("vertex channel range"))?;
        Ok(f32::from_le_bytes(b.try_into().expect("checked scalar")))
    }
    pub(crate) fn channel(
        &self,
        v: &VertexData,
        id: usize,
        vertex: u32,
        work: &mut Work,
    ) -> Result<[f64; 4]> {
        let c = v
            .channels
            .get(id)
            .ok_or(Error::UnsupportedLayout("missing sprite channel"))?;
        let mut out = [0.; 4];
        for j in 0..c.dimension {
            work.charge(1)?;
            out[usize::from(j)] = f64::from(self.scalar(v, c, vertex, j)?);
        }
        Ok(out)
    }
}
