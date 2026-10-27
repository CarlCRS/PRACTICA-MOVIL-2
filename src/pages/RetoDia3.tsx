import { useState } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  arrowBack,
  cloudOutline,
  cloudUploadOutline,
  codeSlashOutline,
  flash,
  globeOutline,
  hardwareChipOutline,
  informationCircleOutline,
  keyOutline,
  micOutline,
  phonePortraitOutline,
  radioOutline,
  serverOutline,
  stopCircleOutline,
  textOutline,
  timeOutline,
  warningOutline,
} from "ionicons/icons";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import {
  transcribirConElevenLabs,
  type ResultadoTranscripcion,
} from "../services/elevenlabs";
import "./RetoDia3.css";

type Caso = "nube" | "nativo";

interface Requisito {
  icono: string;
  titulo: string;
  texto: string;
}

/** Caso A · Nube: qué se necesita */
const REQUISITOS_NUBE: Requisito[] = [
  {
    icono: keyOutline,
    titulo: "API Key de ElevenLabs",
    texto: "VITE_ELEVENLABS_API_KEY en un archivo .env (solo para práctica).",
  },
  {
    icono: globeOutline,
    titulo: "Conexión a internet",
    texto: "El audio viaja a la API; el procesamiento no es on-device.",
  },
  {
    icono: serverOutline,
    titulo: "@elevenlabs/elevenlabs-js",
    texto: "SDK instalado para invocar speechToText.convert().",
  },
  {
    icono: micOutline,
    titulo: "Micrófono y permiso",
    texto:
      "La WebView o el navegador pide acceso al grabar; sin él no hay audio.",
  },
  {
    icono: codeSlashOutline,
    titulo: "Audio en Base64",
    texto: "Se convierte a File con base64ToFile(); mínimo 100 ms de audio.",
  },
  {
    icono: textOutline,
    titulo: "Modelo e idioma",
    texto: "scribe_v2 + languageCode ISO-639 (spa, eng, fra, por).",
  },
];

/** Caso B · Nativo: qué se necesita */
const REQUISITOS_NATIVO: Requisito[] = [
  {
    icono: hardwareChipOutline,
    titulo: "@capgo/capacitor-speech-recognition",
    texto: "Instalado + npx cap sync para copiarlo al proyecto nativo.",
  },
  {
    icono: phonePortraitOutline,
    titulo: "Servicios de voz del sistema",
    texto: "Google Speech en Android / Apple Speech en iOS, activos.",
  },
  {
    icono: micOutline,
    titulo: "Permisos del dispositivo",
    texto:
      "Micrófono + voz. iOS: NSSpeechRecognitionUsageDescription y NSMicrophoneUsageDescription.",
  },
  {
    icono: globeOutline,
    titulo: "Idioma configurado",
    texto: "locale tipo es-ES, en-US, pt-BR…",
  },
  {
    icono: cloudOutline,
    titulo: "Sin API Key ni costo",
    texto: "On-device. En navegador cae a Web Speech API (Chrome/Edge).",
  },
];

