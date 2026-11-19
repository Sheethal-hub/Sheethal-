import { useRef, useState, useEffect, type FormEvent } from 'react';
import { ArrowUp, MessageSquare, RotateCcw } from 'lucide-react';
import type { AirQualityPayload, ChatMessage, UserProfile } from '../types/airQuality';
import { buildSmartAqiReply } from '../utils/assistantFallback';
import { USER_PROFILES } from '../utils/recommendations';

interface AiAssistantProps {
  data: AirQualityPayload;
  profile: UserProfile;
}

const SUGGESTED_PROMPTS = [
  'Is it safe to run at 6 PM?',
  'How accurate is this data?',
  'How do I reduce indoor dust today?',
  'When should I open my windows today?',
];

export function AiAssistant({ data, profile }: AiAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const profileLabel =
    USER_PROFILES.find((p) => p.id === profile)?.label ?? 'General Public';

  // Reset conversation neatly when city changes so stale answers don't confuse users
  useEffect(() => {
    setMessages([]);
  }, [data.city, data.neighborhood]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  async function askQuestion(questionText: string) {
    const trimmed = questionText.trim();
    if (!trimmed || isSending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setIsSending(true);

    let answerText: string | null = null;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 4500);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question: trimmed,
          history: messages,
          airQuality: data,
          profile,
        }),
      });

      if (res.ok) {
        const rawText = await res.text();
        try {
          const payload = JSON.parse(rawText) as { answer?: string };
          if (payload.answer && payload.answer.trim()) {
            answerText = payload.answer.trim();
          }
        } catch {
          // Fall through cleanly to built-in rules
        }
      }
    } catch {
      // Network, timeout, or static hosting fallback handled seamlessly below
    } finally {
      window.clearTimeout(timeoutId);
    }

    if (!answerText) {
      answerText = buildSmartAqiReply(trimmed, data, profile);
    }

    const aiMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: answerText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsSending(false);
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void askQuestion(input);
  };

  return (
    <section
      id="assistant"
      aria-label="Ask AeroSense AI Pollution Assistant"
      className="glass-panel rounded-2xl p-6 sm:p-8"
    >
      <div className="flex flex-col gap-3 border-b border-slate-900/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <MessageSquare className="h-5 w-5 text-slate-800" aria-hidden="true" />
            <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl font-display">
              Ask AeroSense
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">
            Grounded in {data.city} ({data.neighborhood}) · AQI{' '}
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {data.aqi}
            </span>{' '}
            · Profile: <span className="font-semibold text-slate-900">{profileLabel}</span>
          </p>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => setMessages([])}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 min-h-[36px] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={isSending}
            onClick={() => void askQuestion(prompt)}
            className="rounded-lg border border-slate-900/10 bg-white/75 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-white hover:text-slate-950 hover:border-slate-900/20 transition-all cursor-pointer disabled:opacity-50 min-h-[36px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Conversation Thread */}
      <div
        ref={listRef}
        className="mt-5 max-h-80 min-h-[140px] space-y-4 overflow-y-auto rounded-xl border border-slate-900/8 bg-white/55 p-4"
      >
        {messages.length === 0 && !isSending ? (
          <div className="flex h-full min-h-[104px] flex-col items-center justify-center text-center px-4">
            <p className="text-sm font-medium text-slate-700">
              Ask anything in plain words — outdoor exercise, home dust, masks, or how these numbers work for{' '}
              <span className="font-semibold text-slate-950">{data.neighborhood}</span>.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Tap a quick question above or type your own below.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="mb-1 flex items-center gap-2 text-[11px] font-medium text-slate-500">
                <span>{msg.role === 'user' ? 'You' : 'AeroSense'}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{msg.timestamp}</span>
              </div>
              <div
                className={`max-w-2xl rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-900/8 bg-white text-slate-800 shadow-2xs'
                }`}
              >
                {msg.role === 'assistant'
                  ? msg.content.split(/(\*\*[^*]+\*\*)/g).map((part, idx) =>
                      part.startsWith('**') && part.endsWith('**') ? (
                        <strong key={idx} className="font-semibold text-slate-950">
                          {part.slice(2, -2)}
                        </strong>
                      ) : (
                        <span key={idx}>{part}</span>
                      )
                    )
                  : msg.content}
              </div>
            </div>
          ))
        )}

        {isSending && (
          <div className="flex flex-col items-start">
            <div className="mb-1 text-[11px] font-medium text-slate-500">
              AeroSense · Analyzing {data.neighborhood} telemetry
            </div>
            <div className="w-full max-w-md space-y-2 rounded-xl border border-slate-900/8 bg-white p-4">
              <div className="h-3 w-5/6 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-slate-200 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Ask Form */}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about air quality in ${data.neighborhood} (e.g. "Is it safe to run at 6 PM?")`}
          aria-label="Ask AeroSense a question"
          disabled={isSending}
          className="flex-1 rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 min-h-[44px]"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          aria-label="Send question"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 min-h-[44px] cursor-pointer disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
        >
          <span>Ask</span>
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
