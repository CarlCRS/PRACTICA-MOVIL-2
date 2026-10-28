import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {
  archiveOutline,
  cloudOutline,
  flashOutline,
  layersOutline,
  lockClosedOutline,
  micOutline,
} from 'ionicons/icons';
import './Home.css';

interface Reto {
  dia: string;
  titulo: string;
  descripcion: string;
  pasos: string;
  icono: string;
  ruta?: string;
}

const RETOS: Reto[] = [
  {
    dia: 'DÍA 1',
    titulo: 'Componentes base',
    descripcion:
      'Tarjeta personal con IonCard, botón Saludar y las 3 interfaces nativas del IonSelect.',
    pasos: '3 pasos',
    icono: layersOutline,
    ruta: '/reto-1',
  },
  {
    dia: 'DÍA 2',
    titulo: 'Micrófono real',
    descripcion:
      'Hook useVoiceRecorder con Capacitor Bridge, captura de audio en Base64 y reproducción con <audio controls>.',
    pasos: '3 chequeos',
    icono: micOutline,
    ruta: '/reto-2',
  },
  {
    dia: 'DÍA 3',
    titulo: 'Transcripción de voz',
    descripcion:
      'Nube con ElevenLabs Scribe v2 vs. reconocimiento en vivo con el motor nativo (Capgo) y fallback Web Speech.',
    pasos: '2 casos',
    icono: cloudOutline,
    ruta: '/reto-3',
  },
  {
    dia: 'DÍA 4',
    titulo: 'UX nativa y persistencia',
    descripcion:
      'Toast y Loading en lugar de diálogos bloqueantes, historial con @capacitor/preferences y laboratorio frente a localStorage.',
    pasos: '3 chequeos',
    icono: archiveOutline,
    ruta: '/reto-4',
  },
];

const Home: React.FC = () => {
  return (
    <IonPage className="hub-page">
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Capacitación Ionic · Retos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="hub-wrap">
          <span className="hub-kicker">
            <IonIcon icon={flashOutline} /> RETOS RELÁMPAGO
          </span>
          <h1 className="hub-title">Elige el reto del día</h1>
          <p className="hub-sub">
            Cada tarjeta abre la página con el enunciado y la solución en vivo.
          </p>

          <div className="hub-grid">
            {RETOS.map((reto) => {
              const disponible = !!reto.ruta;
              const Card = disponible ? IonCard : IonCard;
              return (
                <Card
                  key={reto.dia}
                  className={`hub-card ${disponible ? '' : 'bloqueada'}`}
                  button={disponible}
                  {...(disponible ? { routerLink: reto.ruta } : {})}
                >
                  <div className="hub-card-top">
                    <span className="hub-dia">{reto.dia}</span>
                    <IonIcon
                      icon={disponible ? reto.icono : lockClosedOutline}
                      className="hub-icono"
                    />
                  </div>
                  <IonCardHeader>
                    <IonCardSubtitle>{reto.pasos}</IonCardSubtitle>
                    <IonCardTitle>{reto.titulo}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p>{reto.descripcion}</p>
                    <div className="hub-card-footer">
                      <span>
                        {disponible ? 'Abrir reto' : 'Disponible pronto'}{' '}
                        {disponible ? '→' : ''}
                      </span>
                    </div>
                  </IonCardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
