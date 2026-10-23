import { useEffect } from "react";
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
  IonNote,
  IonPage,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  arrowBack,
  flash,
  hardwareChipOutline,
  micOutline,
  stopCircleOutline,
} from "ionicons/icons";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import "./RetoDia2.css";

const RetoDia2: React.FC = () => {
  const {
    isRecording,
    grabacion,
    error,
    segundos,
    estadoPermiso,
    iniciarGrabacion,
    detenerGrabacion,
    consultarPermiso,
  } = useVoiceRecorder();

  // Consulta silenciosa del permiso al abrir la página
  useEffect(() => {
    void consultarPermiso();
  }, [consultarPermiso]);

  const reloj = `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(
    segundos % 60,
  ).padStart(2, "0")}`;

  const permisoColor =
    estadoPermiso === "granted"
      ? "success"
      : estadoPermiso === "denied"
        ? "danger"
        : "warning";

  return (
    <IonPage className="reto2-page">
      <IonHeader className="reto2-header">
        <IonToolbar>
          <IonButton slot="start" routerLink="/home" fill="clear" color="light">
            <IonIcon icon={arrowBack} slot="start" />
            Retos
          </IonButton>
          <IonTitle>Reto Relámpago · Día 2</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid fixed className="reto2-wrap">
          {/* Encabezado */}
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="10" sizeLg="9" className="ion-text-center">
              <IonNote className="reto2-kicker">
                <IonIcon icon={flash} />
                DÍA 2 · CHECKPOINT
              </IonNote>
              <h1 className="reto2-title">Micrófono Real con Capacitor</h1>
              <p className="reto2-subtitle">
                Comprueba que el micrófono del dispositivo entrega audio en
                Base64 listo para la capa de transcripción.
              </p>
            </IonCol>
          </IonRow>

          {/* Grabadora + Resultado */}
          <IonRow className="reto2-main">
            {/* Grabadora */}
            <IonCol size="12" sizeMd="5">
              <IonCard className="reto2-panel">
                <IonCardHeader>
                  <IonCardSubtitle>Paso 2 · Captura</IonCardSubtitle>
                  <IonCardTitle>Grabadora</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <IonRow className="reto2-chips">
                    <IonCol size="auto">
                      <IonNote className="reto2-chip">
                        <IonIcon icon={hardwareChipOutline} />
                        capacitor-voice-recorder
                      </IonNote>
                    </IonCol>
                    <IonCol size="auto">
                      <IonNote className="reto2-chip" data-estado={permisoColor}>
                        <IonIcon icon={micOutline} />
                        {estadoPermiso}
                      </IonNote>
                    </IonCol>
                  </IonRow>

                  <p className={`reto2-timer ${isRecording ? "activo" : ""}`}>
                    {reloj}
                  </p>

                  <IonRow className="reto2-mic">
                    <IonCol size="12" className="ion-text-center">
                      <IonButton
                        className={`reto2-mic-btn ${isRecording ? "grabando" : ""}`}
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
                          icon={isRecording ? stopCircleOutline : micOutline}
                        />
                      </IonButton>
                      <IonNote className="reto2-mic-label">
                        {isRecording
                          ? "Grabando… toca para detener"
                          : "Toca para grabar"}
                      </IonNote>
                    </IonCol>
                  </IonRow>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* Resultado */}
            <IonCol size="12" sizeMd="7">
              <IonCard className="reto2-panel">
                <IonCardHeader>
                  <IonCardSubtitle>Paso 3 · Reproducción</IonCardSubtitle>
                  <IonCardTitle>Resultado</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  {error && (
                    <IonText color="danger">
                      <p className="reto2-error">{error}</p>
                    </IonText>
                  )}

                  {grabacion ? (
                    <>
                      <audio
                        controls
                        src={`data:${grabacion.mimeType};base64,${grabacion.base64}`}
                        className="reto2-audio"
                      />

                      <IonRow className="reto2-datos">
                        <IonCol size="6" className="ion-text-center">
                          <IonNote className="reto2-dato-label">Base64</IonNote>
                          <p className="reto2-dato-valor">
                            {grabacion.caracteresBase64.toLocaleString()}
                            <span> caracteres</span>
                          </p>
                        </IonCol>
                        <IonCol size="6" className="ion-text-center">
                          <IonNote className="reto2-dato-label">Tamaño</IonNote>
                          <p className="reto2-dato-valor">
                            {grabacion.kb}
                            <span> KB</span>
                          </p>
                        </IonCol>
                        <IonCol size="12" className="ion-text-center">
                          <IonNote className="reto2-dato-label">MIME</IonNote>
                          <p className="reto2-dato-valor">{grabacion.mimeType}</p>
                        </IonCol>
                      </IonRow>

                      <IonText color="medium">
                        <p className="reto2-nota">
                          Revisa la consola: ahí se imprime el objeto con{" "}
                          <code>mimeType</code> y el tamaño exacto del Base64.
                        </p>
                      </IonText>
                    </>
                  ) : (
                    <p
                      className={`reto2-vacio ${isRecording ? "grabando" : ""}`}
                    >
                      {isRecording
                        ? "Grabando… detén la grabación para escuchar el audio."
                        : "Aún no hay audio. Graba unos segundos y aparecerá aquí."}
                    </p>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {/* Banner Día 3 */}
          <IonRow>
            <IonCol size="12">
              <IonCard className="reto2-banner">
                <IonCardContent>
                  <IonIcon icon={flash} className="reto2-banner-icono" />
                  <IonText>
                    <strong>Mañana en el Día 3:</strong> conversión a binario y
                    transcripción con{" "}
                    <strong className="rosa">ElevenLabs Scribe</strong> y motor
                    nativo.
                  </IonText>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default RetoDia2;
