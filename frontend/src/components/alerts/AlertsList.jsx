import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Radio, Send, ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sendTestSMS } from '../../services/api';

export default function AlertsList() {
  const { notifications, addNotification, selectedLocation } = useApp();
  const [testSmsState, setTestSmsState] = useState({ loading: false, result: null });
  const [whatsAppLoading, setWhatsAppLoading] = useState(false);
  const [whatsAppError, setWhatsAppError] = useState(null);

  const handleSendWhatsAppAlert = async (targetLocation = null, riskLevel = 'HIGH') => {
    setWhatsAppLoading(true);
    setWhatsAppError(null);
    try {
      const payload = {
        phone_number: '917373733474',
        risk_level: riskLevel,
        location: targetLocation || selectedLocation?.name || 'Karur',
      };

      const response = await fetch('http://127.0.0.1:8000/api/alerts/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data?.whatsapp_url) {
        window.open(data.whatsapp_url, '_blank');
      } else {
        throw new Error('WhatsApp URL not returned from backend.');
      }
    } catch (err) {
      setWhatsAppError(err.message || 'Failed to generate WhatsApp emergency alert link.');
    } finally {
      setWhatsAppLoading(false);
    }
  };

  const handleBroadcast = (alertItem) => {
    handleSendWhatsAppAlert(alertItem.location, alertItem.level === 'danger' ? 'CRITICAL' : 'HIGH');
  };

  const handleTestAlert = () => {
    addNotification({
      title: 'LIVE RISK ALERT',
      location: `${selectedLocation.name} (Live Score: 85)`,
      level: 'danger',
      mode: 'LIVE',
      riskScore: 85,
      threshold: 80,
      smsStatus: 'SENT',
      message: 'LIVE RISK ALERT: The current live risk estimate has crossed the configured alert threshold.',
    });
  };

  const handleSendTestSMS = async () => {
    setTestSmsState({ loading: true, result: null });
    try {
      const res = await sendTestSMS("DisasterLens AI test SMS — authorized hackathon demonstration.");
      setTestSmsState({ loading: false, result: res });
      addNotification({
        title: 'Twilio SMS Test — Demo',
        location: `${selectedLocation.name}`,
        riskScore: 0,
        threshold: 80,
        smsStatus: res.status || (res.success ? 'SENT' : 'FAILED'),
        recipient: res.recipient || '******3474',
        timestamp: res.timestamp || new Date().toISOString(),
        time: 'Just now',
        level: res.success ? 'info' : 'danger',
        mode: 'DEMO',
        message: res.success
          ? `Twilio test SMS processed. Status: ${res.status}${res.message_sid ? ` (SID: ${res.message_sid})` : ''}`
          : `Twilio test SMS failed: ${res.error || 'Provider rejected request'}.`,
        disclaimer: 'Twilio test message for hackathon demonstration.',
      });
    } catch (err) {
      setTestSmsState({
        loading: false,
        result: { success: false, status: 'FAILED', error: err.message || 'Network error' },
      });
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-error" />
          <h2 className="font-display font-bold text-base text-on-surface">
            Active Hazard Early Warning Broadcasts
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Send WhatsApp Alert Button */}
          <button
            onClick={() => handleSendWhatsAppAlert()}
            disabled={whatsAppLoading}
            type="button"
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
            title="Open WhatsApp Click-to-Chat Emergency Alert (to 7373733474)"
          >
            {whatsAppLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{whatsAppLoading ? 'Generating Link...' : 'Send WhatsApp Alert'}</span>
          </button>

          {/* Test SMS Demo Trigger */}
          <button
            onClick={handleSendTestSMS}
            disabled={testSmsState.loading}
            type="button"
            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant font-mono text-[10px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Send Test SMS to authorized demo recipient"
          >
            {testSmsState.loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" /> : <Send className="w-3.5 h-3.5 text-primary" />}
            <span>{testSmsState.loading ? 'Sending...' : 'Send Test SMS'}</span>
          </button>

          <button
            onClick={handleTestAlert}
            type="button"
            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 font-mono text-[10px] text-on-surface font-semibold transition-colors"
          >
            Trigger Test Alert (≥80)
          </button>
          <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-mono text-[10px] font-bold">
            {notifications.length} Active Warnings
          </span>
        </div>
      </div>

      {/* WhatsApp Error Banner */}
      {whatsAppError && (
        <div className="p-3 rounded-lg border bg-red-50 dark:bg-red-950/30 border-red-300 text-red-800 dark:text-red-200 text-xs font-mono flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span><strong>WhatsApp Error:</strong> {whatsAppError}</span>
          </div>
          <button type="button" onClick={() => setWhatsAppError(null)} className="text-[10px] underline">Dismiss</button>
        </div>
      )}

      {/* Test SMS Feedback Banner if recently clicked */}
      {testSmsState.result && (
        <div className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between gap-2 ${
          testSmsState.result.success
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-800 dark:text-emerald-200'
            : 'bg-red-50 dark:bg-red-950/30 border-red-300 text-red-800 dark:text-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {testSmsState.result.success ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
            <span>
              <strong>Twilio Test SMS:</strong> Status: {testSmsState.result.status} {testSmsState.result.message_sid ? `(SID: ${testSmsState.result.message_sid})` : ''} | Recipient: {testSmsState.result.recipient || 'Authorized Recipient'}
              {testSmsState.result.error && ` | Error: ${testSmsState.result.error}`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setTestSmsState({ loading: false, result: null })}
            className="text-[10px] underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Safety Disclaimer Banner */}
      <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20 font-sans text-xs text-on-surface-variant flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary animate-pulse shrink-0" />
          <span>
            <strong>AI-assisted risk estimate.</strong> Not an official emergency warning. SMS dispatch limited to demo recipient (masked: <code className="font-mono text-[11px] font-bold text-primary">******8765</code>).
          </span>
        </div>
        <span className="shrink-0 font-mono text-[10px] uppercase font-bold text-secondary">
          Threshold: 80 PTS
        </span>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => {
          const smsStatus = notif.smsStatus || 'Demo';
          const mode = notif.mode || (notif.level === 'danger' ? 'LIVE' : 'SIMULATION');
          const recipient = notif.recipient || '******8765';
          const score = notif.riskScore != null ? notif.riskScore : (notif.level === 'danger' ? 85 : 82);
          const threshold = notif.threshold || 80;
          const timestamp = notif.timestamp || new Date().toISOString();

          return (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                notif.level === 'danger'
                  ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                  : notif.level === 'warning'
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                  : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    notif.level === 'danger'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                      : notif.level === 'warning'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  }`}
                >
                  {notif.level === 'danger' ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">{notif.title}</h3>
                    
                    {/* Alert Type: LIVE / SIMULATION */}
                    <span className={`font-mono text-[9px] uppercase px-2 py-0.5 rounded font-bold border ${
                      mode === 'LIVE' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 border-red-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300'
                    }`}>
                      Alert Type: {mode}
                    </span>

                    {/* SMS Status: Sent / Failed / Demo */}
                    <span className={`font-mono text-[9px] uppercase px-2 py-0.5 rounded font-bold ${
                      smsStatus === 'Sent'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : smsStatus === 'Failed'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300'
                    }`}>
                      SMS Status: {smsStatus}
                    </span>
                  </div>

                  <p className="font-sans text-xs text-slate-600 dark:text-slate-300">
                    {notif.location} · {notif.message || 'AI-assisted risk estimate has crossed the configured threshold.'}
                  </p>

                  {/* Telemetry Strip: Recipient, Score, Threshold, Timestamp */}
                  <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                    <span>Recipient: <strong className="text-primary font-bold">{recipient}</strong></span>
                    <span>·</span>
                    <span>Risk Score: <strong className="text-error font-bold">{score}/100</strong></span>
                    <span>·</span>
                    <span>Threshold: <strong>{threshold}</strong></span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{timestamp.substring(0, 19).replace('T', ' ')} UTC</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleBroadcast(notif)}
                  disabled={whatsAppLoading}
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  title="Generate and open WhatsApp emergency alert link"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send WhatsApp Alert</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
