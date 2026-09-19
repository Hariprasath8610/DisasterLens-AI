import { DEFAULT_RISK_DATA, DISASTERS_LIST, HISTORICAL_EVENTS } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

async function fetchWithFallback(url, options = {}, fallbackData) {
  try {
    const controller = new AbortController();
    const timeoutMs = options.timeout || 5000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.info(`DisasterLens API fallback on ${url}: Using client state/mock.`);
    return typeof fallbackData === 'function' ? fallbackData() : fallbackData;
  }
}

export async function fetchHealth() {
  return fetchWithFallback('/health', {}, { status: 'healthy', version: '1.0.0', engine: 'HydroNet-v4' });
}

export async function fetchAIHealth() {
  return fetchWithFallback('/ai/health', { timeout: 4000 }, {
    reachable: false,
    model_available: false,
    target_model: 'qwen3:8b'
  });
}

export async function fetchWeather(lat, lon, location) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(
      `${API_BASE_URL}/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&location=${encodeURIComponent(location)}`,
      { signal: controller.signal }
    );
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.detail || `Weather request failed (${response.status}).`);
    return payload;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Weather request timed out.');
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchRisk(location, disasterType = 'flood', options = {}) {
  const { lat, lon, rainfall, riverLevel, soilSaturation, windSpeed, drainageBlocked } = options;
  const params = new URLSearchParams({
    location,
    disaster_type: disasterType,
  });

  if (lat !== undefined && lat !== null) params.append('lat', lat);
  if (lon !== undefined && lon !== null) params.append('lon', lon);
  if (rainfall !== undefined && rainfall !== null) params.append('rainfall', rainfall);
  if (riverLevel !== undefined && riverLevel !== null) params.append('river_level', riverLevel);
  if (soilSaturation !== undefined && soilSaturation !== null) params.append('soil_saturation', soilSaturation);
  if (windSpeed !== undefined && windSpeed !== null) params.append('wind_speed', windSpeed);
  if (drainageBlocked !== undefined && drainageBlocked !== null) params.append('drainage_blocked', drainageBlocked);

  return fetchWithFallback(
    `/risk?${params.toString()}`,
    {},
    DEFAULT_RISK_DATA
  );
}

export async function evaluateAlert(score, mode = 'LIVE', location = 'Vellore District', details = {}) {
  const endpoint = mode.toUpperCase() === 'LIVE' ? '/alerts/live' : '/alerts/simulation';
  return fetchWithFallback(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify({ score, mode, location, details }),
    },
    {
      triggered: score >= 80,
      risk_score: score,
      threshold: 80,
      sms_status: 'DEMO',
      recipient: '******8765',
      timestamp: new Date().toISOString(),
      alert: {
        alertType: mode === 'LIVE' ? 'LIVE RISK ALERT' : 'DEMO ALERT',
        mode,
        riskScore: score,
        threshold: 80,
        smsStatus: 'DEMO',
        smsRecipient: '******8765',
        timestamp: new Date().toISOString(),
      },
    }
  );
}

export async function evaluateLiveAlert(score, location = 'Vellore District', details = {}) {
  return evaluateAlert(score, 'LIVE', location, details);
}

export async function evaluateSimulationAlert(score, location = 'Vellore District', details = {}) {
  return evaluateAlert(score, 'SIMULATION', location, details);
}

export async function createWhatsAppAlert({ phone_number = '917373733474', risk_level = 'HIGH', location = 'Karur' } = {}) {
  const response = await fetch(`${API_BASE_URL}/alerts/whatsapp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone_number,
      risk_level,
      location,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Server responded with status ${response.status}`);
  }

  return await response.json();
}

export async function sendTestSMS(message) {
  return fetchWithFallback(
    '/alerts/test-sms',
    {
      method: 'POST',
      body: JSON.stringify({ message }),
    },
    {
      success: true,
      status: 'DEMO',
      message_sid: 'SM_MOCK_FALLBACK',
      recipient: '******3474',
      provider: 'twilio',
      timestamp: new Date().toISOString(),
    }
  );
}

export async function fetchAlertConfig() {
  return fetchWithFallback(
    '/alerts/config',
    {},
    { alertMode: 'demo', alertThreshold: 80, maskedRecipient: '******8765', cooldownMinutes: 60 }
  );
}

export async function fetchAlertHistory() {
  return fetchWithFallback('/alerts/history', {}, []);
}

export async function fetchDisasters() {
  return fetchWithFallback('/disasters', {}, DISASTERS_LIST);
}

export async function fetchHistory(location) {
  return fetchWithFallback(`/history?location=${encodeURIComponent(location)}`, {}, HISTORICAL_EVENTS);
}

export async function runSimulation(params) {
  // Client-side fallback calculation matching the physics formula
  const computeFallback = () => {
    const { rain = 120, river = 4.2, wind = 42, duration = 8, soil = 95, drainageBlocked = true } = params;
    const baseScore = 52;
    const rainFactor = (rain - 86) * 0.22;
    const riverFactor = (river - 3.4) * 18;
    const windFactor = (wind - 18) * 0.12;
    const soilFactor = (soil - 70) * 0.25;
    const drainagePenalty = drainageBlocked ? 7 : 0;
    const computedScore = Math.min(98, Math.max(28, Math.round(baseScore + rainFactor + riverFactor + windFactor + soilFactor + drainagePenalty)));
    const estCitizens = Math.round(computedScore * 492);
    return {
      success: true,
      simulationScore: computedScore,
      delta: computedScore - baseScore,
      affectedCitizens: estCitizens,
      submergedRoadsKm: (computedScore * 0.25).toFixed(1),
      floodedWards: computedScore >= 75 ? 4 : computedScore >= 60 ? 2 : 1,
      peakSurgeHours: (duration * 0.3).toFixed(1),
      aiProjection: `Increasing rainfall to ${rain}mm with a ${river.toFixed(1)}m river surcharge breaches secondary flood walls along the northern canal. Over ${estCitizens.toLocaleString()} residents in Katpadi and Shenbakkam will enter the direct inundation corridor within ${(duration * 0.3).toFixed(1)} hours of peak rainfall.`,
      recommendedMitigation: `Trigger automated sluice gates 04 and 07 at Palar Anicut to mitigate hydraulic backlog by ${(river * 0.14).toFixed(2)} meters.`,
    };
  };

  return fetchWithFallback(
    '/simulation',
    {
      method: 'POST',
      body: JSON.stringify(params),
    },
    computeFallback
  );
}

export async function sendAIChat(payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s for local LLM generation

  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      let detailMsg = `AI service error (HTTP ${response.status})`;
      try {
        const errData = await response.json();
        detailMsg = errData.detail || detailMsg;
      } catch (_) {}
      return {
        response: detailMsg,
        confidence: 0,
        model: 'qwen3:8b',
        error: true,
      };
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = err.name === 'AbortError';
    return {
      response: isTimeout
        ? 'AI request timed out while generating response. The local Qwen3 8B model is under heavy load; please retry with a more specific query.'
        : 'Ollama or backend service is unreachable. Please verify that FastAPI is running on port 8000 and Ollama is active with model qwen3:8b.',
      confidence: 0,
      model: 'qwen3:8b',
      error: true,
    };
  }
}

