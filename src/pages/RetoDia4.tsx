import { useEffect, useMemo, useState } from "react";
import { Capacitor } from "@capacitor/core";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  IonBadge,
  useIonLoading,
  useIonToast,
} from "@ionic/react";
import {
  alertCircleOutline,
  arrowBack,
  chatbubbleOutline,
  checkmarkCircleOutline,
  cloudUploadOutline,
  copyOutline,
  documentTextOutline,
  flash,
  folderOpenOutline,
  hardwareChipOutline,
  informationCircleOutline,
  languageOutline,
  listOutline,
  micOutline,
  phonePortraitOutline,
  refreshOutline,
  saveOutline,
  serverOutline,
  sparklesOutline,
  stopCircleOutline,
  timeOutline,
  trashOutline,
} from "ionicons/icons";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { useHistorial } from "../hooks/useHistorial";
import {
  STORAGE_KEY,
  STORAGE_KEY_LOCAL,
  PREFIJO_WEB,
  leerHistorialCrudo,
  type FraseHistorial,
} from "../services/historial";
import { transcribirConElevenLabs } from "../services/elevenlabs";
import "./RetoDia4.css";

const FRASES_DEMO = [
  "Transcripción de prueba: la reunión empieza a las nueve.",
  "Recordatorio: enviar el informe antes del viernes.",
  "Nota rápida: comprar café y revisar el correo del cliente.",
  "Idea: agregar traducción simultánea al prototipo.",
];

