/**
 * Servicio para limitar y monitorear llamadas a la API
 */

const MAX_CALLS_PER_SESSION = 50;
let callsInSession = 0;
let lastCallTimestamp = null;
const MIN_TIME_BETWEEN_CALLS = 1000; // 1 segundo mínimo entre llamadas

export const apiLimiter = {
  canMakeCall: () => {
    // Verificar límite de sesión
    if (callsInSession >= MAX_CALLS_PER_SESSION) {
      console.error('🚫 Límite de llamadas a la API alcanzado:', {
        calls: callsInSession,
        max: MAX_CALLS_PER_SESSION,
        timestamp: new Date().toISOString()
      });
      return false;
    }

    // Verificar tiempo entre llamadas
    if (lastCallTimestamp) {
      const timeSinceLastCall = Date.now() - lastCallTimestamp;
      if (timeSinceLastCall < MIN_TIME_BETWEEN_CALLS) {
        console.warn('⚠️ Demasiadas llamadas en poco tiempo:', {
          timeSinceLastCall,
          minRequired: MIN_TIME_BETWEEN_CALLS
        });
        return false;
      }
    }

    return true;
  },

  logCall: (location) => {
    callsInSession++;
    lastCallTimestamp = Date.now();

    console.log(`🔍 Llamada a la API #${callsInSession}/${MAX_CALLS_PER_SESSION}`, {
      timestamp: new Date().toISOString(),
      location,
      remainingCalls: MAX_CALLS_PER_SESSION - callsInSession
    });
  },

  reset: () => {
    callsInSession = 0;
    lastCallTimestamp = null;
    console.log('🔄 Contador de llamadas a la API reiniciado');
  },

  getRemainingCalls: () => MAX_CALLS_PER_SESSION - callsInSession
};
