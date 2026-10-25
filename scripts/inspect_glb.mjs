// Inspect a GLB: list extensions, meshes, materials, animations, textures, rough bounds.
import { readFileSync } from "node:fs";

const path = process.argv[2];
const buf = readFileSync(path);
if (buf.readUInt32LE(0) !== 0x46546c67) {
  console.error("Not a GLB (bad magic)");
  process.exit(1);
}
const jsonLen = buf.readUInt32LE(12);
const jsonType = buf.toString("ascii", 16, 20);
if (jsonType !== "JSON") {
  console.error("First chunk is not JSON");
  process.exit(1);
}
const gltf = JSON.parse(buf.toString("utf8", 20, 20 + jsonLen));

console.log("== extensionsUsed ==", JSON.stringify(gltf.extensionsUsed ?? []));
console.log("== extensionsRequired ==", JSON.stringify(gltf.extensionsRequired ?? []));
console.log("== generator ==", gltf.asset?.generator);
console.log("== scenes/nodes ==", gltf.scenes?.length, "/", gltf.nodes?.length);

const nodeName = (i) => gltf.nodes?.[i]?.name ?? `node${i}`;
(gltf.scenes?.[0]?.nodes ?? []).forEach((n) => console.log("  scene root:", nodeName(n)));

console.log("== meshes ==", gltf.meshes?.length);
gltf.meshes?.slice(0, 40).forEach((m, i) => {
  const prims = m.primitives.map((p) => p.attributes.POSITION != null ? "P" : "?").join("");
  console.log(`  [${i}] ${m.name} prims=${m.primitives.length} attrs=${prims}`);
});

console.log("== materials ==", gltf.materials?.length);
gltf.materials?.slice(0, 30).forEach((m, i) => {
  const pbr = m.pbrMetallicRoughness ?? {};
  console.log(`  [${i}] ${m.name} baseColor=${JSON.stringify(pbr.baseColorFactor)} metal=${pbr.metallicFactor} rough=${pbr.roughnessFactor} ext=${Object.keys(m.extensions ?? {}).join(",")}`);
});

console.log("== textures/images ==", gltf.textures?.length, "/", gltf.images?.length);
gltf.images?.slice(0, 12).forEach((im, i) =>
  console.log(`  [${i}] ${im.name ?? im.uri ?? "embedded"} mime=${im.mimeType} bytes=${im.bufferView != null ? "?" : "-"}`
));

console.log("== animations ==", gltf.animations?.length ?? 0);
gltf.animations?.forEach((a, i) => {
  console.log(`  [${i}] ${a.name} channels=${a.channels?.length} samplers=${a.samplers?.length}`);
  const paths = new Set(a.channels.map((c) => c.target.path));
  const targets = new Set(a.channels.map((c) => nodeName(c.target.node)));
  console.log("      paths:", [...paths].join(","), "| targets:", [...targets].slice(0, 8).join(","));
});

// Rough bounds from POSITION accessors used by meshes in the default scene
let min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
const walk = (ni, parent) => {
  const n = gltf.nodes[ni];
  let m = parent;
  // (skip full matrix math — report per-node raw mesh bounds too)
  if (n.mesh != null) {
    for (const p of gltf.meshes[n.mesh].primitives) {
      const acc = gltf.accessors[p.attributes.POSITION];
      if (acc?.min && acc?.max) {
        for (let k = 0; k < 3; k++) {
          min[k] = Math.min(min[k], acc.min[k]);
          max[k] = Math.max(max[k], acc.max[k]);
        }
      }
    }
  }
  (n.children ?? []).forEach((c) => walk(c, m));
};
(gltf.scenes?.[0]?.nodes ?? []).forEach((n) => walk(n, null));
console.log("== raw POSITION bounds (pre-transform, union) ==");
console.log("   min:", min.map((v) => v.toFixed(2)).join(", "), " max:", max.map((v) => v.toFixed(2)).join(", "));
console.log("   size:", max.map((v, k) => (v - min[k]).toFixed(2)).join(", "));
