// Refine the snake's two eye-bump apex positions (head points +X, eyes on ±Z sides).
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

const P = readAccessor(gltf.meshes[0].primitives[0].attributes.POSITION);
const V = P.length / 3;

// eye bump regions (from cluster analysis): x 0.10-0.15, y 0.79-0.85, |z|<0.05
for (const side of [1, -1]) {
  const verts = [];
  for (let i = 0; i < V; i++) {
    const x = P[i*3], y = P[i*3+1], z = P[i*3+2];
    if (x > 0.10 && x < 0.15 && y > 0.79 && y < 0.85 && z * side > 0 && Math.abs(z) < 0.05)
      verts.push([x, y, z]);
  }
  // centre of the bump patch, then apex = vert farthest from the head axis
  // (head axis runs roughly along X at y≈0.81, z≈0 for this side)
  let mx = 0, my = 0, mz = 0;
  for (const v of verts) { mx += v[0]; my += v[1]; mz += v[2]; }
  mx /= verts.length; my /= verts.length; mz /= verts.length;
  // apex: max radial distance in the y-z plane from the head axis (y 0.815, z 0)
  let apex = null, best = -1;
  for (const v of verts) {
    const d = Math.hypot(v[1] - 0.815, v[2]);
    if (d > best) { best = d; apex = v; }
  }
  // patch extent
  let exMin = 1e9, exMax = -1e9, eyMin = 1e9, eyMax = -1e9;
  for (const v of verts) {
    exMin = Math.min(exMin, v[0]); exMax = Math.max(exMax, v[0]);
    eyMin = Math.min(eyMin, v[1]); eyMax = Math.max(eyMax, v[1]);
  }
  console.log(
    `side z${side > 0 ? "+" : "-"}: n=${verts.length} mean=(${mx.toFixed(4)}, ${my.toFixed(4)}, ${mz.toFixed(4)})`,
    `apex=(${apex[0].toFixed(4)}, ${apex[1].toFixed(4)}, ${apex[2].toFixed(4)})`,
    `x[${exMin.toFixed(3)},${exMax.toFixed(3)}] y[${eyMin.toFixed(3)},${eyMax.toFixed(3)}]`
  );
}
