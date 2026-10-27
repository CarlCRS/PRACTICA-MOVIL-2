import { base64ToFile, extensionDeMime } from "../lib/base64ToFile";

export interface ResultadoTranscripcion {
  texto: string;
  duracionMs: number;
  modelo: string;
}

/**
 * Caso A · Nube
 * Envía el audio grabado (Base64) a ElevenLabs Scribe v2.
 */
export async function transcribirConElevenLabs(
  base64: string,
  mimeType: string,
  languageCode = "spa",
): Promise<ResultadoTranscripcion> {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;

  if (!apiKey) {
    throw new Error(
      "Falta VITE_ELEVENLABS_API_KEY. Crea un archivo .env en la raíz con tu API key y reinicia el servidor.",
    );
  }

  const inicio = performance.now();

  const { ElevenLabsClient } = await import("@elevenlabs/elevenlabs-js");
  const client = new ElevenLabsClient({ apiKey });

  const archivo = base64ToFile(
    base64,
    mimeType,
    `grabacion.${extensionDeMime(mimeType)}`,
  );

  const respuesta = await client.speechToText.convert({
    file: archivo,
    modelId: "scribe_v2",
    tagAudioEvents: true,
    languageCode,
    diarize: true,
  });

  return {
    texto: respuesta.text ?? "",
    duracionMs: Math.round(performance.now() - inicio),
    modelo: "scribe_v2",
  };
}
