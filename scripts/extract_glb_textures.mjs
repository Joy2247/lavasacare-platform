// Extract embedded images (basecolor / normal / metallicRoughness) from a GLB
// to PNG-viewable files on disk. Usage: node extract_glb_textures.mjs <glb> <outdir>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const glbPath = process.argv[2] ?? "public/models/medical-symbol.glb";
const outDir = process.argv[3] ?? "scripts/tex_out";
mkdirSync(outDir, { recursive: true });

const buf = readFileSync(glbPath);
if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error("Not a GLB");
const jsonLen = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.toString("utf8", 20, 20 + jsonLen));
const binStart = 20 + jsonLen + 8; // skip BIN chunk header

const extMap = { "image/jpeg": "jpg", "image/png": "png" };

(gltf.images ?? []).forEach((im, i) => {
  if (im.uri) { console.log(`[${i}] external uri=${im.uri} (skip)`); return; }
  const bv = gltf.bufferViews[im.bufferView];
  const off = binStart + (bv.byteOffset ?? 0);
  const len = bv.byteLength;
  const ext = extMap[im.mimeType] ?? "bin";
  const name = im.name ? `${im.name}-${i}.${ext}` : `tex-${i}.${ext}`;
  writeFileSync(join(outDir, name), buf.subarray(off, off + len));
  console.log(`[${i}] ${name} mime=${im.mimeType} bytes=${len}`);
});

// also print which material slots use which texture index
console.log("\nmaterial texture slots:");
(gltf.materials ?? []).forEach((m, mi) => {
  const pbr = m.pbrMetallicRoughness ?? {};
  const slots = {
    baseColor: pbr.baseColorTexture?.index,
    metallicRoughness: pbr.metallicRoughnessTexture?.index,
    normal: m.normalTexture?.index,
    emissive: m.emissiveTexture?.index,
  };
  console.log(`  mat[${mi}] ${m.name}:`, JSON.stringify(slots));
  if (gltf.textures) {
    for (const [slot, ti] of Object.entries(slots)) {
      if (ti != null) {
        const src = gltf.textures[ti].source;
        console.log(`     ${slot}: texture[${ti}] -> image[${src}]`);
      }
    }
  }
});
