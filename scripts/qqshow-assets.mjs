import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readImageMetadata } from "./image-metadata.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bundlePath = path.join(root, "assets", "qqshow.local.json");
const MAX_BUNDLE_BYTES = 64 * 1024 * 1024;
const characterNames = { gpt: "ChatGPT", deepseek: "DeepSeek", claude: "Claude", grok: "Grok", qwen: "千问", gemini: "Gemini", glm: "GLM" };

function validCatalog(bundle) {
  return bundle && [140, 420].includes(bundle.canvas?.width) && bundle.canvas.height === bundle.canvas.width / 140 * 226 &&
    Array.isArray(bundle.slots) && bundle.slots.length > 0 && bundle.slots.length <= 20 &&
    Array.isArray(bundle.characters) && bundle.characters.length > 0 && bundle.characters.length <= 30 &&
    Array.isArray(bundle.items) && bundle.items.length > 0 && bundle.items.length <= 300 &&
    bundle.images && typeof bundle.images === "object" &&
    bundle.slots.every(slot => slot && typeof slot.id === "string" && typeof slot.label === "string" && Number.isFinite(slot.z)) &&
    bundle.characters.every(character => character && typeof character.id === "string" && typeof character.name === "string" && character.preset && typeof character.preset === "object") &&
    bundle.items.every(item => item && typeof item.id === "string" && typeof item.name === "string" &&
      bundle.slots.some(slot => slot.id === item.slot) && (!item.layers || Array.isArray(item.layers)));
}

export async function loadQQShowAssets() {
  try {
    const bytes = await fs.readFile(bundlePath);
    if (bytes.length > MAX_BUNDLE_BYTES) throw new Error("QQ show bundle exceeds 64 MiB");
    const bundle = JSON.parse(bytes);
    if (!(bundle.version === 1 && validCatalog(bundle)) &&
        !(bundle.version === 2 && Array.isArray(bundle.styles) && bundle.styles.length === 2 &&
          bundle.styles.every((style, index) => style.id === ["classic", "fashion"][index] && validCatalog(style)))) {
      throw new Error("Invalid QQ show bundle; import the assets again");
    }
    const { attribution, ...runtime } = bundle;
    return runtime;
  } catch (error) {
    if (error.code !== "ENOENT") console.warn("[qq-skin] QQ show bundle unavailable; import the assets again.");
    return null;
  }
}

async function writeBundle(bundle) {
  const content = JSON.stringify(bundle);
  if (Buffer.byteLength(content) > MAX_BUNDLE_BYTES) throw new Error("QQ show bundle exceeds 64 MiB");
  const temporary = `${bundlePath}.${process.pid}.tmp`;
  try {
    await fs.writeFile(temporary, content, { flag: "wx" });
    await fs.rename(temporary, bundlePath);
  } finally { await fs.rm(temporary, { force: true }); }
}

