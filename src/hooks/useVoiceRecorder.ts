import { useEffect, useRef, useState } from "react";
import { VoiceRecorder } from "capacitor-voice-recorder";

/** Formato del audio devuelto por el puente nativo (Base64 + MIME) */
export interface GrabacionAudio {
  base64: string;
  mimeType: string;
  caracteresBase64: number;
  kb: number;
}

type EstadoPermiso = "granted" | "denied" | "prompt" | "unknown";

const mensajeDeError = (e: unknown): string =>
  e instanceof Error ? e.message : "Error desconocido al usar el micrófono.";

/**
 * Día 2 · Checkpoint
 * Hook que conecta el micrófono real del dispositivo (Capacitor Bridge)
 * con la capa de React, devolviendo audio en Base64 listo para reproducir.
 */
export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [grabacion, setGrabacion] = useState<GrabacionAudio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [segundos, setSegundos] = useState(0);
  const [estadoPermiso, setEstadoPermiso] = useState<EstadoPermiso>("unknown");

  const timerRef = useRef<number | null>(null);

  const detenerTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => () => detenerTimer(), []);

  /** Guarda la grabación y reporta su tamaño en consola (Paso 2 del checkpoint) */
  const guardarGrabacion = (base64: string, mimeType: string) => {
    const caracteresBase64 = base64.length;
    const kb = Number(((caracteresBase64 * 0.75) / 1024).toFixed(1));
    setGrabacion({ base64, mimeType, caracteresBase64, kb });
    console.log("[Reto 2] Audio capturado ", {
      mimeType,
      caracteresBase64,
      kb,
    });
  };

  /** 1. Consulta silenciosa: no abre ningún diálogo */
  const consultarPermiso = async (): Promise<EstadoPermiso> => {
    try {
      const perm = await VoiceRecorder.hasAudioRecordingPermission();
      const estado: EstadoPermiso = perm.value ? "granted" : "denied";
      setEstadoPermiso(estado);
      return estado;
    } catch {
      setEstadoPermiso("unknown");
      return "unknown";
    }
  };

  /** 2. Solicitud activa: abre el diálogo nativo del sistema */
  const solicitarPermiso = async (): Promise<boolean> => {
    try {
      const result = await VoiceRecorder.requestAudioRecordingPermission();
      setEstadoPermiso(result.value ? "granted" : "denied");
      return result.value;
    } catch {
      setEstadoPermiso("denied");
      return false;
    }
  };

  /** Ciclo de 3 pasos: consultar → solicitar si hace falta → grabar */
  const verificarPermisos = async (): Promise<boolean> => {
    const perm = await VoiceRecorder.hasAudioRecordingPermission();
    if (perm.value) {
      setEstadoPermiso("granted");
      return true;
    }
    const request = await VoiceRecorder.requestAudioRecordingPermission();
    setEstadoPermiso(request.value ? "granted" : "denied");
    return request.value;
  };

  const iniciarGrabacion = async () => {
    setError(null);
    setGrabacion(null);
    try {
      const tienePermiso = await verificarPermisos();
      if (!tienePermiso) {
        throw new Error("Se requiere permiso de micrófono para continuar.");
      }
      await VoiceRecorder.startRecording();
      setIsRecording(true);
      setSegundos(0);
      timerRef.current = window.setInterval(
        () => setSegundos((s) => s + 1),
        1000,
      );
    } catch (e) {
      setError(mensajeDeError(e));
      detenerTimer();
      setIsRecording(false);
    }
  };

  const detenerGrabacion = async () => {
    detenerTimer();
    try {
      const result = await VoiceRecorder.stopRecording();
      setIsRecording(false);

      if (result.value && result.value.recordDataBase64) {
        guardarGrabacion(
          result.value.recordDataBase64,
          result.value.mimeType || "audio/aac",
        );
      } else {
        setError("El micrófono no devolvió datos de audio.");
      }
    } catch (e) {
      setIsRecording(false);
      setError(mensajeDeError(e));
    }
  };

  return {
    isRecording,
    grabacion,
    error,
    segundos,
    estadoPermiso,
    iniciarGrabacion,
    detenerGrabacion,
    consultarPermiso,
    solicitarPermiso,
  };
};
