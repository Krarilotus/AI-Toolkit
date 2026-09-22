use crate::{
    library,
    storage::{self, Result},
};
use base64::{engine::general_purpose::STANDARD, Engine};
use serde::Deserialize;
use serde_json::{json, Value};
use std::{
    collections::{HashMap, HashSet},
    fs,
    path::{Path, PathBuf},
    sync::Mutex,
};
use tauri::{AppHandle, Emitter, Manager, WebviewWindow};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_opener::OpenerExt;

#[derive(Default)]
pub struct Session {
    pub approved_close: Mutex<HashSet<String>>,
    pub protected: Mutex<HashSet<String>>,
    documents: Mutex<DocumentDelivery>,
}
/// Readiness and pending content form one state transition. Keeping them under
/// one mutex prevents a new window's ready signal from passing a queued file.
#[derive(Default)]
struct DocumentDelivery {
    ready: HashSet<String>,
    pending: HashMap<String, Value>,
}
impl DocumentDelivery {
    fn mark_ready(&mut self, label: &str) -> Option<Value> {
        self.ready.insert(label.into());
        self.pending.remove(label)
    }
    fn queue(&mut self, label: &str, payload: Value) -> Option<Value> {
        if self.ready.contains(label) {
            Some(payload)
        } else {
            self.pending.insert(label.into(), payload);
            None
        }
    }
}
#[derive(Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Operation {
    InterfaceSettings,
    SetTheme,
    ListThemes,
    SetLanguage,
    LoadConfig,
    Installation,
    ChooseInstallation,
    PickPath,
    ReadDocument,
    WriteFile,
    ReadBytes,
    ScanLibrary,
    ReadProject,
    ReplaceCharacter,
    UpdateMapping,
    ReadMedia,
    ReplaceMedia,
    OpenMedia,
    OpenPath,
    LoadSkins,
    ChooseSkin,
    RemoveSkin,
    OpenSkins,
    ChooseBackground,
    SavePicture,
    Ready,
    ConfirmClose,
    NewWindow,
    Confirm,
    CloneAi,
    CreateAi,
    UpdateAi,
    CastleDestination,
    AddCastle,
    ReplacePortrait,
    CheckUpdate,
    UpdateSources,
    SetUpdateSource,
    PrepareUpdate,
    InstallUpdate,
    DocumentReady,
    ProtectClose,
    DeveloperTools,
}
#[derive(Deserialize)]
pub struct Request {
    operation: Operation,
    #[serde(default)]
    payload: Value,
}
fn str_arg<'a>(payload: &'a Value, key: &str) -> Result<&'a str> {
    payload[key]
        .as_str()
        .ok_or_else(|| crate::error::Error::with_arguments("missing_argument", json!({"name":key})))
}
fn interface_settings(app: &AppHandle) -> Result<Value> {
    let s = storage::settings(app)?;
    Ok(
        json!({"theme":s["theme"].as_str().unwrap_or("default"),"language":s["language"].as_str().unwrap_or("system")}),
    )
}
fn configuration(app: &AppHandle, name: &str) -> Result<Value> {
    storage::safe_name(name)?;
    // Embedded defaults are immutable. External config is intentionally editable.
    let asset = app
        .asset_resolver()
        .get(format!("config/{name}"))
        .ok_or_else(|| crate::error::Error::new("unknown_configuration_file"))?;
    let defaults: Value =
        serde_json::from_slice(&asset.bytes).map_err(crate::error::Error::diagnostic)?;
    let custom = std::env::current_exe()
        .map_err(crate::error::Error::diagnostic)?
        .parent()
        .unwrap()
        .join("config")
        .join(name);
    if custom.exists() {
        return Ok(storage::merge_configuration(
            name,
            defaults,
            storage::read_json(custom)?,
        ));
    }
    Ok(defaults)
}
fn pick(app: &AppHandle, payload: &Value) -> Result<Value> {
    let mut dialog = app.dialog().file();
    if let Some(title) = payload["title"].as_str() {
        dialog = dialog.set_title(title);
    }
    if let Some(default) = payload["defaultPath"].as_str() {
        let path = Path::new(default);
        if path.is_dir() {
            dialog = dialog.set_directory(path);
        } else {
            if let Some(p) = path.parent() {
                dialog = dialog.set_directory(p);
            }
            if let Some(n) = path.file_name() {
                dialog = dialog.set_file_name(n.to_string_lossy());
            }
        }
    }
    if let Some(filters) = payload["filters"].as_array() {
        for f in filters {
            let exts: Vec<_> = f["extensions"]
                .as_array()
                .into_iter()
                .flatten()
                .filter_map(Value::as_str)
                .collect();
            dialog = dialog.add_filter(library::text(f, "name"), &exts);
        }
    }
    let selected = if payload["directory"].as_bool() == Some(true) {
        dialog.blocking_pick_folder()
    } else if payload["save"].as_bool() == Some(true) {
        dialog.blocking_save_file()
    } else {
        dialog.blocking_pick_file()
    };
    Ok(selected
        .and_then(|p| p.into_path().ok())
        .map(|p| json!(p))
        .unwrap_or(Value::Null))
}
fn skin_path(app: &AppHandle, kind: &Value) -> Result<PathBuf> {
    let id = kind
        .as_u64()
        .ok_or_else(|| crate::error::Error::new("invalid_item_type"))?;
    if id > 100000 {
        return Err(crate::error::Error::new("invalid_item_type"));
    }
    let folder = storage::user_data(app)?.join("aiv-skins");
    fs::create_dir_all(&folder).map_err(crate::error::Error::diagnostic)?;
    Ok(folder.join(format!("{id}.png")))
}
fn image_selection(app: &AppHandle, payload: &Value) -> Result<Value> {
    let choice = pick(app, payload)?;
    let Some(path) = choice.as_str() else {
        return Ok(Value::Null);
    };
    let file = Path::new(path);
    if fs::metadata(file)
        .map_err(crate::error::Error::diagnostic)?
        .len()
        > 128 * 1024 * 1024
    {
        return Err(crate::error::Error::new("selected_image_exceeds_128_mb"));
    }
    Ok(json!({"fileName":file.file_name(),"path":file,"dataUrl":storage::data_url(file)?}))
}

