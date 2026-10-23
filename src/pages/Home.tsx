import React, { useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonText,
  IonBadge,
  IonSpinner,
  IonButtons,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  useIonToast,
} from "@ionic/react";
import {
  micOutline,
  stopCircleOutline,
  languageOutline,
  personCircleOutline,
} from "ionicons/icons";
import "./Home.css";

const MI_NOMBRE = "Carlos";

type MenuInterface = "action-sheet" | "popover" | "alert";

const Home: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idioma, setIdioma] = useState<string>("es-ES");
  const [transcripcionEs, setTranscripcionEs] = useState<string>("");
  const [tipoMenu, setTipoMenu] = useState<MenuInterface>("action-sheet");

  // const [present] = useIonToast();

  // const saludar = () => {
  //   present({
  //     message: `¡Hola! Soy ${MI_NOMBRE} `,
  //     duration: 2000,
  //     position: "bottom",
  //     color: "tertiary",
  //   });
  // };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Traductor de Voz AI</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/reto-1" fill="clear" color="light">
              Reto Día 1
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding ion-text-center">
        {/* Selector de Idioma Hablado */}
        <IonCard>
          <IonItem lines="none">
            <IonSelect
              label="Idioma hablado"
              labelPlacement="stacked"
              interface={tipoMenu}
              value={idioma}
              onIonChange={(e) => setIdioma(e.detail.value)}
            >
              <IonSelectOption value="es-ES">Español (es-ES)</IonSelectOption>
              <IonSelectOption value="en-US">Inglés (en-US)</IonSelectOption>
              <IonSelectOption value="pt-BR">Portugués (pt-BR)</IonSelectOption>
              <IonSelectOption value="fr-FR">Francés (fr-FR)</IonSelectOption>
            </IonSelect>
          </IonItem>

          {/* Paso 3: cambiar la prop interface en vivo */}
          <IonCardContent className="interface-selector">
            <IonText color="medium">
              <p className="interface-label">
                interface=&quot;{tipoMenu}&quot;
              </p>
            </IonText>
            <IonSegment
              value={tipoMenu}
              onIonChange={(e) => setTipoMenu(e.detail.value as MenuInterface)}
            >
              <IonSegmentButton value="action-sheet">
                <IonLabel>action-sheet</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="popover">
                <IonLabel>popover</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="alert">
                <IonLabel>alert</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </IonCardContent>
        </IonCard>

        {/* Tarjeta Principal de Grabación */}
        <IonCard>
          <IonCardHeader>
            <IonBadge color={isRecording ? "danger" : "medium"}>
              {isRecording ? "Grabando audio..." : "Listo para escuchar"}
            </IonBadge>
            <IonCardTitle className="ion-margin-top">
              Habla en cualquier idioma
            </IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <p>Tu voz se transcribirá automáticamente al español.</p>

            <div style={{ margin: "30px 0" }}>
              <IonButton
                color={isRecording ? "danger" : "primary"}
                shape="round"
                size="large"
                fill="outline"
                expand="full"
                onClick={() => setIsRecording(!isRecording)}
              >
                <IonIcon
                  slot="icon-only"
                  icon={isRecording ? stopCircleOutline : micOutline}
                />
              </IonButton>
            </div>

            {loading && <IonSpinner name="crescent" color="primary" />}
          </IonCardContent>
        </IonCard>

        {/* Tarjeta de Resultado en Español */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={languageOutline} /> Transcripción (Español)
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="dark">
              <p style={{ fontSize: "1.1rem", minHeight: "80px" }}>
                {transcripcionEs ||
                  "Aquí aparecerá el texto traducido al español..."}
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>

        <IonCard className="tarjeta-personal">
          <IonCardHeader>
            <IonCardSubtitle>
              <IonIcon icon={personCircleOutline} /> Reto Día 1 · Tarjeta
              Personal
            </IonCardSubtitle>
            <IonCardTitle>{MI_NOMBRE}</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <p>Esta es mi tarjeta del reto relámpago del Día 1.</p>

            <IonButton expand="block" color="tertiary">
              {/* onClick={saludar} */}
              Saludar
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Home;
