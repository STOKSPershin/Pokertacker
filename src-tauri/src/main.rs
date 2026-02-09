#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, WindowEvent};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_current_timestamp() -> String {
    chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true)
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }
            Ok(())
        })
        .on_window_event(|event| match event.event() {
            WindowEvent::CloseRequested { .. } => {
                if event.window().label() == "main" {
                    if let Some(detached_window) = event.window().get_window("session-tracker-detached") {
                        let _ = detached_window.close();
                    }
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![get_current_timestamp])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
