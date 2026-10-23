use crate::*;
pub(crate) struct Cursor<'a> {
    pub b: &'a [u8],
    pub p: usize,
    base: u64,
    pub limits: &'a Limits,
    blobs: usize,
}
impl<'a> Cursor<'a> {
    pub fn new(b: &'a [u8], base: u64, limits: &'a Limits) -> Self {
        Self {
            b,
            p: 0,
            base,
            limits,
            blobs: 0,
        }
    }
    pub fn take(&mut self, n: usize) -> Result<&'a [u8]> {
        let end = self
            .p
            .checked_add(n)
            .ok_or(Error::Corrupt("cursor overflow"))?;
        let v = self
            .b
            .get(self.p..end)
            .ok_or(Error::Corrupt("truncated span"))?;
        self.p = end;
        Ok(v)
    }
    pub fn align(&mut self) -> Result<()> {
        let pos = add(self.base, self.p as u64)?;
        self.take(usize_of((4 - pos % 4) % 4)?)?;
        Ok(())
    }
    pub fn finish(&self) -> Result<()> {
        if self.p == self.b.len() {
            Ok(())
        } else {
            Err(Error::Corrupt("trailing bytes"))
        }
    }
    pub fn u8(&mut self) -> Result<u8> {
        Ok(self.take(1)?[0])
    }
    pub fn i16(&mut self) -> Result<i16> {
        Ok(i16::from_le_bytes(self.take(2)?.try_into().unwrap()))
    }
    pub fn u32(&mut self) -> Result<u32> {
        Ok(u32::from_le_bytes(self.take(4)?.try_into().unwrap()))
    }
    pub fn i32(&mut self) -> Result<i32> {
        Ok(i32::from_le_bytes(self.take(4)?.try_into().unwrap()))
    }
    pub fn u64(&mut self) -> Result<u64> {
        Ok(u64::from_le_bytes(self.take(8)?.try_into().unwrap()))
    }
    pub fn i64(&mut self) -> Result<i64> {
        Ok(i64::from_le_bytes(self.take(8)?.try_into().unwrap()))
    }
    pub fn f(&mut self) -> Result<F32> {
        Ok(F32(self.u32()?))
    }
    pub fn floats<const N: usize>(&mut self) -> Result<[F32; N]> {
        let mut v = [F32(0); N];
        for x in &mut v {
            *x = self.f()?;
        }
        Ok(v)
    }
    pub fn count(&mut self, cap: usize, min: usize) -> Result<usize> {
        let n = usize::try_from(self.i32()?).map_err(|_| Error::Corrupt("negative count"))?;
        if n > cap {
            return Err(Error::Limit("count"));
        }
        if min != 0 && n > (self.b.len() - self.p) / min {
            return Err(Error::Corrupt("count exceeds span"));
        }
        Ok(n)
    }
    pub fn array_count(&mut self, min: usize) -> Result<usize> {
        self.count(self.limits.array_elements, min)
    }
    fn utf8(b: &[u8]) -> Result<String> {
        String::from_utf8(b.to_vec()).map_err(|_| Error::Corrupt("invalid UTF-8"))
    }
    pub fn string(&mut self) -> Result<String> {
        let n = self.count(self.limits.string_bytes, 1)?;
        let s = Self::utf8(self.take(n)?)?;
        self.align()?;
        Ok(s)
    }
    pub fn cstr(&mut self) -> Result<String> {
        let remaining = &self.b[self.p..];
        let end = remaining
            .iter()
            .take(self.limits.string_bytes.saturating_add(1))
            .position(|x| *x == 0)
            .ok_or(Error::Corrupt("unterminated or oversized C string"))?;
        let s = Self::utf8(self.take(end)?)?;
        self.take(1)?;
        Ok(s)
    }
    pub fn blob(&mut self, array: bool) -> Result<Vec<u8>> {
        let cap = if array {
            self.limits.array_elements.min(self.limits.blob_bytes)
        } else {
            self.limits.blob_bytes
        };
        let n = self.count(cap, 1)?;
        self.blobs = self.blobs.checked_add(n).ok_or(Error::Limit("blobs"))?;
        if self.blobs > self.limits.blob_bytes {
            return Err(Error::Limit("aggregate blobs"));
        }
        let v = self.take(n)?.to_vec();
        self.align()?;
        Ok(v)
    }
    pub fn ptr(&mut self) -> Result<PPtr> {
        Ok(PPtr {
            file_id: self.i32()?,
            path_id: self.i64()?,
        })
    }
}
