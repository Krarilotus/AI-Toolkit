mod desktop;
mod error;
pub mod game;
mod library;
mod migration;
mod storage;
mod themes;
mod updates;
mod windows;
use tauri::{Emitter, Manager};

pub fn run() {
    tauri::Builder::default()
        .manage(desktop::Session::default())
        .manage(updates::Updates::default())
        .manage(windows::WindowState::default())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            desktop::desktop_request,
            desktop::game_request,
            desktop::queue_document
        ])
        .setup(|app| {
            let handle = app.handle();
            let cache = storage::user_data(handle)?;
            app.asset_protocol_scope().allow_directory(&cache, true)?;
            windows::create(handle, true)?;
            if let Some(window) = app.get_webview_window("main") {
                windows::restore(handle, &window)?;
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if matches!(
                event,
                tauri::WindowEvent::Moved(_) | tauri::WindowEvent::Resized(_)
            ) {
                windows::remember(window);
            }
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let app = window.app_handle();
                let approved = app
                    .state::<desktop::Session>()
                    .approved_close
                    .lock()
                    .map(|s| s.contains(window.label()))
                    .unwrap_or(false);
                let protected = app
                    .state::<desktop::Session>()
                    .protected
                    .lock()
                    .map(|s| s.contains(window.label()))
                    .unwrap_or(false);
                if protected && !approved {
                    api.prevent_close();
                    let _ = window.emit_to(window.label(), "request-window-close", ());
                } else if window.label() == "main" {
                    windows::persist(window);
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("AI Toolkit desktop startup failed");
}

pub fn apply_update(path: &std::path::Path) -> Result<(), String> {
    updates::apply_update(path).map_err(|e| e.to_string())
}
