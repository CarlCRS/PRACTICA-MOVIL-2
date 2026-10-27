/**
 * Día 3 · Utilidad binaria
 * Convierte la cadena Base64 que devuelve el micrófono en un File
 * listo para enviarse a la API de ElevenLabs.
 */
export function base64ToFile(
  base64: string,
  mimeType: string,
  nombre: string,
): File {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new File([bytes], nombre, { type: mimeType });
}

export function extensionDeMime(mime: string): string {
  if (mime.includes("mp4") || mime.includes("aac") || mime.includes("m4a")) {
    return "m4a";
  }
  if (mime.includes("wav")) return "wav";
  if (mime.includes("ogg")) return "ogg";
  return "webm";
}