const formatearFecha = (iso: string): string => {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const leerCopiaLocal = (): string | null => {
  try {
    return window.localStorage.getItem(STORAGE_KEY_LOCAL);
  } catch {
    return null;
  }
};

const embellecerJson = (valor: string | null): string => {
  if (!valor) return "// vacío";
  try {
    return JSON.stringify(JSON.parse(valor), null, 2);
  } catch {
    return valor;
  }
};

const RetoDia4: React.FC = () => {
  const [presentToast] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();

  const {
    isRecording,
    grabacion,
    error: errorGrabacion,
    segundos,
    estadoPermiso,
    iniciarGrabacion,
    detenerGrabacion,
  } = useVoiceRecorder();

  const {
    historial,
    cargando,
    error: errorHistorial,
    agregar,
    eliminar,
    limpiar,
    restaurar,
    recargar,
  } = useHistorial();

  const [idioma, setIdioma] = useState("spa");
  const [textoManual, setTextoManual] = useState("");
  const [transcribiendo, setTranscribiendo] = useState(false);
  const [crudo, setCrudo] = useState<string | null>(null);
  const [copiaLocal, setCopiaLocal] = useState<string | null>(null);

  const reloj = `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(
    segundos % 60,
  ).padStart(2, "0")}`;

  const bytesPreferences = useMemo(
    () => (crudo ? new TextEncoder().encode(crudo).length : 0),
    [crudo],
  );
  const bytesLocal = useMemo(
    () => (copiaLocal ? new TextEncoder().encode(copiaLocal).length : 0),
    [copiaLocal],
  );

  useEffect(() => {
    let activo = true;
    leerHistorialCrudo()
      .then((valor) => {
        if (activo) setCrudo(valor);
      })
      .catch(() => {
        if (activo) setCrudo(null);
      });
    return () => {
      activo = false;
    };
  }, [historial, cargando]);

  useEffect(() => {
    setCopiaLocal(leerCopiaLocal());
  }, []);

  const avisar = async (
    message: string,
    color: "success" | "danger" | "warning" | "medium",
    duration = 2200,
  ) => {
    await presentToast({ message, color, duration, position: "top" });
  };

  const alternarGrabacion = async () => {
    if (isRecording) {
      await detenerGrabacion();
    } else {
      await iniciarGrabacion();
    }
  };

  const transcribirAudio = async () => {
    if (!grabacion) return;
    setTranscribiendo(true);
    await presentLoading({ message: "Transcribiendo con Scribe v2…" });
    try {
      const resultado = await transcribirConElevenLabs(
        grabacion.base64,
        grabacion.mimeType,
        idioma,
      );
      const texto = resultado.texto.trim() || "Sin texto detectado.";
      await agregar(texto, "nube");
      await avisar(
        `Transcripción archivada · ${resultado.duracionMs} ms`,
        "success",
      );
    } catch (e) {
      await avisar(
        e instanceof Error ? e.message : "No se pudo transcribir el audio.",
        "danger",
        3600,
      );
    } finally {
      setTranscribiendo(false);
      await dismissLoading();
    }
  };

  const guardarManual = async () => {
    const texto = textoManual.trim();
    if (!texto) {
      await avisar("Escribe una frase antes de guardarla.", "warning");
      return;
    }
    try {
      await agregar(texto, "manual");
      setTextoManual("");
      await avisar("Frase guardada en Preferences.", "success");
    } catch {
      await avisar("No se pudo escribir en el almacén.", "danger");
    }
  };

  const simularTranscripcion = async () => {
    const frase = FRASES_DEMO[historial.length % FRASES_DEMO.length];
    try {
      await agregar(frase, "nube");
      await avisar("Transcripción simulada y persistida.", "success");
    } catch {
      await avisar("No se pudo escribir en el almacén.", "danger");
    }
  };

  const borrarFrase = async (id: string) => {
    try {
      await eliminar(id);
      await avisar("Frase eliminada del almacén.", "medium", 1800);
    } catch {
      await avisar("No se pudo actualizar el almacén.", "danger");
    }
  };

  const copiarFrase = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      await avisar("Texto copiado al portapapeles.", "success", 1600);
    } catch {
      await avisar("El navegador bloqueó el portapapeles.", "warning");
    }
  };

  const vaciarHistorial = async () => {
    if (!historial.length) return;
    const previo: FraseHistorial[] = historial;
    try {
      await limpiar();
      await presentToast({
        message: "Historial borrado de Preferences.",
        color: "warning",
        duration: 4500,
        position: "top",
        buttons: [
          {
            text: "Deshacer",
            role: "cancel",
            handler: () => {
              void restaurar(previo);
            },
          },
        ],
      });
    } catch {
      await avisar("No se pudo limpiar el almacén.", "danger");
    }
  };

  const recargarDesdeDisco = async () => {
    await recargar();
    await avisar("Historial releído desde Preferences.", "medium", 1800);
  };

  const guardarCopiaLocal = async () => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY_LOCAL,
        JSON.stringify(historial),
      );
      setCopiaLocal(leerCopiaLocal());
      await avisar("Copia escrita con localStorage (síncrono).", "medium");
    } catch {
      await avisar("localStorage rechazó la escritura.", "danger");
    }
  };

  const borrarCopiaLocal = async () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY_LOCAL);
      setCopiaLocal(leerCopiaLocal());
      await avisar("Copia web eliminada.", "medium", 1800);
    } catch {
      await avisar("No se pudo borrar la copia web.", "danger");
    }
  };

  const permisoTexto =
    estadoPermiso === "granted"
      ? "micrófono autorizado"
      : estadoPermiso === "denied"
        ? "permiso denegado"
        : "permiso sin verificar";

  return (
    <IonPage className="reto4-page">
      <IonHeader className="reto4-header">
        <IonToolbar>
          <IonButton slot="start" routerLink="/home" fill="clear" color="light">
            <IonIcon icon={arrowBack} slot="start" />
            Retos
          </IonButton>
          <IonTitle>Reto Relámpago · Día 4</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid fixed className="reto4-wrap">
          {/* Encabezado */}
          <IonRow className="ion-justify-content-center">
            <IonCol
              size="12"
              sizeMd="11"
              sizeLg="10"
              className="ion-text-center"
            >
              <IonNote className="reto4-kicker">
                <IonIcon icon={flash} />
                DÍA 4 · UX NATIVA + PERSISTENCIA
              </IonNote>
              <h1 className="reto4-title">
                Historial que sobrevive a un reinicio
              </h1>
              <p className="reto4-subtitle">
                Toast y Loading en lugar de diálogos bloqueantes, y{" "}
                <code>@capacitor/preferences</code> en lugar de{" "}
                <code>localStorage</code>.
              </p>

              <IonRow className="reto4-chips">
                <IonCol size="auto">
                  <IonChip className="reto4-chip">
                    <IonIcon slot="start" icon={saveOutline} />
                    <IonLabel>
                      {historial.length} frase{" "}
                      {historial.length === 1 ? "" : "s"} en disco
                    </IonLabel>
                  </IonChip>
                </IonCol>
                <IonCol size="auto">
                  <IonChip
                    className="reto4-chip"
                    data-estado={estadoPermiso}
                  >
                    <IonIcon slot="start" icon={micOutline} />
                    <IonLabel>{permisoTexto}</IonLabel>
                  </IonChip>
                </IonCol>
                <IonCol size="auto">
                  <IonChip className="reto4-chip">
                    <IonIcon slot="start" icon={hardwareChipOutline} />
                    <IonLabel>
                      plataforma: {Capacitor.getPlatform()}
                    </IonLabel>
                  </IonChip>
                </IonCol>
              </IonRow>
            </IonCol>
          </IonRow>

          <IonRow className="reto4-main">
            {/* 1 · Captura */}
            <IonCol size="12" sizeMd="5">
              <IonCard className="reto4-panel">
                <IonCardHeader>
                  <IonCardSubtitle>1 · Feedback al usuario</IonCardSubtitle>
                  <IonCardTitle>Captura y transcripción</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <IonItem lines="none" className="reto4-select">
                    <IonLabel>
                      <IonIcon slot="start" icon={languageOutline} />
                      Idioma del audio
                    </IonLabel>
                    <IonSelect
                      interface="popover"
                      value={idioma}
                      onIonChange={(e) => setIdioma(e.detail.value)}
                    >
                      <IonSelectOption value="spa">Español (spa)</IonSelectOption>
                      <IonSelectOption value="eng">Inglés (eng)</IonSelectOption>
                      <IonSelectOption value="fra">Francés (fra)</IonSelectOption>
                      <IonSelectOption value="por">
                        Portugués (por)
                      </IonSelectOption>
                    </IonSelect>
                  </IonItem>

                  <p className={`reto4-timer ${isRecording ? "activo" : ""}`}>
                    {reloj}
                  </p>

                  <IonRow className="reto4-mic">
                    <IonCol size="auto">
                      <IonButton
                        className={`reto4-mic-btn ${isRecording ? "grabando" : ""}`}
                        color={isRecording ? "danger" : "primary"}
                        shape="round"
                        onClick={() => void alternarGrabacion()}
                      >
                        <IonIcon
                          slot="icon-only"
                          icon={isRecording ? stopCircleOutline : micOutline}
                        />
                      </IonButton>
                      <IonText className="reto4-mic-label">
                        {isRecording
                          ? "Grabando… toca para detener"
                          : "Toca para grabar una frase"}
                      </IonText>
                    </IonCol>
                  </IonRow>

                  {grabacion && (
                    <>
                      <audio
                        controls
                        className="reto4-audio"
                        src={`data:${grabacion.mimeType};base64,${grabacion.base64}`}
                      />
                      <IonItem lines="none" className="reto4-audio-meta">
                        <IonIcon slot="start" icon={documentTextOutline} />
                        <IonLabel>
                          {grabacion.mimeType} · {grabacion.kb} KB
                        </IonLabel>
                      </IonItem>
                    </>
                  )}

                  <IonButton
                    expand="block"
                    color="success"
                    className="reto4-btn-principal"
                    disabled={!grabacion || transcribiendo || isRecording}
                    onClick={() => void transcribirAudio()}
                  >
                    {transcribiendo ? (
                      <>
                        <IonSpinner name="crescent" slot="start" />
                        Transcribiendo…
                      </>
                    ) : (
                      <>
                        <IonIcon icon={cloudUploadOutline} slot="start" />
                        Transcribir y guardar
                      </>
                    )}
                  </IonButton>

                  {errorGrabacion && (
                    <IonText color="danger">
                      <p className="reto4-error">{errorGrabacion}</p>
                    </IonText>
                  )}

                  <IonItem lines="full" className="reto4-divisor">
                    <IonLabel className="reto4-divisor-texto">
                      o sin micrófono
                    </IonLabel>
                  </IonItem>

                  <IonInput
                    className="reto4-input"
                    fill="outline"
                    placeholder="Escribe una frase para el historial…"
                    value={textoManual}
                    onIonInput={(e) => setTextoManual(e.detail.value ?? "")}
                  />

                  <IonRow className="reto4-acciones">
                    <IonCol size="12" sizeMd="6">
                      <IonButton
                        expand="block"
                        fill="solid"
                        className="reto4-btn-secundario"
                        onClick={() => void guardarManual()}
                      >
                        <IonIcon icon={saveOutline} slot="start" />
                        Guardar
                      </IonButton>
                    </IonCol>
                    <IonCol size="12" sizeMd="6">
                      <IonButton
                        expand="block"
                        fill="outline"
                        className="reto4-btn-secundario"
                        onClick={() => void simularTranscripcion()}
                      >
                        <IonIcon icon={sparklesOutline} slot="start" />
                        Simular
                      </IonButton>
                    </IonCol>
                  </IonRow>

                  <IonText className="reto4-hint">
                    <IonIcon slot="start" icon={informationCircleOutline} />
                    <IonLabel>
                      Sin API key puedes usar «Simular»: el flujo de persistencia
                      y el Toast se comportan igual.
                    </IonLabel>
                  </IonText>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* 2 · Historial */}
            <IonCol size="12" sizeMd="7">
              <IonCard className="reto4-panel">
                <IonCardHeader>
                  <IonCardSubtitle>2 · @capacitor/preferences</IonCardSubtitle>
                  <IonCardTitle>Historial persistente</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <IonList inset className="reto4-lista">
                    <IonListHeader>
                      <IonLabel>Transcripciones archivadas</IonLabel>
                      <IonNote slot="end">{historial.length}</IonNote>
                    </IonListHeader>

                    {cargando && (
                      <IonItem lines="none">
                        <IonSpinner name="dots" slot="start" />
                        <IonLabel>Leyendo Preferences…</IonLabel>
                      </IonItem>
                    )}

                    {!cargando && historial.length === 0 && (
                      <IonItem lines="none" className="reto4-vacio">
                        <IonIcon
                          slot="start"
                          icon={folderOpenOutline}
                          className="reto4-vacio-icono"
                        />
                        <IonLabel className="ion-text-wrap">
                          <h3>Aún no hay frases</h3>
                          <p>
                            Graba una nota, escríbela o pulsa «Simular». Luego
                            recarga la página con F5.
                          </p>
                        </IonLabel>
                      </IonItem>
                    )}

                    {historial.map((item) => (
                      <IonItem key={item.id} className="reto4-item">
                        <IonIcon
                          slot="start"
                          icon={chatbubbleOutline}
                          className="reto4-item-icono"
                        />
                        <IonLabel className="ion-text-wrap">
                          <h3>{item.texto}</h3>
                          <p>
                            <IonIcon icon={timeOutline} />{" "}
                            {formatearFecha(item.fecha)} ·{" "}
                            {item.origen === "nube" ? "Scribe v2" : "manual"}
                          </p>
                        </IonLabel>
                        <IonButton
                          slot="end"
                          fill="clear"
                          color="medium"
                          aria-label="Copiar frase"
                          onClick={() => void copiarFrase(item.texto)}
                        >
                          <IonIcon slot="icon-only" icon={copyOutline} />
                        </IonButton>
                        <IonButton
                          slot="end"
                          fill="clear"
                          color="danger"
                          aria-label="Eliminar frase"
                          onClick={() => void borrarFrase(item.id)}
                        >
                          <IonIcon slot="icon-only" icon={trashOutline} />
                        </IonButton>
                      </IonItem>
                    ))}
                  </IonList>

                  {errorHistorial && (
                    <IonText color="danger">
                      <p className="reto4-error">{errorHistorial}</p>
                    </IonText>
                  )}

                  <IonRow className="reto4-acciones reto4-acciones-lista">
                    <IonCol size="auto">
                      <IonButton
                        fill="outline"
                        color="warning"
                        disabled={!historial.length}
                        onClick={() => void vaciarHistorial()}
                      >
                        <IonIcon icon={trashOutline} slot="start" />
                        Vaciar
                      </IonButton>
                    </IonCol>
                    <IonCol size="auto">
                      <IonButton
                        fill="outline"
                        color="medium"
                        onClick={() => void recargarDesdeDisco()}
                      >
                        <IonIcon icon={refreshOutline} slot="start" />
                        Releer de disco
                      </IonButton>
                    </IonCol>
                  </IonRow>

                  <IonText className="reto4-hint">
                    <IonIcon slot="start" icon={listOutline} />
                    <IonLabel>
                      <code>IonList inset</code> +
                      <code>slot="start"</code> /
                      <code>slot="end"</code>: piezas oficiales de Ionic, sin
                      CSS propio para cada sistema.
                    </IonLabel>
                  </IonText>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {/* 3 · Laboratorio comparativo */}
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="11" sizeLg="10">
              <IonCard className="reto4-panel reto4-lab">
                <IonCardHeader>
                  <IonCardSubtitle>3 · Laboratorio</IonCardSubtitle>
                  <IonCardTitle>Preferences vs. localStorage</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <IonGrid className="reto4-compare">
                    <IonRow>
                      <IonCol size="12" sizeMd="6">
                        <IonCard className="reto4-store nativo">
                          <IonItem lines="none" className="reto4-store-head">
                            <IonIcon slot="start" icon={serverOutline} />
                            <IonLabel>
                              <h3>@capacitor/preferences</h3>
                              <code>{STORAGE_KEY}</code>
                            </IonLabel>
                            <IonBadge
                              color={
                                bytesPreferences > 0 ? "success" : "medium"
                              }
                            >
                              {bytesPreferences} B
                            </IonBadge>
                          </IonItem>
                          <IonText className="reto4-crudo">
                            <pre>{embellecerJson(crudo)}</pre>
                          </IonText>
                          <IonItem lines="none" className="reto4-store-pie">
                            <IonIcon slot="start" icon={phonePortraitOutline} />
                            <IonLabel>
                              Android: SharedPreferences · iOS: NSUserDefaults
                            </IonLabel>
                          </IonItem>
                        </IonCard>
                      </IonCol>

                      <IonCol size="12" sizeMd="6">
                        <IonCard className="reto4-store web">
                          <IonItem lines="none" className="reto4-store-head">
                            <IonIcon
                              slot="start"
                              icon={documentTextOutline}
                            />
                            <IonLabel>
                              <h3>window.localStorage</h3>
                              <code>{STORAGE_KEY_LOCAL}</code>
                            </IonLabel>
                            <IonBadge color={bytesLocal > 0 ? "success" : "medium"}>
                              {bytesLocal} B
                            </IonBadge>
                          </IonItem>
                          <IonText className="reto4-crudo">
                            <pre>{embellecerJson(copiaLocal)}</pre>
                          </IonText>
                          <IonItem lines="none" className="reto4-store-acciones">
                            <IonButton
                              size="small"
                              fill="outline"
                              onClick={() => void guardarCopiaLocal()}
                            >
                              <IonIcon icon={copyOutline} slot="start" />
                              Guardar copia web
                            </IonButton>
                            <IonButton
                              size="small"
                              fill="clear"
                              color="danger"
                              disabled={!copiaLocal}
                              onClick={() => void borrarCopiaLocal()}
                            >
                              <IonIcon icon={trashOutline} slot="start" />
                              Borrar
                            </IonButton>
                          </IonItem>
                        </IonCard>
                      </IonCol>
                    </IonRow>
                  </IonGrid>

                  <IonText className="reto4-hint reto4-hint-lab">
                    <IonIcon slot="start" icon={informationCircleOutline} />
                    <IonLabel>
                      En el navegador, Preferences se apoya en{" "}
                      <code>localStorage</code> con el prefijo{" "}
                      <code>{PREFIJO_WEB}</code> (visible en DevTools →
                      Application → Local Storage). En el dispositivo usa el
                      almacén del sistema y sobrevive a purgas de memoria,
                      actualizaciones y reinicios.
                    </IonLabel>
                  </IonText>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {/* Checkpoint */}
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="11" sizeLg="10">
              <IonCard className="reto4-checkpoint">
                <IonItem lines="none" className="reto4-checkpoint-head">
                  <IonIcon
                    slot="start"
                    icon={checkmarkCircleOutline}
                  />
                  <IonLabel>
                    <h2>Checkpoint del Día 4</h2>
                    <p>
                      La versión web debe quedar operativa antes de compilar
                      para Android.
                    </p>
                  </IonLabel>
                </IonItem>

                <IonGrid className="reto4-check-grid">
                  <IonRow>
                    <IonCol size="12" sizeMd="4">
                      <IonItem lines="none" className="reto4-check">
                        <IonLabel>
                          <h3>1 · Registro con feedback</h3>
                          <p>
                            Guarda una frase y confirma el Toast de éxito en la
                            parte superior, sin diálogos del navegador.
                          </p>
                        </IonLabel>
                      </IonItem>
                    </IonCol>
                    <IonCol size="12" sizeMd="4">
                      <IonItem lines="none" className="reto4-check">
                        <IonLabel>
                          <h3>2 · Prueba de recarga (F5)</h3>
                          <p>
                            Refresca la pestaña: el historial se relee desde
                            Preferences y sigue visible.
                          </p>
                        </IonLabel>
                      </IonItem>
                    </IonCol>
                    <IonCol size="12" sizeMd="4">
                      <IonItem lines="none" className="reto4-check">
                        <IonLabel>
                          <h3>3 · Build sin errores</h3>
                          <p>
                            Ejecuta <code>npm run build</code> y confirma que
                            TypeScript no reporte fallos.
                          </p>
                        </IonLabel>
                      </IonItem>
                    </IonCol>
                  </IonRow>
                </IonGrid>

                <IonItem lines="none" className="reto4-siguiente">
                  <IonIcon
                    slot="start"
                    icon={alertCircleOutline}
                  />
                  <IonLabel>
                    Siguiente sesión (Día 5): compilación en celular físico,
                    AndroidManifest.xml y Chrome DevTools.
                  </IonLabel>
                </IonItem>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default RetoDia4;
