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
  return fetchWithFallback(
    `/weather?lat=${lat}&lon=${lon}&location=${encodeURIComponent(location)}`,
    {},
    DEFAULT_RISK_DATA.telemetry
  );
}

export async function fetchRisk(location, disasterType = 'flood') {
  return fetchWithFallback(
    `/risk?location=${encodeURIComponent(location)}&disaster_type=${disasterType}`,
    {},
    DEFAULT_RISK_DATA
  );
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

