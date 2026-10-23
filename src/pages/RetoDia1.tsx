import { useState } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import { arrowBack, flash } from "ionicons/icons";
import "./RetoDia1.css";

/** ✏️ Cambia este valor por tu nombre (Paso 1 del Reto) */
const MI_NOMBRE = "Tu Nombre";

/** Paso 3: las 3 interfaces nativas del IonSelect */
type MenuInterface = "action-sheet" | "popover" | "alert";

/**
 * Página del "Reto Relámpago del Día 1".
 * Presentación del enunciado + solución en vivo de los 3 pasos.
 */
const RetoDia1: React.FC = () => {
  const [present] = useIonToast();

  // Paso 3: interface activa del IonSelect
  const [tipoMenu, setTipoMenu] = useState<MenuInterface>("action-sheet");
  const [idioma, setIdioma] = useState<string>("es");

  // Paso 2: acción del botón Saludar
  const saludar = () => {
    present({
      message: `¡Hola! Soy ${MI_NOMBRE} 👋`,
      duration: 2000,
      position: "bottom",
      color: "tertiary",
    });
  };

  return (
    <IonPage className="reto-page">
      <IonHeader className="reto-header">
        <IonToolbar>
          <IonButton slot="start" routerLink="/home" fill="clear" color="light">
            <IonIcon icon={arrowBack} slot="start" />
            Retos
          </IonButton>
          <IonTitle>Reto Relámpago · Día 1</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="reto-wrap">
          {/* Título */}
          <h1 className="reto-title">
            <IonIcon icon={flash} className="reto-title-icon" />
            Reto Relámpago del Día 1
          </h1>

          <p className="reto-subtitle">
            A perderle el miedo a los componentes: el primero en completarlo en
            su navegador comparte pantalla:
          </p>

          {/* Tarjetas de pasos */}
          <div className="reto-grid">
            <article className="reto-card amarillo">
              <h3>Paso 1: Tu Tarjeta Personal</h3>
              <p>
                Agrega un nuevo &lt;IonCard&gt; al final de Home.tsx que muestre
                tu nombre en el &lt;IonCardTitle&gt;.
              </p>
            </article>

            <article className="reto-card morado">
              <h3>Paso 2: Botón Saludar</h3>
              <p>
                Adentro coloca un{" "}
                <code>
                  &lt;IonButton expand=&quot;block&quot;
                  color=&quot;tertiary&quot;&gt;Saludar&lt;/IonButton&gt;
                </code>
                .
              </p>
            </article>

            <article className="reto-card verde">
              <h3>Paso 3: Probar Interfaces</h3>
              <p>
                Cambia la prop <code>interface</code> del{" "}
                <code>&lt;IonSelect&gt;</code> entre{" "}
                <code>&quot;action-sheet&quot;</code>,{" "}
                <code>&quot;popover&quot;</code> y{" "}
                <code>&quot;alert&quot;</code> para ver los 3 menús nativos.
              </p>
            </article>
          </div>

          <div className="reto-banner">
            <span className="reto-banner-flecha">→</span>
            <p>
              <strong>Mañana en el Día 2:</strong> Conectaremos este botón con
              el micrófono real del dispositivo usando el Bridge de{" "}
              <strong className="azul">Capacitor</strong> y{" "}
              <code>capacitor-voice-recorder</code>.
            </p>
          </div>

          {/* ============ SOLUCIÓN EN VIVO ============ */}
          <section className="reto-solucion">
            <span className="solucion-kicker">SOLUCIÓN EN VIVO</span>
            <h2 className="solucion-titulo">Tu tarjeta personal</h2>

            <IonCard className="solucion-card">
              <IonCardHeader>
                <IonCardSubtitle>Paso 1 · IonCardTitle</IonCardSubtitle>
                <IonCardTitle>{MI_NOMBRE}</IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                {/* Paso 2 */}
                <IonButton
                  expand="block"
                  color="tertiary"
                  onClick={saludar}
                >
                  Saludar
                </IonButton>

                {/* Paso 3 */}
                <IonItem lines="full">
                  <IonLabel>Idioma</IonLabel>
                  <IonSelect
                    interface={tipoMenu}
                    value={idioma}
                    placeholder="Selecciona un idioma"
                    onIonChange={(e) => setIdioma(e.detail.value)}
                  >
                    <IonSelectOption value="es">Español</IonSelectOption>
                    <IonSelectOption value="en">Inglés</IonSelectOption>
                    <IonSelectOption value="fr">Francés</IonSelectOption>
                    <IonSelectOption value="pt">Portugués</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <p className="solucion-label">
                  interface=&quot;{tipoMenu}&quot;
                </p>
                <IonSegment
                  value={tipoMenu}
                  onIonChange={(e) =>
                    setTipoMenu(e.detail.value as MenuInterface)
                  }
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
          </section>

          <div className="reto-cta">
            <IonButton routerLink="/home" fill="outline" color="light">
              Volver a los retos
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RetoDia1;