#[tauri::command]
pub async fn desktop_request(
    app: AppHandle,
    window: WebviewWindow,
    request: Request,
) -> Result<Value> {
    tauri::async_runtime::spawn_blocking(move || handle(&app, &window, request))
        .await
        .map_err(crate::error::Error::diagnostic)?
}
fn handle(app: &AppHandle, window: &WebviewWindow, request: Request) -> Result<Value> {
    let p = request.payload;
    match request.operation {
        Operation::DocumentReady => {
            let state = app.state::<Session>();
            let pending = state
                .documents
                .lock()
                .map_err(crate::error::Error::diagnostic)?
                .mark_ready(window.label());
            if let Some(payload) = pending {
                window
                    .emit_to(window.label(), "load-file", payload)
                    .map_err(crate::error::Error::diagnostic)?;
            }
            Ok(Value::Null)
        }
        Operation::ProtectClose => {
            app.state::<Session>()
                .protected
                .lock()
                .map_err(crate::error::Error::diagnostic)?
                .insert(window.label().into());
            Ok(Value::Null)
        }
        Operation::CheckUpdate => Ok(crate::updates::check(app, p["force"] == true)),
        Operation::UpdateSources => crate::updates::sources(app),
        Operation::SetUpdateSource => crate::updates::select(app, str_arg(&p, "repo")?),
        Operation::PrepareUpdate => crate::updates::prepare(app, str_arg(&p, "key")?),
        Operation::InstallUpdate => crate::updates::install(app),
        Operation::InterfaceSettings => interface_settings(app),
        Operation::Confirm => {
            use tauri_plugin_dialog::{MessageDialogButtons, MessageDialogResult};
            let labels = p["choices"]
                .as_array()
                .ok_or_else(|| crate::error::Error::new("missing_dialog_choices"))?;
            let label = |i: usize| {
                labels
                    .get(i)
                    .and_then(Value::as_str)
                    .unwrap_or("")
                    .to_string()
            };
            let response = app
                .dialog()
                .message(str_arg(&p, "message")?)
                .title(str_arg(&p, "title")?)
                .buttons(MessageDialogButtons::YesNoCancelCustom(
                    label(0),
                    label(1),
                    label(2),
                ))
                .blocking_show_with_result();
            let index = match response {
                MessageDialogResult::Yes => 0,
                MessageDialogResult::No => 1,
                MessageDialogResult::Custom(s) => labels
                    .iter()
                    .position(|v| v.as_str() == Some(&s))
                    .unwrap_or(2),
                _ => 2,
            };
            Ok(p["values"].get(index).cloned().unwrap_or(Value::Null))
        }
        Operation::ListThemes => Ok(json!(crate::themes::discover(
            &storage::user_data(app)?.join("themes")
        )?)),
        Operation::SetTheme | Operation::SetLanguage => {
            let theme = matches!(request.operation, Operation::SetTheme);
            let key = if theme { "theme" } else { "language" };
            let value = str_arg(&p, key)?;
            if theme
                && !matches!(value, "default" | "ucp")
                && !crate::themes::discover(&storage::user_data(app)?.join("themes"))?
                    .iter()
                    .any(|pack| pack["id"] == value)
            {
                return Err(crate::error::Error::new("unknown_theme"));
            }
            if !theme
                && !matches!(
                    value,
                    "system" | "en" | "de" | "fr" | "ru" | "hu" | "tr" | "zh-CN" | "es" | "fa"
                )
            {
                return Err(crate::error::Error::new("unknown_language"));
            }
            storage::update_settings(app, key, json!(value))?;
            let settings = interface_settings(app)?;
            app.emit(
                if theme {
                    "theme-changed"
                } else {
                    "language-changed"
                },
                if theme {
                    json!(value)
                } else {
                    settings.clone()
                },
            )
            .map_err(crate::error::Error::diagnostic)?;
            Ok(settings)
        }
        Operation::LoadConfig => configuration(app, str_arg(&p, "file")?),
        Operation::Installation => Ok(storage::installation(app)
            .ok()
            .map(|p| json!(p))
            .unwrap_or(Value::Null)),
        Operation::ChooseInstallation => {
            let choice = pick(app, &p)?;
            if let Some(value) = choice.as_str() {
                let root = storage::normalize_installation(Path::new(value))?;
                storage::update_settings(app, "ucpInstallation", json!(root))?;
                Ok(json!(root))
            } else {
                Ok(Value::Null)
            }
        }
        Operation::PickPath => pick(app, &p),
        Operation::ReadDocument => storage::read_document(
            Path::new(str_arg(&p, "path")?),
            p["castle"].as_bool() == Some(true),
        ),
        Operation::ReadBytes => Ok(json!(STANDARD
            .encode(fs::read(str_arg(&p, "path")?).map_err(crate::error::Error::diagnostic)?))),
        Operation::WriteFile => {
            let path = Path::new(str_arg(&p, "path")?);
            let bytes = if let Some(encoded) = p["base64"].as_str() {
                STANDARD
                    .decode(encoded)
                    .map_err(crate::error::Error::diagnostic)?
            } else {
                str_arg(&p, "content")?.as_bytes().to_vec()
            };
            storage::atomic_write(path, &bytes)?;
            Ok(json!(path))
        }
        Operation::ScanLibrary => library::scan(Path::new(str_arg(&p, "gameRoot")?)),
        Operation::ReadProject => library::read_project(&p),
        Operation::ReplaceCharacter => library::replace_character(&p),
        Operation::CloneAi => library::create(&p, true),
        Operation::CreateAi => library::create(&p, false),
        Operation::UpdateAi => library::update(&p),
        Operation::CastleDestination => library::castle_destination(&p),
        Operation::AddCastle => library::add_castle(&p),
        Operation::ReplacePortrait => library::replace_portrait(&p),
        Operation::UpdateMapping => library::update_mapping(&p),
        Operation::ReadMedia => {
            let mut media = library::resolve_media(&p)?;
            if media["kind"] != "speech" {
                return Err(crate::error::Error::new(
                    "use_open_externally_for_bink_video",
                ));
            }
            if media["size"].as_u64().unwrap_or(0) > 128 * 1024 * 1024 {
                return Err(crate::error::Error::new("media_exceeds_playback_limit"));
            }
            media["dataUrl"] = json!(storage::data_url(Path::new(library::text(
                &media, "filePath"
            )))?);
            Ok(media)
        }
        Operation::ReplaceMedia => {
            let media = library::resolve_media(&p)?;
            let choice = pick(app, &p["dialog"])?;
            if let Some(source) = choice.as_str() {
                let dest = Path::new(library::text(&media, "filePath"));
                let extension = |path: &Path| {
                    path.extension()
                        .and_then(|value| value.to_str())
                        .unwrap_or("")
                        .to_ascii_lowercase()
                };
                if extension(Path::new(source)) != extension(dest) {
                    return Err(crate::error::Error::new(
                        "the_media_file_type_does_not_match",
                    ));
                }
                storage::atomic_write(
                    dest,
                    &fs::read(source).map_err(crate::error::Error::diagnostic)?,
                )?;
                Ok(library::resolve_media(&p)?)
            } else {
                Ok(Value::Null)
            }
        }
        Operation::OpenMedia => {
            let media = library::resolve_media(&p)?;
            let path = library::text(&media, "filePath");
            app.opener()
                .open_path(path, None::<&str>)
                .map_err(crate::error::Error::diagnostic)?;
            Ok(json!(path))
        }
        Operation::OpenPath => {
            let root = storage::normalize_installation(Path::new(str_arg(&p, "gameRoot")?))?;
            let plugins = root.join("ucp/plugins");
            let requested = p["targetPath"].as_str().filter(|path| !path.is_empty());
            let target = storage::within(&plugins, requested.map(Path::new).unwrap_or(&plugins))?;
            app.opener()
                .open_path(target.to_string_lossy(), None::<&str>)
                .map_err(crate::error::Error::diagnostic)?;
            Ok(json!(target))
        }
        Operation::LoadSkins => {
            let mut result = json!({"skins":{},"customSkinTypes":[]});
            let dir = storage::user_data(app)?.join("aiv-skins");
            if dir.exists() {
                for entry in fs::read_dir(dir)
                    .map_err(crate::error::Error::diagnostic)?
                    .flatten()
                {
                    let file = entry.path();
                    let stem = file.file_stem().and_then(|n| n.to_str()).unwrap_or("");
                    if stem.parse::<u32>().is_ok()
                        && file
                            .extension()
                            .is_some_and(|e| e.eq_ignore_ascii_case("png"))
                    {
                        result["skins"][stem] = json!(storage::data_url(&file)?);
                        result["customSkinTypes"]
                            .as_array_mut()
                            .unwrap()
                            .push(json!(stem));
                    }
                }
            }
            Ok(result)
        }
        Operation::ChooseSkin => {
            let selected = pick(app, &p["dialog"])?;
            if let Some(source) = selected.as_str() {
                let target = skin_path(app, &p["itemType"])?;
                let bytes = fs::read(source).map_err(crate::error::Error::diagnostic)?;
                if !bytes.starts_with(b"\x89PNG\r\n\x1a\n") {
                    return Err(crate::error::Error::new("invalid_png"));
                }
                storage::atomic_write(&target, &bytes)?;
                Ok(json!(storage::data_url(&target)?))
            } else {
                Ok(Value::Null)
            }
        }
        Operation::RemoveSkin => {
            let path = skin_path(app, &p["itemType"])?;
            if path.exists() {
                fs::remove_file(path).map_err(crate::error::Error::diagnostic)?;
            }
            Ok(json!(true))
        }
        Operation::OpenSkins => {
            let folder = storage::user_data(app)?.join("aiv-skins");
            fs::create_dir_all(&folder).map_err(crate::error::Error::diagnostic)?;
            app.opener()
                .open_path(folder.to_string_lossy(), None::<&str>)
                .map_err(crate::error::Error::diagnostic)?;
            Ok(json!(folder))
        }
        Operation::ChooseBackground => image_selection(app, &p),
        Operation::SavePicture => {
            let choice = pick(app, &p["dialog"])?;
            if let Some(path) = choice.as_str() {
                let data = str_arg(&p, "png")?
                    .strip_prefix("data:image/png;base64,")
                    .ok_or_else(|| crate::error::Error::new("invalid_png"))?;
                let bytes = STANDARD
                    .decode(data)
                    .map_err(crate::error::Error::diagnostic)?;
                if !bytes.starts_with(b"\x89PNG\r\n\x1a\n") {
                    return Err(crate::error::Error::new("invalid_png"));
                }
                storage::atomic_write(Path::new(path), &bytes)?;
                Ok(json!(path))
            } else {
                Ok(Value::Null)
            }
        }
        Operation::DeveloperTools => {
            window.open_devtools();
            Ok(Value::Null)
        }
        Operation::Ready => {
            window.show().map_err(crate::error::Error::diagnostic)?;
            Ok(json!(true))
        }
        Operation::ConfirmClose => {
            app.state::<Session>()
                .approved_close
                .lock()
                .map_err(crate::error::Error::diagnostic)?
                .insert(window.label().into());
            window.close().map_err(crate::error::Error::diagnostic)?;
            Ok(json!(true))
        }
        Operation::NewWindow => {
            let window =
                crate::windows::create(app, false).map_err(crate::error::Error::diagnostic)?;
            Ok(json!(window.label()))
        }
    }
}

