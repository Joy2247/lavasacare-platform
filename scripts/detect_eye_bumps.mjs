// Detect sculpted protrusions (eye bumps) on the snake head via local
// Laplacian: a vertex is "proud" if it sits >2mm outside the mean of its
// neighbors (r=0.022), along its own normal. Cluster the proud verts.
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

// head region subset
const idx = [];
for (let i = 0; i < V; i++) {
  const y = P[i * 3 + 1], r = Math.hypot(P[i * 3], P[i * 3 + 2]);
  if (y >= 0.72 && y <= 0.875 && r >= 0.035) idx.push(i);
}
console.log(`head subset: ${idx.length} verts`);

// grid hash for neighbor search
const CELL = 0.022;
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
  const cx0 = Math.floor(px / CELL), cy0 = Math.floor(py / CELL), cz0 = Math.floor(pz / CELL);
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) {
    const cell = grid.get(`${cx0+a},${cy0+b},${cz0+c}`);
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
  if (offLen < 0.0025) continue;
  const dot = (ox*N[vi*3] + oy*N[vi*3+1] + oz*N[vi*3+2]) / (offLen || 1);
  if (dot > 0.5) proud.push({ vi, p: [px, py, pz], off: offLen });
}
console.log(`proud verts: ${proud.length}`);

// greedy cluster
const clusters = [];
for (const v of proud) {
  let f = null;
  for (const c of clusters)
    if (Math.hypot(v.p[0]-c.c[0], v.p[1]-c.c[1], v.p[2]-c.c[2]) < 0.02) { f = c; break; }
  if (f) {
    f.n++; f.maxOff = Math.max(f.maxOff, v.off);
    for (let j = 0; j < 3; j++) f.c[j] += (v.p[j] - f.c[j]) / f.n;
    if (v.off > f.apexOff) { f.apexOff = v.off; f.apex = v.p; }
  } else clusters.push({ c: [...v.p], n: 1, maxOff: v.off, apexOff: v.off, apex: [...v.p] });
}
clusters.sort((a, b) => b.n - a.n);
console.log("\ntop proud clusters (n, mean, apex, apexOff):");
for (const c of clusters.slice(0, 10)) {
  console.log(
    `  n=${String(c.n).padStart(4)} mean=(${c.c[0].toFixed(3)}, ${c.c[1].toFixed(3)}, ${c.c[2].toFixed(3)})`,
    `apex=(${c.apex[0].toFixed(3)}, ${c.apex[1].toFixed(3)}, ${c.apex[2].toFixed(3)}) off=${c.apexOff.toFixed(4)}`
  );
}
