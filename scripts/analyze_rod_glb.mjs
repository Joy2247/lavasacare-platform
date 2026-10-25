// Analyze the Rod of Asclepius GLB geometry: radial histogram (staff vs snake),
// head-region analysis, eye-bump candidates. Pure numeric — no WebGL needed.
import { readFileSync } from "node:fs";

const path = process.argv[2] ?? "public/models/medical-symbol.glb";
const buf = readFileSync(path);
const jsonLen = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.toString("utf8", 20, 20 + jsonLen));

// BIN chunk
const binChunkLen = buf.readUInt32LE(20 + jsonLen);
const binStart = 20 + jsonLen + 8;

const COMP = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const NCOMP = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

function readAccessor(ai) {
  const acc = gltf.accessors[ai];
  const bv = gltf.bufferViews[acc.bufferView];
  const byteOffset = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0) + binStart;
  const stride = bv.byteStride ?? NCOMP[acc.type] * COMP[acc.componentType];
  const n = NCOMP[acc.type];
  const out = new Float32Array(acc.count * n);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let p = byteOffset;
  if (stride === n * COMP[acc.componentType]) {
    for (let i = 0; i < acc.count; i++)
      for (let k = 0; k < n; k++)
        out[i * n + k] = dv.getFloat32(p + (i * stride + k * 4), true);
  } else {
    for (let i = 0; i < acc.count; i++)
      for (let k = 0; k < n; k++)
        out[i * n + k] = dv.getFloat32(p + i * stride + k * 4, true);
  }
  return { data: out, count: acc.count, n };
}

function readIndices(ai) {
  const acc = gltf.accessors[ai];
  const bv = gltf.bufferViews[acc.bufferView];
  const byteOffset = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0) + binStart;
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const out = new Uint32Array(acc.count);
  if (acc.componentType === 5125) {
    for (let i = 0; i < acc.count; i++) out[i] = dv.getUint32(byteOffset + i * 4, true);
  } else if (acc.componentType === 5123) {
    for (let i = 0; i < acc.count; i++) out[i] = dv.getUint16(byteOffset + i * 2, true);
  } else throw new Error("index type " + acc.componentType);
  return out;
}

const prim = gltf.meshes[0].primitives[0];
const pos = readAccessor(prim.attributes.POSITION);
const idx = readIndices(prim.indices);
const P = pos.data;
const V = pos.count;
console.log(`verts=${V} tris=${idx.length / 3}`);

// radial histogram
const H = 40, RMAX = 0.22;
const hist = new Float64Array(H);
for (let i = 0; i < V; i++) {
  const r = Math.hypot(P[i * 3], P[i * 3 + 2]);
  hist[Math.min(H - 1, Math.floor((r / RMAX) * H))]++;
}
console.log("\nradius histogram (bin = r):count");
for (let b = 0; b < H; b++) {
  const r0 = ((b + 0.5) / H) * RMAX;
  if (hist[b] > 0) console.log(`r≈${r0.toFixed(3)} : ${hist[b]}`);
}

// per-y-slice stats: which radii exist at each height
console.log("\nY-slice radial ranges:");
for (let s = 0; s < 10; s++) {
  const y0 = s / 10, y1 = (s + 1) / 10;
  let rmin = Infinity, rmax = -Infinity, n = 0;
  for (let i = 0; i < V; i++) {
    const y = P[i * 3 + 1];
    if (y >= y0 && y < y1) {
      const r = Math.hypot(P[i * 3], P[i * 3 + 2]);
      rmin = Math.min(rmin, r); rmax = Math.max(rmax, r); n++;
    }
  }
  if (n) console.log(`y ${y0.toFixed(1)}-${y1.toFixed(1)}: n=${n} r=[${rmin.toFixed(3)}, ${rmax.toFixed(3)}]`);
}

// head region: top 12%
const yCut = 0.88;
const head = [];
for (let i = 0; i < V; i++) {
  if (P[i * 3 + 1] >= yCut) head.push(i);
}
console.log(`\nhead region (y>=${yCut}): ${head.length} verts`);
if (head.length) {
  let cx = 0, cy = 0, cz = 0;
  for (const i of head) { cx += P[i*3]; cy += P[i*3+1]; cz += P[i*3+2]; }
  cx /= head.length; cy /= head.length; cz /= head.length;
  let rmax = 0;
  for (const i of head) rmax = Math.max(rmax, Math.hypot(P[i*3]-cx, P[i*3+1]-cy, P[i*3+2]-cz));
  console.log(`head centroid=(${cx.toFixed(3)}, ${cy.toFixed(3)}, ${cz.toFixed(3)}) maxDist=${rmax.toFixed(3)}`);

  // radial distance-from-head-center histogram by direction (find eye bumps):
  // bucket by (theta around Y) x (phi) coarse grid, find local protrusions
  // simpler: verts with dist > 0.75*rmax → cluster by direction
  const bumps = head.filter(i => {
    const d = Math.hypot(P[i*3]-cx, P[i*3+1]-cy, P[i*3+2]-cz);
    return d > 0.8 * rmax;
  });
  console.log(`verts beyond 0.8*rmax: ${bumps.length}`);
  // cluster bumps greedily
  const clusters = [];
  for (const i of bumps) {
    const p = [P[i*3], P[i*3+1], P[i*3+2]];
    let found = null;
    for (const c of clusters) {
      if (Math.hypot(p[0]-c.c[0], p[1]-c.c[1], p[2]-c.c[2]) < 0.03) { found = c; break; }
    }
    if (found) { found.n++; found.c = found.c.map((v,k)=>(v*(found.n-1)+p[k])/found.n); }
    else clusters.push({ c: p, n: 1 });
  }
  clusters.sort((a,b)=>b.n-a.n);
  console.log("bump clusters (top 8):");
  for (const c of clusters.slice(0, 8))
    console.log(`  n=${c.n} at (${c.c[0].toFixed(3)}, ${c.c[1].toFixed(3)}, ${c.c[2].toFixed(3)})`);

  // how far below yCut does the head-ball extend? find neck: min y of verts within 1.2*rmax of head centroid
  let neckMinY = 1;
  for (let i = 0; i < V; i++) {
    const d = Math.hypot(P[i*3]-cx, P[i*3+1]-cy, P[i*3+2]-cz);
    if (d < 1.25 * rmax) neckMinY = Math.min(neckMinY, P[i*3+1]);
  }
  console.log(`head-ball extends down to y≈${neckMinY.toFixed(3)}`);
}

// staff estimate: verts with y in mid-range (0.35..0.6) and small r
let staffR = 0;
const staffBins = new Float64Array(60);
for (let i = 0; i < V; i++) {
  const y = P[i*3+1];
  if (y > 0.3 && y < 0.65) {
    const r = Math.hypot(P[i*3], P[i*3+2]);
    if (r < 0.12) staffBins[Math.floor((r/0.12)*60)]++;
  }
}
let best = 0, bestB = -1;
for (let b = 0; b < 60; b++) if (staffBins[b] > best) { best = staffBins[b]; bestB = b; }
if (bestB >= 0) {
  staffR = ((bestB + 0.5) / 60) * 0.12;
  console.log(`\nstaff surface radius ≈ ${staffR.toFixed(4)} (peak bin n=${best})`);
}
