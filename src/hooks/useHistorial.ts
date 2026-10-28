import { useCallback, useEffect, useRef, useState } from "react";
import {
  cargarHistorial,
  guardarHistorial,
  limpiarHistorial,
  nuevoId,
  type FraseHistorial,
} from "../services/historial";

export type OrigenFrase = FraseHistorial["origen"];

const mensajeDeError = (e: unknown): string =>
  e instanceof Error ? e.message : "No se pudo acceder al almacenamiento local.";

export const useHistorial = () => {
  const [historial, setHistorial] = useState<FraseHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const historialRef = useRef<FraseHistorial[]>([]);

  useEffect(() => {
    let activo = true;
    cargarHistorial()
      .then((items) => {
        if (!activo) return;
        historialRef.current = items;
        setHistorial(items);
      })
      .catch((e) => {
        if (activo) setError(mensajeDeError(e));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const aplicar = useCallback(async (items: FraseHistorial[]) => {
    historialRef.current = items;
    setHistorial(items);
    setError(null);
    try {
      await guardarHistorial(items);
    } catch (e) {
      setError(mensajeDeError(e));
      throw e;
    }
  }, []);

  const agregar = useCallback(
    async (texto: string, origen: OrigenFrase) => {
      const item: FraseHistorial = {
        id: nuevoId(),
        texto: texto.trim(),
        fecha: new Date().toISOString(),
        origen,
      };
      await aplicar([item, ...historialRef.current]);
      return item;
    },
    [aplicar],
  );

  const eliminar = useCallback(
    async (id: string) => {
      await aplicar(historialRef.current.filter((item) => item.id !== id));
    },
    [aplicar],
  );

  const limpiar = useCallback(async () => {
    historialRef.current = [];
    setHistorial([]);
    await limpiarHistorial();
  }, []);

  const restaurar = useCallback(
    async (items: FraseHistorial[]) => {
      await aplicar(items);
    },
    [aplicar],
  );

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const items = await cargarHistorial();
      historialRef.current = items;
      setHistorial(items);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setCargando(false);
    }
  }, []);

  return {
    historial,
    cargando,
    error,
    agregar,
    eliminar,
    limpiar,
    restaurar,
    recargar,
  };
};