const RetoDia3: React.FC = () => {
  const [caso, setCaso] = useState<Caso>("nube");

  // Caso A
  const {
    isRecording,
    grabacion,
    error: errorGrabacion,
    segundos,
    iniciarGrabacion,
    detenerGrabacion,
  } = useVoiceRecorder();
  const [idiomaScribe, setIdiomaScribe] = useState("spa");
  const [transcribiendo, setTranscribiendo] = useState(false);
  const [resultado, setResultado] = useState<ResultadoTranscripcion | null>(
    null,
  );
  const [errorNube, setErrorNube] = useState<string | null>(null);

  // Caso B
  const {
    motor,
    disponible,
    escuchando,
    texto,
    error: errorVoz,
    iniciarEscucha,
    detenerEscucha,
  } = useSpeechRecognition();
  const [idiomaVoz, setIdiomaVoz] = useState("es-ES");

  const relojGrabacion = `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(
    segundos % 60,
  ).padStart(2, "0")}`;

  const cambiarCaso = async (nuevo: Caso) => {
    if (nuevo === caso) return;
    if (isRecording) await detenerGrabacion();
    if (escuchando) await detenerEscucha();
    setCaso(nuevo);
  };

  const transcribir = async () => {
    if (!grabacion) return;
    setTranscribiendo(true);
    setErrorNube(null);
    setResultado(null);
    try {
      const r = await transcribirConElevenLabs(
        grabacion.base64,
        grabacion.mimeType,
        idiomaScribe,
      );
      setResultado(r);
    } catch (e) {
      setErrorNube(
        e instanceof Error ? e.message : "No se pudo transcribir el audio.",
      );
    } finally {
      setTranscribiendo(false);
    }
  };

  return (
    <IonPage className="reto3-page">
      <IonHeader className="reto3-header">
        <IonToolbar>
          <IonButton slot="start" routerLink="/home" fill="clear" color="light">
            <IonIcon icon={arrowBack} slot="start" />
            Retos
          </IonButton>
          <IonTitle>Reto Relámpago · Día 3</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid fixed className="reto3-wrap">
          {/* Encabezado */}
          <IonRow className="ion-justify-content-center">
            <IonCol
              size="12"
              sizeMd="10"
              sizeLg="9"
              className="ion-text-center"
            >
              <IonNote className="reto3-kicker">
                <IonIcon icon={flash} />
                DÍA 3 · CHECKPOINT
              </IonNote>
              <h1 className="reto3-title">De Voz a Texto: Nube vs. Nativo</h1>
              <p className="reto3-subtitle">
                Dos motores, dos estrategias: transcripción de archivo con IA en
                la nube y reconocimiento instantáneo por hardware.
              </p>
            </IonCol>
          </IonRow>

          {/* Selector de caso */}
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="10" sizeLg="8">
              <IonSegment
                className="reto3-segment"
                value={caso}
                onIonChange={(e) => void cambiarCaso(e.detail.value as Caso)}
              >
                <IonSegmentButton value="nube">
                  <IonIcon icon={cloudOutline} />
                  <IonLabel>Nube · Scribe v2</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="nativo">
                  <IonIcon icon={radioOutline} />
                  <IonLabel>Nativo · Voz en vivo</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </IonCol>
          </IonRow>

          {caso === "nube" ? (
            <>
              <IonRow className="reto3-main">
                {/* Requisitos Caso A */}
                <IonCol size="12" sizeMd="5">
                  <IonCard className="reto3-panel">
                    <IonCardHeader>
                      <IonCardSubtitle>Caso A </IonCardSubtitle>
                      <IonCardTitle>Nube (ElevenLabs)</IonCardTitle>
                    </IonCardHeader>
                  </IonCard>
                </IonCol>

                {/* Ejercicio Caso A */}
                <IonCol size="12" sizeMd="7">
                  <IonCard className="reto3-panel">
                    <IonCardHeader>
                      <IonCardSubtitle>Caso A · Ejercicio</IonCardSubtitle>
                      <IonCardTitle>Grabadora + Scribe</IonCardTitle>
                    </IonCardHeader>

                    <IonCardContent>
                      <IonItem lines="none" className="reto3-select">
                        <IonLabel>Idioma del audio</IonLabel>
                        <IonSelect
                          interface="popover"
                          value={idiomaScribe}
                          onIonChange={(e) => setIdiomaScribe(e.detail.value)}
                        >
                          <IonSelectOption value="spa">
                            Español (spa)
                          </IonSelectOption>
                          <IonSelectOption value="eng">
                            Inglés (eng)
                          </IonSelectOption>
                          <IonSelectOption value="fra">
                            Francés (fra)
                          </IonSelectOption>
                          <IonSelectOption value="por">
                            Portugués (por)
                          </IonSelectOption>
                        </IonSelect>
                      </IonItem>

                      <p
                        className={`reto3-timer ${isRecording ? "activo" : ""}`}
                      >
                        {relojGrabacion}
                      </p>

                      <IonRow className="reto3-mic">
                        <IonCol size="12" className="ion-text-center">
                          <IonButton
                            className={`reto3-mic-btn ${
                              isRecording ? "grabando" : ""
                            }`}
                            color={isRecording ? "danger" : "primary"}
                            shape="round"
                            onClick={() =>
                              isRecording
                                ? void detenerGrabacion()
                                : void iniciarGrabacion()
                            }
                          >
                            <IonIcon
                              slot="icon-only"
                              icon={
                                isRecording ? stopCircleOutline : micOutline
                              }
                            />
                          </IonButton>
                          <IonNote className="reto3-mic-label">
                            {isRecording
                              ? "Grabando… toca para detener"
                              : "Graba una frase"}
                          </IonNote>
                        </IonCol>
                      </IonRow>

                      {grabacion && (
                        <audio
                          controls
                          className="reto3-audio"
                          src={`data:${grabacion.mimeType};base64,${grabacion.base64}`}
                        />
                      )}

                      <IonButton
                        expand="block"
                        color="success"
                        className="reto3-btn-transcribir"
                        disabled={!grabacion || transcribiendo}
                        onClick={() => void transcribir()}
                      >
                        {transcribiendo ? (
                          <>
                            <IonSpinner name="crescent" slot="start" />
                            Transcribiendo…
                          </>
                        ) : (
                          <>
                            <IonIcon icon={cloudUploadOutline} slot="start" />
                            Transcribir con Scribe v2
                          </>
                        )}
                      </IonButton>

                      {errorGrabacion && (
                        <IonText color="danger">
                          <p className="reto3-error">{errorGrabacion}</p>
                        </IonText>
                      )}

                      {errorNube && (
                        <IonText color="danger">
                          <p className="reto3-error">{errorNube}</p>
                        </IonText>
                      )}

                      {resultado ? (
                        <IonCard className="reto3-resultado">
                          <IonCardContent>
                            <IonNote className="reto3-resultado-label">
                              Transcripción · {resultado.modelo}
                            </IonNote>
                            <IonText>
                              <p className="reto3-resultado-texto">
                                {resultado.texto || "Sin texto detectado."}
                              </p>
                            </IonText>
                            <IonNote className="reto3-resultado-meta">
                              <IonIcon icon={timeOutline} />{" "}
                              {resultado.duracionMs} ms · languageCode:{" "}
                              {idiomaScribe}
                            </IonNote>
                          </IonCardContent>
                        </IonCard>
                      ) : (
                        !transcribiendo && (
                          <p className="reto3-vacio">
                            Graba una frase y pulsa “Transcribir” para ver el
                            resultado aquí.
                          </p>
                        )
                      )}
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>

              {/* Aviso seguridad */}
              <IonRow>
                <IonCol size="12">
                  <IonCard className="reto3-aviso rojo">
                    <IonCardContent>
                      <IonIcon
                        icon={warningOutline}
                        className="reto3-aviso-icono"
                      />
                      <IonText>
                        <strong>Práctica vs. producción:</strong> Vite incrusta
                        las variables <code>VITE_*</code> en el JavaScript
                        compilado. En producción se usa un{" "}
                        <strong>backend proxy</strong>: App → Tu servidor →
                        ElevenLabs.
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </>
          ) : (
            <>
              <IonRow className="reto3-main">
                {/* Requisitos Caso B */}
                <IonCol size="12" sizeMd="5">
                  <IonCard className="reto3-panel">
                    <IonCardHeader>
                      <IonCardSubtitle>Caso B · Qué necesitas</IonCardSubtitle>
                      <IonCardTitle>Nativo (on-device)</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList lines="none" className="reto3-req">
                        {REQUISITOS_NATIVO.map((r) => (
                          <IonItem key={r.titulo} lines="none">
                            <IonIcon
                              icon={r.icono}
                              slot="start"
                              className="reto3-req-icono"
                            />
                            <IonLabel>
                              <h3>{r.titulo}</h3>
                              <p>{r.texto}</p>
                            </IonLabel>
                          </IonItem>
                        ))}
                      </IonList>
                    </IonCardContent>
                  </IonCard>
                </IonCol>

                {/* Ejercicio Caso B */}
                <IonCol size="12" sizeMd="7">
                  <IonCard className="reto3-panel">
                    <IonCardHeader>
                      <IonCardSubtitle>Caso B · Ejercicio</IonCardSubtitle>
                      <IonCardTitle>Voz en vivo</IonCardTitle>
                    </IonCardHeader>

                    <IonCardContent>
                      <IonItem lines="none" className="reto3-select">
                        <IonLabel>Idioma</IonLabel>
                        <IonSelect
                          interface="popover"
                          value={idiomaVoz}
                          onIonChange={(e) => setIdiomaVoz(e.detail.value)}
                        >
                          <IonSelectOption value="es-ES">
                            Español (es-ES)
                          </IonSelectOption>
                          <IonSelectOption value="en-US">
                            Inglés (en-US)
                          </IonSelectOption>
                          <IonSelectOption value="pt-BR">
                            Portugués (pt-BR)
                          </IonSelectOption>
                          <IonSelectOption value="fr-FR">
                            Francés (fr-FR)
                          </IonSelectOption>
                        </IonSelect>
                      </IonItem>

                      <IonRow className="reto3-chips">
                        <IonCol size="auto">
                          <IonNote className="reto3-chip">
                            <IonIcon icon={hardwareChipOutline} />
                            {motor === "nativo"
                              ? "Motor nativo (Capgo)"
                              : "Web Speech API"}
                          </IonNote>
                        </IonCol>
                        <IonCol size="auto">
                          <IonNote
                            className="reto3-chip"
                            data-estado={
                              disponible === null
                                ? "warning"
                                : disponible
                                  ? "success"
                                  : "danger"
                            }
                          >
                            {disponible === null
                              ? "verificando…"
                              : disponible
                                ? "disponible"
                                : "no disponible"}
                          </IonNote>
                        </IonCol>
                      </IonRow>

                      <IonRow className="reto3-mic">
                        <IonCol size="12" className="ion-text-center">
                          <IonButton
                            className={`reto3-mic-btn ${
                              escuchando ? "grabando" : ""
                            }`}
                            color={escuchando ? "danger" : "primary"}
                            shape="round"
                            onClick={() =>
                              escuchando
                                ? void detenerEscucha()
                                : void iniciarEscucha(idiomaVoz)
                            }
                          >
                            <IonIcon
                              slot="icon-only"
                              icon={escuchando ? stopCircleOutline : micOutline}
                            />
                          </IonButton>
                          <IonNote className="reto3-mic-label">
                            {escuchando ? "Escuchando…" : "Toca para hablar"}
                          </IonNote>
                        </IonCol>
                      </IonRow>

                      {errorVoz && (
                        <IonText color="danger">
                          <p className="reto3-error">{errorVoz}</p>
                        </IonText>
                      )}

                      <IonCard className="reto3-resultado vivo">
                        <IonCardContent>
                          <IonNote className="reto3-resultado-label">
                            Transcripción en vivo
                          </IonNote>
                          <IonText>
                            <p className="reto3-resultado-texto">
                              {texto ||
                                "El texto aparecerá aquí mientras hablas…"}
                            </p>
                          </IonText>
                        </IonCardContent>
                      </IonCard>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>

              {/* Concepto transcribir vs traducir */}
              <IonRow>
                <IonCol size="12">
                  <IonCard className="reto3-aviso azul">
                    <IonCardContent>
                      <IonIcon
                        icon={informationCircleOutline}
                        className="reto3-aviso-icono"
                      />
                      <IonText>
                        <strong>Transcribir no es traducir:</strong> ambos
                        motores escriben lo que oyen en el idioma de entrada.
                        Para traducir se agrega una segunda etapa:{" "}
                        <code>
                          [Audio] → STT → [Texto] → backend/LLM → [Español]
                        </code>
                        .
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default RetoDia3;
