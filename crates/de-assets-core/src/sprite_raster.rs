//! Fixed-triangle adaptation of Pillow Draw.c at
//! 293218ad059d994baf1777d882911bed6a49704a (see PROVENANCE.md).
//! Copyright (c) 1996-2006 by Fredrik Lundh
//! Copyright (c) 1997-2006 by Secret Labs AB.
//! Full MIT-CMU notice: ../notices/Pillow-LICENSE (verbatim).
use crate::*;

pub(crate) struct RasterWork<'a> {
    pub(crate) work: &'a mut Work,
    visits: u64,
    cap: u64,
}
impl<'a> RasterWork<'a> {
    pub(crate) fn new(work: &'a mut Work, cap: u64) -> Self {
        Self {
            work,
            visits: 0,
            cap,
        }
    }
    pub(crate) fn visit(&mut self) -> Result<()> {
        self.work.charge(1)?;
        if self.visits >= self.cap {
            return Err(Error::Limit("sprite raster visits"));
        }
        self.visits += 1;
        Ok(())
    }
}
#[derive(Clone, Copy, Debug)]
pub(crate) struct Pt {
    pub(crate) x: i32,
    pub(crate) y: i32,
}
#[derive(Clone, Copy)]
struct Edge {
    x0: i32,
    y0: i32,
    xmin: i32,
    xmax: i32,
    ymin: i32,
    ymax: i32,
    dx: f32,
}
fn edge(a: Pt, z: Pt) -> Edge {
    Edge {
        x0: a.x,
        y0: a.y,
        xmin: a.x.min(z.x),
        xmax: a.x.max(z.x),
        ymin: a.y.min(z.y),
        ymax: a.y.max(z.y),
        dx: if a.y == z.y {
            0.0
        } else {
            (z.x - a.x) as f32 / (z.y - a.y) as f32
        },
    }
}
fn up(x: f32) -> i32 {
    if x >= 0.0 {
        (x + 0.5).floor() as i32
    } else {
        -((-x + 0.5).floor() as i32)
    }
}
fn down(x: f32) -> i32 {
    if x >= 0.0 {
        (x - 0.5).ceil() as i32
    } else {
        -((-x - 0.5).ceil() as i32)
    }
}
// A fixed triangle only. ImageDraw casts input coordinates to int first. No
// multisampling, gamma, AA, blending or GPU coverage is claimed.
pub(crate) fn polygon(
    tri: [Pt; 3],
    local_size: [usize; 2],
    origin: Pt,
    canvas_width: usize,
    canvas_height: usize,
    out: &mut [u8],
    b: &mut RasterWork<'_>,
) -> Result<()> {
    let [w, h] = local_size;
    if out.len()
        != canvas_width
            .checked_mul(canvas_height)
            .ok_or(Error::Limit("coverage size"))?
    {
        return Err(Error::Corrupt("coverage shape"));
    }
    if w == 0 || h == 0 {
        return b.work.check();
    }
    if tri
        .iter()
        .any(|p| p.x.unsigned_abs() > 16384 || p.y.unsigned_abs() > 16384)
    {
        return Err(Error::Limit("raster coordinates"));
    }
    let mut edges = [
        edge(tri[0], tri[1]),
        edge(tri[1], tri[2]),
        edge(tri[2], tri[0]),
    ];
    let mut n = 3;
    // Pillow merges consecutive horizontal edges with the same direction.
    if tri[0].y == tri[1].y
        && tri[1].y == tri[2].y
        && ((tri[2].x > tri[1].x && tri[1].x > tri[0].x)
            || (tri[2].x < tri[1].x && tri[1].x < tri[0].x))
    {
        edges[0] = edge(tri[0], tri[2]);
        edges[1] = edge(tri[2], tri[0]);
        n = 2;
    }
    let mut hline = |x0: i32, y: i32, x1: i32, b: &mut RasterWork<'_>| -> Result<()> {
        let dest_y = y + origin.y;
        if y < 0 || y >= h as i32 || dest_y < 0 || dest_y >= canvas_height as i32 {
            return Ok(());
        }
        let lo = x0.max(0).max(-origin.x);
        let hi = x1.min(w as i32 - 1).min(canvas_width as i32 - 1 - origin.x);
        for x in lo..=hi {
            b.visit()?;
            out[dest_y as usize * canvas_width + (x + origin.x) as usize] = 255;
        }
        Ok(())
    };
    let mut table = [edges[0]; 3];
    let mut count = 0;
    let mut ymin = h as i32 - 1;
    let mut ymax = 0;
    for e in &edges[..n] {
        b.visit()?;
        ymin = ymin.min(e.ymin);
        ymax = ymax.max(e.ymax);
        if e.ymin == e.ymax {
            hline(e.xmin, e.ymin, e.xmax, b)?
        } else {
            table[count] = *e;
            count += 1;
        }
    }
    ymin = ymin.max(0);
    ymax = ymax.min(h as i32);
    for y in ymin..=ymax {
        b.visit()?;
        let mut xs = [0f32; 6];
        let mut j = 0;
        for i in 0..count {
            b.visit()?;
            let e = table[i];
            if y < e.ymin || y > e.ymax {
                continue;
            }
            xs[j] = (y - e.y0) as f32 * e.dx + e.x0 as f32;
            j += 1;
            if y == e.ymax && y < ymax {
                xs[j] = xs[j - 1];
                j += 1;
            } else if (y == e.ymin || y == e.ymax) && e.dx != 0.0 {
                for z in table.iter().take(i) {
                    b.visit()?;
                    if (y != z.ymin && y != z.ymax) || z.dx == 0.0 {
                        continue;
                    }
                    if xs[j - 1].round() == ((y - z.y0) as f32 * z.dx + z.x0 as f32).round() {
                        let off = if y == e.ymax { -1 } else { 1 };
                        let a = (y + off - e.y0) as f32 * e.dx + e.x0 as f32;
                        if y + off >= z.ymin && y + off <= z.ymax {
                            let c = (y + off - z.y0) as f32 * z.dx + z.x0 as f32;
                            if xs[j - 1] > a + 1.0 && xs[j - 1] > c + 1.0 {
                                xs[j - 1] = a.max(c).round() + 1.0
                            } else if xs[j - 1] < a - 1.0 && xs[j - 1] < c - 1.0 {
                                xs[j - 1] = a.min(c).round() - 1.0
                            }
                            break;
                        }
                    }
                }
            }
        }
        xs[..j].sort_by(f32::total_cmp);
        for i in (1..j).step_by(2) {
            hline(up(xs[i - 1]), y, down(xs[i]), b)?
        }
    }
    b.work.check()
}
