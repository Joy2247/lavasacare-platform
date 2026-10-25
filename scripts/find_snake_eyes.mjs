// Locate the snake HEAD and its EYE BUMPS in the Rod of Asclepius GLB.
// The head sits just below the top finial collar. Strategy:
//  1. fine y-slices 0.80..0.92 -> collar vs coil radial bands
//  2. head blob = verts y in [0.70,0.875], r>0.045 -> bbox + PCA-ish extents
//  3. eye bumps = local protrusions: verts far from the head's local surface
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
const V = P.length / 3;
const yOf = (i) => P[i * 3 + 1];
const rOf = (i) => Math.hypot(P[i * 3], P[i * 3 + 2]);

// ---- 1. fine y-slices: radial histogram per 0.01 band
console.log("== fine y-slices (r histogram, bins of 0.012 up to 0.20) ==");
for (let s = 80; s <= 92; s += 2) {
  const y0 = s / 100, y1 = y0 + 0.02;
  const bins = new Float64Array(17);
  for (let i = 0; i < V; i++) {
    const y = yOf(i);
    if (y >= y0 && y < y1) bins[Math.min(16, Math.floor(rOf(i) / 0.012))]++;
  }
  const row = [];
  for (let b = 0; b < 17; b++) if (bins[b] > 20) row.push(`${(b * 0.012).toFixed(3)}:${bins[b]}`);
  console.log(`y ${y0.toFixed(2)}-${y1.toFixed(2)}: ${row.join(" ")}`);
}

// ---- 2. head blob
const head = [];
for (let i = 0; i < V; i++) {
  const y = yOf(i);
  const r = rOf(i);
  if (y >= 0.70 && y <= 0.875 && r >= 0.045) head.push(i);
}
let cx = 0, cy = 0, cz = 0;
for (const i of head) { cx += P[i*3]; cy += yOf(i); cz += P[i*3+2]; }
cx /= head.length; cy /= head.length; cz /= head.length;
let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, minZ = 1e9, maxZ = -1e9;
for (const i of head) {
  minX = Math.min(minX, P[i*3]); maxX = Math.max(maxX, P[i*3]);
  minY = Math.min(minY, yOf(i)); maxY = Math.max(maxY, yOf(i));
  minZ = Math.min(minZ, P[i*3+2]); maxZ = Math.max(maxZ, P[i*3+2]);
}
console.log(`\n== head blob (y 0.70-0.875, r>=0.045): ${head.length} verts`);
console.log(`   centroid=(${cx.toFixed(3)}, ${cy.toFixed(3)}, ${cz.toFixed(3)})`);
console.log(`   x[${minX.toFixed(3)}, ${maxX.toFixed(3)}] y[${minY.toFixed(3)}, ${maxY.toFixed(3)}] z[${minZ.toFixed(3)}, ${maxZ.toFixed(3)}]`);

// ---- 3. eye bumps: head is a flattened tube-ish blob; eyes protrude from the
// upper side. Compute for each vert the distance beyond the blob's "core":
// core = verts within 40th percentile of dist from centroid; bump = dist >
// p85 of dist. Cluster the p85 set.
const dists = head.map((i) => Math.hypot(P[i*3]-cx, yOf(i)-cy, P[i*3+2]-cz));
const sorted = [...dists].sort((a, b) => a - b);
const p85 = sorted[Math.floor(sorted.length * 0.85)];
const bumps = [];
for (let k = 0; k < head.length; k++) if (dists[k] >= p85) bumps.push(head[k]);
console.log(`\n== bump candidates (dist>=p85=${p85.toFixed(3)}): ${bumps.length} verts`);
// greedy cluster (tight 0.025)
const clusters = [];
for (const i of bumps) {
  const p = [P[i*3], yOf(i), P[i*3+2]];
  let f = null;
  for (const c of clusters)
    if (Math.hypot(p[0]-c.c[0], p[1]-c.c[1], p[2]-c.c[2]) < 0.025) { f = c; break; }
  if (f) { f.n++; for (let k = 0; k < 3; k++) f.c[k] += (p[k] - f.c[k]) / f.n; }
  else clusters.push({ c: [...p], n: 1 });
}
clusters.sort((a, b) => b.n - a.n);
for (const c of clusters.slice(0, 12))
  console.log(`   n=${String(c.n).padStart(4)} at (${c.c[0].toFixed(3)}, ${c.c[1].toFixed(3)}, ${c.c[2].toFixed(3)}) r=${Math.hypot(c.c[0], c.c[2]).toFixed(3)}`);

// ---- 4. where does the top coil turn sit? (max y of coil verts by radius band)
console.log("\n== coil top: max y per radius band (r 0.04-0.20, step 0.02) ==");
for (let b = 2; b < 10; b++) {
  const r0 = b * 0.02, r1 = r0 + 0.02;
  let my = -1, cnt = 0;
  for (let i = 0; i < V; i++) {
    const r = rOf(i);
    if (r >= r0 && r < r1) { my = Math.max(my, yOf(i)); cnt++; }
  }
  if (cnt) console.log(`   r [${r0.toFixed(2)}, ${r1.toFixed(2)}): max y = ${my.toFixed(3)} (n=${cnt})`);
}
