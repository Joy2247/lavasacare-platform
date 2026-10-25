// Focused shallow-relief scan on the head's rear-dorsal region
// (x in [-0.10, 0.01], y in [0.79, 0.875]) where the sculpted eye ovals
// appear in profile renders. Looser Laplacian thresholds.
import { readFileSync } from "node:fs";

const path = process.argv[2] ?? "public/models/medical-symbol.glb";
const buf = readFileSync(path);
const jsonLen = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.toString("utf8", 20, 20 + jsonLen));
const binStart = 20 + jsonLen + 8;
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

function readAccessor(ai) {
  const acc = gltf.accessors[ai];
  const bv = gltf.bufferViews[acc.bufferView];
  const off = binStart + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
  const n = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[acc.type];
  const out = new Float32Array(acc.count * n);
  for (let i = 0; i < acc.count; i++)
    for (let k = 0; k < n; k++)
      out[i * n + k] = dv.getFloat32(off + (i * n + k) * 4, true);
  return out;
}

const prim = gltf.meshes[0].primitives[0];
const P = readAccessor(prim.attributes.POSITION);
const N = readAccessor(prim.attributes.NORMAL);
const V = P.length / 3;

const idx = [];
for (let i = 0; i < V; i++) {
  const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2];
  const r = Math.hypot(x, z);
  if (x >= -0.105 && x <= 0.012 && y >= 0.79 && y <= 0.875 && r >= 0.028) idx.push(i);
}
console.log(`scan region: ${idx.length} verts`);

const CELL = 0.018;
const grid = new Map();
const key = (x, y, z) => `${Math.floor(x / CELL)},${Math.floor(y / CELL)},${Math.floor(z / CELL)}`;
idx.forEach((vi, k) => {
  const kk = key(P[vi*3], P[vi*3+1], P[vi*3+2]);
  if (!grid.has(kk)) grid.set(kk, []);
  grid.get(kk).push(k);
});

const proud = [];
for (let k = 0; k < idx.length; k++) {
  const vi = idx[k];
  const px = P[vi*3], py = P[vi*3+1], pz = P[vi*3+2];
  let sx = 0, sy = 0, sz = 0, n = 0;
  const c0 = [Math.floor(px/CELL), Math.floor(py/CELL), Math.floor(pz/CELL)];
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) {
    const cell = grid.get(`${c0[0]+a},${c0[1]+b},${c0[2]+c}`);
    if (!cell) continue;
    for (const k2 of cell) {
      if (k2 === k) continue;
      const vj = idx[k2];
      const dx = P[vj*3]-px, dy = P[vj*3+1]-py, dz = P[vj*3+2]-pz;
      if (dx*dx + dy*dy + dz*dz < CELL*CELL) { sx += P[vj*3]; sy += P[vj*3+1]; sz += P[vj*3+2]; n++; }
    }
  }
  if (n < 4) continue;
  sx /= n; sy /= n; sz /= n;
  const ox = px - sx, oy = py - sy, oz = pz - sz;
  const offLen = Math.hypot(ox, oy, oz);
  if (offLen < 0.0012) continue;
  const dot = (ox*N[vi*3] + oy*N[vi*3+1] + oz*N[vi*3+2]) / (offLen || 1);
  if (dot > 0.25) proud.push({ vi, p: [px, py, pz], off: offLen });
}
console.log(`proud (loose): ${proud.length}`);

const clusters = [];
for (const v of proud) {
  let f = null;
  for (const c of clusters)
    if (Math.hypot(v.p[0]-c.c[0], v.p[1]-c.c[1], v.p[2]-c.c[2]) < 0.016) { f = c; break; }
  if (f) {
    f.n++; f.sumOff += v.off; f.maxOff = Math.max(f.maxOff, v.off);
    for (let j = 0; j < 3; j++) f.c[j] += (v.p[j] - f.c[j]) / f.n;
  } else clusters.push({ c: [...v.p], n: 1, sumOff: v.off, maxOff: v.off });
}
clusters.sort((a, b) => b.n * b.sumOff / b.n - a.n * a.sumOff / a.n);
clusters.sort((a, b) => b.sumOff - a.sumOff);
console.log("\ntop clusters by total relief (n, mean, maxOff):");
for (const c of clusters.slice(0, 14)) {
  console.log(
    `  n=${String(c.n).padStart(4)} mean=(${c.c[0].toFixed(3)}, ${c.c[1].toFixed(3)}, ${c.c[2].toFixed(3)})`,
    `maxOff=${c.maxOff.toFixed(4)} rel=${c.sumOff.toFixed(4)}`
  );
}
