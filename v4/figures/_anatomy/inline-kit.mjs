// Vendored from the Anatomy skill (MIT, github.com/wheresryan22/anatomy): returns kit sources to inline into a page.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const KIT = join(dirname(fileURLToPath(import.meta.url)), "kit");
const strip = (file) => readFileSync(join(KIT, file), "utf8").replace(/^export /gm, "");
export const kitScript = () => strip("iso-kit.mjs");
