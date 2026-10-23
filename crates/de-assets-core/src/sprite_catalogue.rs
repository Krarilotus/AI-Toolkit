use crate::*;

/// Source-confirmed material resource families, not a generic `_m` suffix rule.
/// The keys and catalogue are scoped to this opened serialized index.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum RawMaskState {
    Paired(ObjectKey),
    ExplicitlyUnmasked,
    UnknownFamily,
}

// spriteLoader.cs at 7e199e6f0818173794bdeeb0c4c32d74500b0eec,
// lines 246-285 and 465-509. Animation/GM selectors do not belong here.
const NAMES: [&str; 5] = [
    "body15Sprites",
    "body15Sprites_m",
    "body16Sprites",
    "body16Sprites_m",
    "AllTileSprites",
];

/// One background preparation/name pass; reconstructing a plane never rescans
/// the object inventory. No persistent cache or source-hash promise is made.
pub struct SpritePlaneProvider<'a> {
    pub(crate) index: &'a SerializedIndex,
    pub(crate) resolver: &'a StreamResolver,
    names: [NameMatch; 5],
}
impl StreamResolver {
    pub fn prepare_sprite_planes<'a>(
        &'a self,
        index: &'a SerializedIndex,
        work: &mut Work,
    ) -> Result<SpritePlaneProvider<'a>> {
        self.check_index(index)?;
        let mut found = index.find_names(28, &NAMES, work)?;
        let names = NAMES.map(|n| found.remove(n).expect("queried name"));
        work.check()?;
        if index.source.stamp()? != index.stamp {
            return Err(Error::ChangedSource);
        }
        Ok(SpritePlaneProvider {
            index,
            resolver: self,
            names,
        })
    }
}
impl SpritePlaneProvider<'_> {
    pub(crate) fn mask_state(
        &self,
        base: ObjectKey,
        name: &str,
        work: &mut Work,
    ) -> Result<RawMaskState> {
        work.charge(1)?;
        let slot = match name {
            "body15Sprites" => 0,
            "body16Sprites" => 2,
            "AllTileSprites" => 4,
            _ => return Ok(RawMaskState::UnknownFamily),
        };
        let unique = |slot: usize| match &self.names[slot] {
            NameMatch::Zero => Err(Error::NotFound),
            NameMatch::One(k) => Ok(*k),
            NameMatch::Many(_) => Err(Error::Ambiguous),
        };
        if unique(slot)? != base {
            return Err(Error::Corrupt("resource family key"));
        }
        if slot == 4 {
            Ok(RawMaskState::ExplicitlyUnmasked)
        } else {
            Ok(RawMaskState::Paired(unique(slot + 1)?))
        }
    }
}
