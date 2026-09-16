import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Send, HelpCircle, AlertTriangle } from 'lucide-react';
import { sendAIChat, fetchAIHealth } from '../../services/api';
import { useApp } from '../../context/AppContext';

const SUGGESTIONS = [
  'Why is Vellore categorized under High Risk today?',
  'What happens if a 2-hour rain break occurs tonight?',
  'Which wards face immediate drainage bottleneck?',
  'Recommend municipal pump deployments for Katpadi underpass',
];

export default function AIAssistantView() {
  const { selectedLocation, riskData } = useApp();
  const [aiStatus, setAiStatus] = useState({ reachable: true, model: 'qwen3:8b' });
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello Dr. Vance. I am the DisasterLens AI Risk Synthesis Assistant powered by local Qwen3 8B. I am continuously grounded in live telemetry from ${selectedLocation?.station || 'Palar Basin Hydro Station'}. How can I assist your catastrophe operations today?`,
      time: '12:00 IST',
      confidence: 95.0,
      model: 'qwen3:8b',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchAIHealth().then((res) => {
      if (isMounted) {
        setAiStatus({
          reachable: res?.reachable !== false,
          model: res?.target_model || 'qwen3:8b',
          modelAvailable: res?.model_available,
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSend = async (queryText = inputQuery) => {
    const q = queryText.trim();
    if (!q || isLoading) return;

    const userMsg = {
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await sendAIChat({
        userQuery: q,
        location: selectedLocation?.name || 'Vellore District',
        disasterType: 'flood',
        rainfall: riskData?.telemetry?.rainfall?.value ?? 86.0,
        riverLevel: riskData?.telemetry?.riverLevel?.value ?? 3.4,
        soilSaturation: riskData?.telemetry?.soil?.saturation ?? 84.0,
        riskScore: riskData?.compositeScore ?? 72,
        riskLevel: riskData?.riskLevel ?? 'HIGH',
      });

      const isErr = Boolean(response?.error);
      const aiMsg = {
        sender: 'ai',
        text: response.response || 'No response received from local AI engine.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: response.confidence ?? (isErr ? 0 : 95.0),
        model: response.model || 'qwen3:8b',
        isError: isErr,
        contributingFactors: response.contributingFactors || [],
        recommendations: response.recommendations || [],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        sender: 'ai',
        text: 'Ollama is not running. Please start Ollama (`ollama serve`) and try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: 0,
        model: 'qwen3:8b',
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="type-section-title">
              DisasterLens AI Assistant
            </h2>
            <p className="font-mono text-[10px] text-on-surface-variant">
              Local Qwen3 8B (Ollama) & Grounded Telemetry for {selectedLocation?.name || 'Vellore'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {aiStatus.reachable ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>OLLAMA ACTIVE ({aiStatus.model})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-mono text-[10px] font-semibold border border-amber-200">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span>OLLAMA OFFLINE</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-primary-container text-white'
                  : msg.isError
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-secondary-container/20 text-secondary border border-secondary/30'
              }`}
            >
              {msg.sender === 'user' ? 'EV' : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`p-3.5 rounded-2xl font-sans text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-primary text-white rounded-tr-xs shadow-xs'
                  : msg.isError
                  ? 'bg-red-50/60 border border-red-200 text-red-900 rounded-tl-xs shadow-2xs'
                  : 'bg-surface-container-low border border-outline-variant/20 text-on-surface rounded-tl-xs shadow-2xs'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              <div
                className={`mt-2 flex items-center gap-2 font-mono text-[9px] ${
                  msg.sender === 'user' ? 'text-primary-light justify-end' : 'text-on-surface-variant'
                }`}
              >
                <span>{msg.time}</span>
                {msg.confidence > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-secondary font-semibold">Confidence {msg.confidence}%</span>
                  </>
                )}
                {msg.model && (
                  <>
                    <span>·</span>
                    <span>{msg.model}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-md">
            <div className="w-7 h-7 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface-variant flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse delay-100" />
              <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse delay-200" />
              <span>Synthesizing environmental causality via Qwen3 8B...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Prompts */}
      <div className="px-4 py-2 bg-surface-container-low/30 border-t border-outline-variant/20 overflow-x-auto flex gap-2 no-scrollbar">
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s)}
            type="button"
            className="px-2.5 py-1 rounded-full bg-white hover:bg-surface-container border border-outline-variant/30 font-sans text-[11px] text-on-surface whitespace-nowrap shadow-2xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <HelpCircle className="w-3 h-3 text-secondary" />
            <span>{s}</span>
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-outline-variant/20 bg-surface-container-lowest">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask DisasterLens AI about environmental risk, simulated rain breaks, or mitigations..."
            className="flex-1 bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/30 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary/50"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-primary-container hover:bg-primary disabled:opacity-50 text-white font-sans text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
}
