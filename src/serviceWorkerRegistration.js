import { registerSW } from 'virtual:pwa-register';

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    registerSW({
      onNeedRefresh() {
        // Aquí puedes mostrar una notificación al usuario de que hay una actualización disponible
        if (confirm('Nueva versión disponible. ¿Actualizar?')) {
          window.location.reload();
        }
      },
      onOfflineReady() {
        console.log('La aplicación está lista para uso offline');
      },
    });
  }
};
