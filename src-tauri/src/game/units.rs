//! Classic marker previews extracted locally. Keep the source mapping together;
//! mounted units compose their matching rider layer without image resizing.
use super::{
    gm1::{composite, Gm1, Picture},
    graphics::resolve_graphics,
    hash, png_bytes, read, u32le, Result,
};
use serde_json::{json, Value};
use std::{fs, path::Path};
const SOURCES: &[(u16, &str, Option<&str>)] = &[
    (1, "body_siege_engineer", None),
    (2, "body_mangonel", None),
    (3, "body_ballista", None),
    (4, "body_trebutchet", None),
    (5, "body_arab_ballista", None),
    (6, "body_archer", None),
    (7, "body_crossbowman", None),
    (8, "body_spearman", None),
    (9, "body_pikeman", None),
    (10, "body_maceman", None),
    (11, "body_swordsman", None),
    (12, "body_knight", Some("body_knight_top")),
    (13, "body_arab_slave", None),
    (14, "body_arab_slinger", None),
    (15, "body_arab_assasin", None),
    (16, "body_arab_shortbow", None),
    (17, "body_horse_archer", Some("body_horse_archer_top")),
    (18, "body_arab_swordsman", None),
    (19, "body_arab_grenadier", None),
    (20, "body_brazier", None),
    (21, "anim_flag_small", None),
];
// Body GM1 palettes 1..=8 are the player colour tables. Palette 0 is the
// authoring palette and can contain diagnostic magenta/cyan colours; it is
// not a neutral player. Use the first game's player colour consistently.
const PREVIEW_PLAYER_PALETTE: usize = 1;
fn decode(path: &Path) -> Result<Picture> {
    let gm = Gm1::read(path)?;
    let mut p = gm.sprite(
        0,
        if gm.kind == 2 {
            Some(PREVIEW_PLAYER_PALETTE)
        } else {
            None
        },
    )?;
    p.dx = -(u32le(&gm.bytes, 0x48)? as i32);
    p.dy = -(u32le(&gm.bytes, 0x4c)? as i32);
    Ok(p)
}
fn compose(base: Picture, top: Picture) -> Picture {
    let left = base.dx.min(top.dx);
    let upper = base.dy.min(top.dy);
    let width = (base.dx + base.width as i32).max(top.dx + top.width as i32) - left;
    let height = (base.dy + base.height as i32).max(top.dy + top.height as i32) - upper;
    let mut out = Picture::empty(width as usize, height as usize, left, upper);
    composite(&mut out, &base, base.dx - left, base.dy - upper);
    composite(&mut out, &top, top.dx - left, top.dy - upper);
    out
}
fn trim(p: Picture) -> Picture {
    let (mut left, mut top, mut right, mut bottom) = (p.width, p.height, 0, 0);
    for y in 0..p.height {
        for x in 0..p.width {
            if p.rgba[(y * p.width + x) * 4 + 3] != 0 {
                left = left.min(x);
                top = top.min(y);
                right = right.max(x + 1);
                bottom = bottom.max(y + 1);
            }
        }
    }
    if right == 0 {
        return p;
    }
    let mut out = Picture::empty(
        right - left,
        bottom - top,
        p.dx + left as i32,
        p.dy + top as i32,
    );
    composite(&mut out, &p, -(left as i32), -(top as i32));
    out
}
pub fn load_unit_sprites(root: &Path, cache_root: &Path) -> Result<Value> {
    super::cache::extract(cache_root, || extract_unit_sprites(root, cache_root))
}
fn extract_unit_sprites(root: &Path, cache_root: &Path) -> Result<Value> {
    let graphics = resolve_graphics(root)?;
    let revision = hash(format!("unit-previews-v2:{}", graphics.revision).as_bytes());
    fs::create_dir_all(cache_root).map_err(|e| e.to_string())?;
    let cache = cache_root.join(format!("{revision}.json"));
    if let Ok(bytes) = read(&cache) {
        if let Ok(v) = serde_json::from_slice::<Value>(&bytes) {
            if v["sprites"].as_object().is_some_and(|sprites| {
                sprites
                    .values()
                    .all(|p| p["path"].as_str().is_some_and(|p| Path::new(p).is_file()))
            }) {
                return Ok(v);
            }
        }
    }
    let mut sprites = serde_json::Map::new();
    let mut warnings = Vec::new();
    for &(id, name, rider) in SOURCES {
        let decoded = (|| {
            let mut p = decode(&graphics.file(name))?;
            if let Some(rider) = rider {
                p = compose(p, decode(&graphics.file(rider))?)
            }
            Ok::<_, String>(trim(p))
        })();
        match decoded {
            Ok(p) => {
                let path = cache_root.join(format!("{revision}-{id}.png"));
                fs::write(&path, png_bytes(p.width, p.height, &p.rgba)?)
                    .map_err(|e| e.to_string())?;
                sprites.insert(id.to_string(),json!({"path":path,"width":p.width,"height":p.height,"dx":p.dx,"dy":p.dy,"source":name,"frame":0,"playerPalette":PREVIEW_PLAYER_PALETTE}));
            }
            Err(e) => warnings.push(format!("{name}: {e}")),
        }
    }
    let value = json!({"assetRevision":revision,"sprites":sprites,"warnings":warnings});
    fs::write(
        cache,
        serde_json::to_vec(&value).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;
    Ok(value)
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn trimming_preserves_scale_and_origin() {
        let mut p = Picture::empty(4, 4, -2, -3);
        p.rgba[(1 * 4 + 2) * 4..(1 * 4 + 2) * 4 + 4].copy_from_slice(&[1, 2, 3, 255]);
        let p = trim(p);
        assert_eq!((p.width, p.height, p.dx, p.dy), (1, 1, 0, -2));
        assert_eq!(p.rgba, [1, 2, 3, 255]);
    }

    #[test]
    fn body_preview_uses_player_palette_not_authoring_palette() {
        // One indexed pixel with deliberately distinct authoring/player
        // colours verifies the actual file decoder's palette selection.
        let data_at = 88 + 5120 + 4 + 4 + 16;
        let mut bytes = vec![0u8; data_at + 2];
        bytes[12..16].copy_from_slice(&1u32.to_le_bytes());
        bytes[20..24].copy_from_slice(&2u32.to_le_bytes());
        bytes[88 + 2..88 + 4].copy_from_slice(&0x7c1fu16.to_le_bytes());
        bytes[88 + 512 + 2..88 + 512 + 4].copy_from_slice(&0x001fu16.to_le_bytes());
        bytes[88 + 5120 + 4..88 + 5120 + 8].copy_from_slice(&2u32.to_le_bytes());
        bytes[88 + 5120 + 8..88 + 5120 + 10].copy_from_slice(&1u16.to_le_bytes());
        bytes[88 + 5120 + 10..88 + 5120 + 12].copy_from_slice(&1u16.to_le_bytes());
        bytes[data_at..].copy_from_slice(&[0, 1]);
        let path =
            std::env::temp_dir().join(format!("toolkit-unit-palette-{}.gm1", std::process::id()));
        fs::write(&path, bytes).unwrap();
        let result = decode(&path);
        fs::remove_file(path).unwrap();
        assert_eq!(result.unwrap().rgba, [0, 0, 255, 255]);
    }
}