#[tauri::command]
pub fn queue_document(app: AppHandle, label: String, payload: Value) -> Result<()> {
    let window = app
        .get_webview_window(&label)
        .ok_or_else(|| crate::error::Error::new("editor_window_not_found"))?;
    let state = app.state::<Session>();
    let ready = state
        .documents
        .lock()
        .map_err(crate::error::Error::diagnostic)?
        .queue(&label, payload);
    if let Some(payload) = ready {
        window
            .emit_to(window.label(), "load-file", payload)
            .map_err(crate::error::Error::diagnostic)?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn a_new_window_receives_its_document_once_in_either_readiness_order() {
        let payload = json!({"path":"Castle.aiv", "sourceBytes":[0,1,2,255]});
        for ready_first in [false, true] {
            let mut delivery = DocumentDelivery::default();
            let mut emitted = Vec::new();
            delivery.queue("other-window", json!({"path":"Other.aiv"}));
            if ready_first {
                emitted.extend(delivery.mark_ready("editor"));
            }
            emitted.extend(delivery.queue("editor", payload.clone()));
            emitted.extend(delivery.mark_ready("editor"));
            emitted.extend(delivery.mark_ready("editor"));
            assert_eq!(emitted, [payload.clone()]);
            assert_eq!(
                delivery.mark_ready("other-window").unwrap()["path"],
                "Other.aiv"
            );
        }
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum GameOperation {
    Buildings,
    Units,
    ResourceIcons,
    Balance,
    Maps,
    Map,
    Tiles,
}
#[tauri::command]
pub async fn game_request(
    app: AppHandle,
    operation: GameOperation,
    payload: Value,
) -> Result<Value> {
    tauri::async_runtime::spawn_blocking(move || {
        let root = match storage::installation(&app) {
            Ok(r) => r,
            Err(_) => {
                return Ok(match operation {
                    GameOperation::Maps => json!({"gameRoot":null,"maps":[]}),
                    GameOperation::Units | GameOperation::ResourceIcons => json!({}),
                    _ => Value::Null,
                })
            }
        };
        let cache = storage::user_data(&app)?;
        let resources = storage::resource(&app, "config")?
            .parent()
            .ok_or_else(|| crate::error::Error::new("invalid_resource_directory"))?
            .to_path_buf();
        use crate::game;
        match operation {
            GameOperation::Buildings => {
                game::load_building_assets(&root, &cache.join("game-building-assets"), &resources)
            }
            GameOperation::Units => game::load_unit_sprites(&root, &cache.join("game-unit-assets")),
            GameOperation::ResourceIcons => game::read_resource_icons(&root),
            GameOperation::Balance => game::read_installed_balance(&root),
            GameOperation::Maps => game::list_game_maps(&root),
            GameOperation::Map => game::read_map(Path::new(str_arg(&payload, "path")?), &root),
            GameOperation::Tiles => game::load_map_tiles(
                Path::new(str_arg(&payload, "path")?),
                &root,
                &cache.join("native-map-renderer"),
                &resources,
            ),
        }
        .map_err(crate::error::Error::diagnostic)
    })
    .await
    .map_err(crate::error::Error::diagnostic)?
}
