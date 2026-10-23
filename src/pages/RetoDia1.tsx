import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { arrowBack, flash } from "ionicons/icons";
import "./RetoDia1.css";

const RetoDia1: React.FC = () => {
  return (
    <IonPage className="reto-page">
      <IonHeader className="reto-header">
        <IonToolbar>
          <IonButton slot="start" routerLink="/home" fill="clear" color="light">
            <IonIcon icon={arrowBack} slot="start" />
            Home
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

          {/* CTA a la solución */}
          <div className="reto-cta">
            <IonButton routerLink="/home" color="success" expand="block">
              Ver la solución en Home.tsx
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RetoDia1;