async function importLatest(source, manifest) {
  const styles = [];
  let imageBytes = 0;
  for (const id of ["classic", "fashion"]) {
    const classic = id === "classic";
    const canvas = { width: classic ? 140 : 420, height: classic ? 226 : 678 };
    const images = {};
    const image = async key => {
      if (images[key]) return key;
      if (!/^[a-z]+\/(?:components\/(?:parts\/)?|effects\/)?[a-z-]+\.(png|gif)$/.test(key)) throw new Error("Unsupported Latest image path");
      const resolved = await fs.realpath(path.join(source, id, key));
      const relative = path.relative(source, resolved);
      if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("QQ show image escapes the source directory");
      const bytes = await fs.readFile(resolved);
      imageBytes += bytes.length;
      if (imageBytes > 46 * 1024 * 1024) throw new Error("QQ show images exceed 46 MiB");
      const gif = key.endsWith(".gif");
      const size = gif && /^GIF8[79]a$/.test(bytes.toString("ascii", 0, 6)) && bytes.length >= 10
        ? { width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8) }
        : !gif ? readImageMetadata(bytes, ".png") : null;
      if (size?.width !== canvas.width || size?.height !== canvas.height) throw new Error(`Wrong Latest image dimensions: ${id}/${key}`);
      images[key] = `data:image/${gif ? "gif" : "png"};base64,${bytes.toString("base64")}`;
      return key;
    };
    // Preserve the existing classic slot IDs so saved mixed outfits migrate.
    const definitions = classic ? [
      ["background", "场景", true, 0], ["aura", "光环", true, 5], ["back", "背饰", true, 10],
      ["hair", "发型", false, 20], ["legs", "鞋袜", false, 30], ["bottom", "裙装", false, 40],
      ["top", "上装", false, 50], ["face", "表情", false, 70], ["headwear", "头饰", true, 90],
      ["prop", "手持", true, 84], ["effect", "闪光", true, 110],
    ] : [
      ["background", "场景", true, 0], ["back", "背饰", true, 10], ["hair", "发型", false, 20],
      ["body", "素体", false, 30], ["legs", "鞋袜", false, 40], ["bottom", "裙装", false, 50],
      ["top", "上装", false, 60], ["face", "表情", false, 70], ["headwear", "头饰", true, 100],
      ["hands", "手势", false, 110], ["prop", "手持", true, 120], ["effect", "闪光", true, 140],
    ];
    const slots = definitions.map(([id, label, optional, z]) => ({ id, label, optional, z }));
    const characters = [], items = [];
    const entries = manifest.characters.filter(entry => entry.style === id);
    if (entries.length !== 7 || new Set(entries.map(entry => entry.id)).size !== 7) throw new Error(`Latest must contain seven ${id} characters`);
    for (const entry of entries) {
      const characterId = entry.id;
      if (!Object.hasOwn(characterNames, characterId) || entry.canvas?.[0] !== canvas.width || entry.canvas?.[1] !== canvas.height) throw new Error("Unsupported Latest character");
      const preset = {};
      const component = (name, z) => ({ file: `components/${classic ? "" : "parts/"}${name}.png`, z });
      for (const slot of slots) {
        const layers = slot.id === "background" ? [{ file: "background.png", animated: "background.gif", z: 0 }]
          : slot.id === "hair" ? [component(classic ? "hair-back" : "back-hair", slot.z), component(classic ? "hair-front" : "front-hair", classic ? 80 : 90)]
          : classic && slot.id === "top" ? [component("top-body", 50), component("top-arms", 85)]
          : !classic && slot.id === "face" ? [component("face", 70), component("features", 80)]
          : !classic && slot.id === "prop" ? [component("prop", 120), component("fingers", 130)]
          : [component(!classic && slot.id === "legs" ? "shoes" : slot.id, slot.z)];
        const available = layers.filter(layer => slot.id === "background" || entry.components.some(part => part.file === layer.file));
        if (!available.length) {
          if (!slot.optional) throw new Error(`Missing Latest slot: ${id}/${characterId}/${slot.id}`);
          preset[slot.id] = null;
          continue;
        }
        const itemId = `${characterId}-${slot.id}`;
        const imported = [];
        for (const layer of available) imported.push({ src: await image(`${characterId}/${layer.file}`),
          animatedSrc: layer.animated ? await image(`${characterId}/${layer.animated}`) : undefined, z: layer.z });
        items.push({ id: itemId, name: characterNames[characterId], slot: slot.id, characterId, layers: imported });
        preset[slot.id] = itemId;
      }
      characters.push({ id: characterId, name: characterNames[characterId], preset,
        scene: { src: await image(`${characterId}/scene.png`), animatedSrc: await image(`${characterId}/scene.gif`) } });
    }
    styles.push({ id, name: classic ? "经典" : "时尚", canvas, slots, characters, items, images });
  }
  const attribution = await fs.readFile(path.join(source, "README.md"), "utf8");
  await writeBundle({ version: 2, source: "LLM-show-Latest", date: manifest.date, styles, attribution });
  console.log(JSON.stringify({ imported: true, styles: styles.map(style => ({ id: style.id, characters: style.characters.length,
    items: style.items.length, images: Object.keys(style.images).length })), imageBytes, bundle: bundlePath }, null, 2));
}

async function importAssets(sourceDirectory) {
  const source = await fs.realpath(sourceDirectory);
  const manifest = JSON.parse(await fs.readFile(path.join(source, "manifest.json"), "utf8"));
  if (Array.isArray(manifest.characters) && manifest.characters.some(entry => entry.style === "fashion")) return importLatest(source, manifest);
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
  await writeBundle(bundle);
  console.log(JSON.stringify({ imported: true, characters: characters.length, slots: slots.length, items: items.length,
    images: Object.keys(images).length, imageBytes, bundle: bundlePath }, null, 2));
}

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv[2] !== "--import" || !process.argv[3]) throw new Error("Usage: node scripts/qqshow-assets.mjs --import <LLM-show-Latest or assets-classic directory>");
    await importAssets(process.argv[3]);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
