import type { SaveTubeCDNResponseDecoded } from "./schemas/saveTubeCDNResponseDecoded.js";

import { createDecipheriv } from "node:crypto";

function hexcode(str: string) {
  return Buffer.from(str, "hex");
}
export default function decode(enc: string) {
  const secret_key = "C5D58EF67A7584E4A29F6C35BBC4EB12";
  const data = Buffer.from(enc, "base64");
  const iv = data.subarray(0, 16);
  const content = data.subarray(16);
  const key = hexcode(secret_key);

  const decipher = createDecipheriv("aes-128-cbc", key, iv);
  const decrypted = Buffer.concat([decipher.update(content), decipher.final()]);

  return JSON.parse(decrypted.toString()) as SaveTubeCDNResponseDecoded;
}
