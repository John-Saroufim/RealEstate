import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Role = "user" | "assistant";

type Msg = { id: string; role: Role; content: string };

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Supabase `functions.invoke` throws `FunctionsHttpError` before parsing JSON; real message is on `context` (Response). */
async function messageFromFunctionsError(fnError: Error): Promise<string> {
  const ctx = (fnError as Error & { context?: Response }).context;
  if (ctx && typeof ctx.json === "function") {
    try {
      const body = (await ctx.json()) as { error?: string };
      if (body?.error) return body.error;
    } catch {
      /* body not JSON or already read */
    }
  }
  return fnError.message || "Assistant request failed.";
}

export function CrestlineAiChatDock() {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: uid(),
      role: "assistant",
      content:
        "Hello—I’m your RealEstate assistant. Ask me about luxury buying and selling, markets, or how to get started.",
    },
  ]);

  const show = location.pathname.startsWith("/crestline");

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [open, messages, loading]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    const userMsg: Msg = { id: uid(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    try {
      const { data, error: fnError } = await supabase.functions.invoke<{ reply?: string; error?: string }>("chat", {
        body: { messages: history },
      });

      if (fnError) {
        throw new Error(await messageFromFunctionsError(fnError));
      }

      if (data && typeof data === "object" && "error" in data && data.error) {
        throw new Error(String(data.error));
      }

      const reply = data?.reply?.trim();
      if (!reply) {
        throw new Error("No reply from assistant. Is the chat function deployed?");
      }

      setMessages((prev) => [...prev, { id: uid(), role: "assistant", content: reply }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content:
            "I couldn’t reach the assistant just now. Please try again shortly. (Owners: deploy the Supabase `chat` function and set GROQ_API_KEY or OPENAI_API_KEY.)",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  if (!show) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close assistant"
              className="fixed inset-0 z-[55] bg-slate-900/50"
              initial={reducedMotion ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="AI assistant"
              className={cn(
                "fixed z-[60] flex flex-col overflow-hidden border border-slate-200 bg-crestline-bg shadow-2xl",
                "inset-x-0 bottom-0 max-h-[min(85vh,640px)] rounded-t-2xl md:inset-auto md:bottom-6 md:right-6 md:left-auto md:w-[min(100vw-2rem,420px)] md:max-h-[min(72vh,560px)] md:rounded-xl",
              )}
              initial={reducedMotion ? undefined : { opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 bg-crestline-surface/80">
                <div>
                  <p className="text-xs font-semibold tracking-[0.12em] uppercase text-crestline-gold">Assistant</p>
                  <p className="font-sans text-base font-bold text-slate-900">Ask anything</p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-slate-900 hover:bg-slate-100 rounded-xl"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[200px] max-h-[calc(85vh-200px)] md:max-h-[calc(72vh-200px)]"
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "max-w-[92%] text-sm leading-relaxed px-3 py-2.5 border",
                      m.role === "assistant"
                        ? "mr-auto bg-crestline-surface/60 border-crestline-gold/20 text-slate-800"
                        : "ml-auto bg-slate-50 border-slate-200 text-slate-900",
                    )}
                  >
                    {m.content}
                  </div>
                ))}
                {loading ? (
                  <div className="text-xs text-crestline-muted px-1">Thinking…</div>
                ) : null}
                {error ? <div className="text-xs text-red-300/90 px-1">{error}</div> : null}
              </div>

              <div className="border-t border-slate-200 p-3 bg-crestline-surface/50">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question…"
                  rows={2}
                  disabled={loading}
                  className="resize-none bg-crestline-bg border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm min-h-[72px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => void send()}
                    disabled={loading || !input.trim()}
                    className="bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-xl gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!open && (
          <motion.div
            initial={reducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[55] right-[calc(max(1rem,env(safe-area-inset-right))+4rem)] bottom-[calc(max(1rem,env(safe-area-inset-bottom))+0.5rem)] hidden sm:flex items-center"
            aria-hidden
          >
            <div className="relative rounded-xl border border-crestline-gold/30 bg-crestline-bg/95 px-3 py-2 text-xs font-medium text-slate-800 shadow-lg backdrop-blur">
              Ask me anything
              <span className="pointer-events-none absolute -right-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-r border-b border-crestline-gold/30 bg-crestline-bg/95" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label="Open AI assistant"
        aria-expanded={open}
        className={cn(
          "fixed z-[56] h-14 w-14 rounded-full border border-crestline-gold/40 bg-crestline-bg text-crestline-gold shadow-lg",
          "flex items-center justify-center hover:bg-crestline-surface transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          "bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))]",
        )}
        whileHover={reducedMotion ? undefined : { scale: 1.04 }}
        whileTap={reducedMotion ? undefined : { scale: 0.97 }}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </>
  );
}
