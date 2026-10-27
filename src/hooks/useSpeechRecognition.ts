import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { SpeechRecognition } from "@capgo/capacitor-speech-recognition";

type Motor = "nativo" | "web";

interface SpeechRecognitionWeb {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: never) => void) | null;
  onerror: ((event: never) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

const obtenerSpeechWeb = (): (new () => SpeechRecognitionWeb) | null => {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionWeb;
    webkitSpeechRecognition?: new () => SpeechRecognitionWeb;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

const mensajeDeError = (e: unknown): string =>
  e instanceof Error
    ? e.message
    : "Error desconocido en el reconocimiento de voz.";

export const useSpeechRecognition = () => {
  const esNativo = Capacitor.isNativePlatform();
  const motor: Motor = esNativo ? "nativo" : "web";

  const [escuchando, setEscuchando] = useState(false);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [disponible, setDisponible] = useState<boolean | null>(null);

  const webRef = useRef<SpeechRecognitionWeb | null>(null);
  const limpiarRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    let activo = true;

    const verificar = async () => {
      try {
        if (esNativo) {
          const resultado = await SpeechRecognition.available();
          if (activo) setDisponible(resultado.available);
        } else {
          if (activo) setDisponible(!!obtenerSpeechWeb());
        }
      } catch {
        if (activo) setDisponible(false);
      }
    };

    void verificar();
    return () => {
      activo = false;
    };
  }, [esNativo]);

  useEffect(
    () => () => {
      webRef.current?.stop();
      void limpiarRef.current?.();
    },
    [],
  );

  const iniciarNativo = async (language: string) => {
    const disp = await SpeechRecognition.available();
    if (!disp.available) {
      throw new Error(
        "El servicio de reconocimiento no está disponible en este dispositivo.",
      );
    }

    const perm = await SpeechRecognition.requestPermissions();
    if (perm.speechRecognition !== "granted") {
      throw new Error("Permiso de reconocimiento de voz denegado.");
    }

    const listenerParcial = await SpeechRecognition.addListener(
      "partialResults",
      (event) => {
        const parcial = event.accumulatedText ?? event.matches?.[0];
        if (parcial) setTexto(parcial);
      },
    );

    const listenerError = await SpeechRecognition.addListener(
      "error",
      (event) => {
        setError(`Reconocimiento: ${event.message}`);
        setEscuchando(false);
      },
    );

    const listenerEstado = await SpeechRecognition.addListener(
      "listeningState",
      (event) => {
        if (event.state === "stopped") {
          setEscuchando(false);
          void limpiarRef.current?.();
          limpiarRef.current = null;
        }
      },
    );

    limpiarRef.current = async () => {
      await listenerParcial.remove();
      await listenerEstado.remove();
      await listenerError.remove();
    };

    await SpeechRecognition.start({
      language,
      maxResults: 1,
      popup: false,
      partialResults: true,
      addPunctuation: true,
    });
  };

  const iniciarWeb = async (language: string) => {
    const SpeechClass = obtenerSpeechWeb();
    if (!SpeechClass) {
      throw new Error(
        "Navegador no compatible con Web Speech API. Usa Chrome o prueba en el celular.",
      );
    }

    const recognition = new SpeechClass();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = ((event: {
      results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
    }) => {
      let final = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const resultado = event.results[i];
        if (resultado.isFinal) final += resultado[0].transcript;
        else interim += resultado[0].transcript;
      }
      setTexto((final + interim).trim());
    }) as never;

    recognition.onerror = ((event: { error: string }) => {
      setError(`Web Speech: ${event.error}`);
      setEscuchando(false);
    }) as never;

    recognition.onend = () => setEscuchando(false);

    webRef.current = recognition;
    recognition.start();
  };

  const iniciarEscucha = async (language: string) => {
    setError(null);
    setTexto("");

    try {
      if (esNativo) await iniciarNativo(language);
      else await iniciarWeb(language);
      setEscuchando(true);
    } catch (e) {
      setError(mensajeDeError(e));
      setEscuchando(false);
    }
  };

  const detenerEscucha = async () => {
    try {
      if (esNativo) {
        const ultimo = await SpeechRecognition.getLastPartialResult();
        if (ultimo.text) setTexto(ultimo.text);
        await SpeechRecognition.stop();
      } else {
        webRef.current?.stop();
      }
    } catch {
      // La sesión pudo haber terminado sola (silencio/error): no hacemos nada.
    } finally {
      setEscuchando(false);
      await limpiarRef.current?.();
      limpiarRef.current = null;
    }
  };

  return {
    esNativo,
    motor,
    disponible,
    escuchando,
    texto,
    error,
    iniciarEscucha,
    detenerEscucha,
  };
};
