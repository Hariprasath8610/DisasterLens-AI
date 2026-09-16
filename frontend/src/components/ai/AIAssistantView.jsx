import React, { useState } from 'react';
import { Bot, Sparkles, Send, User, HelpCircle, CheckCircle2 } from 'lucide-react';
import { sendAIChat } from '../../services/api';
import { useApp } from '../../context/AppContext';

const SUGGESTIONS = [
  'Why is Vellore categorized under High Risk today?',
  'What happens if a 2-hour rain break occurs tonight?',
  'Which wards face immediate drainage bottleneck?',
  'Recommend municipal pump deployments for Katpadi underpass',
];

export default function AIAssistantView() {
  const { selectedLocation, riskData } = useApp();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello Dr. Vance. I am the DisasterLens AI Risk Synthesis Assistant. I am continuously grounded in live telemetry from ${selectedLocation.station}. How can I assist your catastrophe operations today?`,
      time: '12:00 IST',
      confidence: 94.2,
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        location: selectedLocation.name,
        disasterType: 'flood',
        rainfall: riskData.telemetry.rainfall.value,
        riverLevel: riskData.telemetry.riverLevel.value,
        soilSaturation: riskData.telemetry.soil.saturation,
        riskScore: riskData.compositeScore,
      });

      const aiMsg = {
        sender: 'ai',
        text: response.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: response.confidence || 94.2,
        model: response.model || 'DisasterLens-XAI-v4.2',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
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
              Grounded in HydroNet-v4 & Live Telemetry for {selectedLocation.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-secondary font-mono text-[10px] font-semibold border border-outline-variant/20">
          <Sparkles className="w-3 h-3 text-secondary" />
          <span>LLM INTERFACE ACTIVE</span>
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
                  : 'bg-secondary-container/20 text-secondary border border-secondary/30'
              }`}
            >
              {msg.sender === 'user' ? 'EV' : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`p-3.5 rounded-2xl font-sans text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-primary text-white rounded-tr-xs shadow-xs'
                  : 'bg-surface-container-low border border-outline-variant/20 text-on-surface rounded-tl-xs shadow-2xs'
              }`}
            >
              <p>{msg.text}</p>

              <div
                className={`mt-2 flex items-center gap-2 font-mono text-[9px] ${
                  msg.sender === 'user' ? 'text-primary-light justify-end' : 'text-on-surface-variant'
                }`}
              >
                <span>{msg.time}</span>
                {msg.confidence && (
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
              <span>Synthesizing environmental causality...</span>
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
