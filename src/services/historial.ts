import { Preferences } from "@capacitor/preferences";

export interface FraseHistorial {
  id: string;
  texto: string;
  fecha: string;
  origen: "nube" | "manual";
}

export const STORAGE_KEY = "historial_grabaciones";
export const STORAGE_KEY_LOCAL = "historial_grabaciones_local";
export const PREFIJO_WEB = "CapacitorStorage.";

export const nuevoId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `frase-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const guardarHistorial = async (
  items: FraseHistorial[],
): Promise<void> => {
  await Preferences.set({
    key: STORAGE_KEY,
    value: JSON.stringify(items),
  });
};

export const cargarHistorial = async (): Promise<FraseHistorial[]> => {
  const { value } = await Preferences.get({ key: STORAGE_KEY });
  if (!value) return [];
  try {
    const parseado: unknown = JSON.parse(value);
    return Array.isArray(parseado) ? (parseado as FraseHistorial[]) : [];
  } catch {
    console.warn("[Día 4] El historial guardado no es JSON válido.");
    return [];
  }
};

export const limpiarHistorial = async (): Promise<void> => {
  await Preferences.remove({ key: STORAGE_KEY });
};

export const leerHistorialCrudo = async (): Promise<string | null> => {
  const { value } = await Preferences.get({ key: STORAGE_KEY });
  return value;
};
