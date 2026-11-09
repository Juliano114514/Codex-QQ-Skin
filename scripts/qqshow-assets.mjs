import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readImageMetadata } from "./image-metadata.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bundlePath = path.join(root, "assets", "qqshow.local.json");

export async function loadQQShowAssets() {
  try {
    const bytes = await fs.readFile(bundlePath);
    if (bytes.length > 8 * 1024 * 1024) throw new Error("QQ show bundle exceeds 8 MiB");
    const bundle = JSON.parse(bytes);
    if (bundle.version !== 1 || bundle.canvas?.width !== 140 || bundle.canvas?.height !== 226 ||
        !Array.isArray(bundle.slots) || !bundle.slots.length || bundle.slots.length > 20 ||
        !Array.isArray(bundle.characters) || !bundle.characters.length || bundle.characters.length > 30 ||
        !Array.isArray(bundle.items) || !bundle.items.length || bundle.items.length > 300 ||
        !bundle.images || typeof bundle.images !== "object" ||
        !bundle.slots.every(slot => slot && typeof slot.id === "string" && typeof slot.label === "string" && Number.isFinite(slot.z)) ||
        !bundle.characters.every(character => character && typeof character.id === "string" && typeof character.name === "string" && character.preset && typeof character.preset === "object") ||
        !bundle.items.every(item => item && typeof item.id === "string" && typeof item.name === "string" &&
          bundle.slots.some(slot => slot.id === item.slot) && (!item.layers || Array.isArray(item.layers)))) {
      throw new Error("Invalid QQ show bundle; import the classic manifest again");
    }
    const { attribution, ...runtime } = bundle;
    return runtime;
  } catch (error) {
    if (error.code !== "ENOENT") console.warn("[qq-skin] QQ show bundle unavailable; import the classic manifest again.");
    return null;
  }
}

async function importAssets(sourceDirectory) {
  const source = await fs.realpath(sourceDirectory);
  const manifest = JSON.parse(await fs.readFile(path.join(source, "manifest.json"), "utf8"));
  if (manifest.version !== 2 || manifest.canvas?.width !== 140 || manifest.canvas?.height !== 226 ||
      !Array.isArray(manifest.slots) || manifest.slots.length > 20 ||
      !Array.isArray(manifest.items) || manifest.items.length > 300 ||
      !Array.isArray(manifest.characters) || !manifest.characters.length) throw new Error("Unsupported classic manifest");
  const images = {};
  let imageBytes = 0;
  const image = async (src) => {
    if (!src) return undefined;
    if (!/^\/assets-classic\/[a-z0-9-]+\/[a-z0-9-]+\.(png|gif)$/.test(src)) throw new Error("Unsupported QQ show image path");
    const key = src.slice("/assets-classic/".length);
    if (images[key]) return key;
    const resolved = await fs.realpath(path.join(source, key));
    const relative = path.relative(source, resolved);
    if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("QQ show image escapes the source directory");
    const bytes = await fs.readFile(resolved);
    imageBytes += bytes.length;
    if (imageBytes > 4 * 1024 * 1024) throw new Error("QQ show images exceed 4 MiB");
    const gif = key.endsWith(".gif");
    const dimensions = gif && /^GIF8[79]a$/.test(bytes.toString("ascii", 0, 6)) && bytes.length >= 10
      ? { width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8) }
      : !gif ? readImageMetadata(bytes, ".png") : null;
    if (dimensions?.width !== 140 || dimensions?.height !== 226) throw new Error(`QQ show image must be 140×226: ${key}`);
    images[key] = `data:image/${gif ? "gif" : "png"};base64,${bytes.toString("base64")}`;
    return key;
  };
  const slots = manifest.slots.map(({ id, label, optional, z }) => ({ id, label, optional, z }));
  const items = [];
  for (const item of manifest.items) {
    const layers = [];
    for (const layer of item.layers || []) layers.push({
      src: await image(layer.src), animatedSrc: await image(layer.animatedSrc), z: layer.z,
    });
    items.push({ id: item.id, name: item.name, slot: item.slot, characterId: item.characterId,
      src: layers.length ? undefined : await image(item.src), animatedSrc: await image(item.animatedSrc),
      layers: layers.length ? layers : undefined });
  }
  const characters = manifest.characters.map(({ id, name, preset }) => ({ id, name, preset }));
  const attribution = await fs.readFile(path.join(source, "..", "..", "ATTRIBUTION.md"), "utf8");
  const bundle = { version: 1, canvas: manifest.canvas, slots, characters, basePreset: manifest.basePreset, items, images, attribution };
  const temporary = `${bundlePath}.${process.pid}.tmp`;
  try {
    await fs.writeFile(temporary, JSON.stringify(bundle), { flag: "wx" });
    await fs.rename(temporary, bundlePath);
  } finally { await fs.rm(temporary, { force: true }); }
  console.log(JSON.stringify({ imported: true, characters: characters.length, slots: slots.length, items: items.length,
    images: Object.keys(images).length, imageBytes, bundle: bundlePath }, null, 2));
}

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv[2] !== "--import" || !process.argv[3]) throw new Error("Usage: node scripts/qqshow-assets.mjs --import <assets-classic directory>");
    await importAssets(process.argv[3]);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
