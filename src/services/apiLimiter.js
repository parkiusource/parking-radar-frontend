/**
 * Servicio para limitar y monitorear llamadas a la API
 */

const RATE_LIMIT_KEY = 'parking_api_rate_limit';
const MAX_CALLS_PER_WINDOW = 50; // Máximo de llamadas en la ventana de tiempo
const TIME_WINDOW_MS = 60 * 1000; // Ventana de 1 minuto
const PERSISTENT_WINDOW_MS = 24 * 60 * 60 * 1000; // Ventana de 24 horas para límites persistentes
const MAX_DAILY_CALLS = 300; // Máximo de llamadas por día

class ApiRateLimiter {
  constructor() {
    this.loadState();
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  loadState() {
    try {
      const stored = localStorage.getItem(RATE_LIMIT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.calls = new Map(parsed.calls);
        this.dailyCalls = parsed.dailyCalls || 0;
        this.dailyReset = parsed.dailyReset || Date.now();
      } else {
        this.reset();
      }
    } catch (error) {
      console.error('Error loading rate limit state:', error);
      this.reset();
    }
  }

  reset() {
    this.calls = new Map();
    this.dailyCalls = 0;
    this.dailyReset = Date.now();
    this.saveState();
  }

  saveState() {
    try {
      const state = {
        calls: Array.from(this.calls.entries()),
        dailyCalls: this.dailyCalls,
        dailyReset: this.dailyReset
      };
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving rate limit state:', error);
    }
  }

  cleanup() {
    const now = Date.now();

    // Limpiar llamadas antiguas
    for (const [key, timestamp] of this.calls.entries()) {
      if (now - timestamp > TIME_WINDOW_MS) {
        this.calls.delete(key);
      }
    }

    // Resetear contador diario si es necesario
    if (now - this.dailyReset > PERSISTENT_WINDOW_MS) {
      this.dailyCalls = 0;
      this.dailyReset = now;
    }

    this.saveState();
  }

  generateCallId(location) {
    // Crear un ID único para la llamada basado en ubicación y tiempo
    const normalized = {
      lat: Math.round(location.lat * 10000) / 10000,
      lng: Math.round(location.lng * 10000) / 10000
    };
    return `${normalized.lat},${normalized.lng},${Date.now()}`;
  }

  canMakeCall() {
    this.cleanup();

    // Verificar límite por ventana de tiempo
    const recentCalls = Array.from(this.calls.values())
      .filter(timestamp => Date.now() - timestamp < TIME_WINDOW_MS)
      .length;

    // Verificar límite diario
    const withinLimits = recentCalls < MAX_CALLS_PER_WINDOW &&
                        this.dailyCalls < MAX_DAILY_CALLS;

    if (!withinLimits) {
      console.warn('🚫 Rate limit excedido:', {
        recentCalls,
        dailyCalls: this.dailyCalls,
        maxPerWindow: MAX_CALLS_PER_WINDOW,
        maxDaily: MAX_DAILY_CALLS
      });
    }

    return withinLimits;
  }

  logCall(location) {
    const callId = this.generateCallId(location);
    this.calls.set(callId, Date.now());
    this.dailyCalls++;
    this.saveState();

    // Log para monitoreo
    console.debug('📊 API Call logged:', {
      recentCalls: this.calls.size,
      dailyCalls: this.dailyCalls,
      remainingDaily: MAX_DAILY_CALLS - this.dailyCalls
    });
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

export const apiLimiter = new ApiRateLimiter();
