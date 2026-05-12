"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { motion } from "framer-motion";

import { toast } from "sonner";

import ReactMarkdown from "react-markdown";

import { useQuery } from "@tanstack/react-query";

import {
  Send,
  Bot,
  User,
  Trash2,
  Sparkles,
  Brain,
  ArrowUpRight,
} from "lucide-react";

import {
  apiChat,
  apiChatHistory,
} from "@/lib/api";

import type { ChatMessage } from "@/types";

import {
  cn,
  getInitials,
} from "@/lib/utils";

import { useStore } from "@/store";

const STARTERS = [
  "What DSA topics should I focus on for Amazon?",
  "How do I improve my resume ATS score?",
  "Compare TCS vs Infosys for freshers",
  "Give me a 30-day DSA plan",
];

export default function ChatPage() {
  const { user } = useStore();

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const bottomRef =
    useRef<HTMLDivElement>(null);

  const { data: history } =
    useQuery({
      queryKey: [
        "chat-history",
      ],
      queryFn: apiChatHistory,
    });

  useEffect(() => {
    if (
      history?.length &&
      messages.length === 0
    ) {
      setMessages(history);
    }
  }, [history]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [messages]);

  async function send(
    text?: string
  ) {
    const msg = (
      text ?? input
    ).trim();

    if (!msg) return;

    const userMsg: ChatMessage =
      {
        role: "user",
        content: msg,
      };

    setMessages((m) => [
      ...m,
      userMsg,
    ]);

    setInput("");

    setLoading(true);

    try {
      const res =
        await apiChat(
          msg,
          messages
        );

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            res.content,
        },
      ]);
    } catch {
      toast.error(
        "Chat failed — backend may not be connected."
      );
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setMessages([]);
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[32px] border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
        <div className="absolute right-0 top-0 size-72 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="absolute bottom-0 left-0 size-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
              <Sparkles size={15} />
              AI Placement Assistant
            </div>

            <h1 className="text-4xl font-black text-white lg:text-5xl">
              PrepTrack AI Chat
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-slate-400">
              Ask about DSA,
              resumes, companies,
              interview prep,
              placements, and career
              guidance powered by
              Gemini AI.
            </p>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clear}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/20"
            >
              <Trash2 size={16} />
              Clear Chat
            </button>
          )}
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length ===
          0 ? (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="mb-6 flex size-24 items-center justify-center rounded-[32px] bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <Brain
                  size={48}
                  className="text-purple-400"
                />
              </div>

              <h2 className="text-3xl font-black text-white">
                Start a conversation
              </h2>

              <p className="mt-3 max-w-xl text-center text-slate-400">
                Your AI placement
                assistant can help
                with DSA, resumes,
                aptitude, companies,
                HR interviews, and
                preparation roadmaps.
              </p>

              {/* Starters */}
              <div className="mt-10 grid w-full max-w-4xl gap-4 md:grid-cols-2">
                {STARTERS.map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() =>
                        send(s)
                      }
                      className="group rounded-3xl border border-slate-800 bg-slate-950/50 p-5 text-left transition hover:border-purple-500/30 hover:bg-white/[0.03]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm leading-7 text-slate-300 group-hover:text-white">
                          {s}
                        </p>

                        <ArrowUpRight
                          size={18}
                          className="mt-1 text-slate-500 transition group-hover:text-purple-400"
                        />
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map(
                (m, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className={cn(
                      "flex gap-4",
                      m.role ===
                        "user"
                        ? "justify-end"
                        : "justify-start"
                    )}
                  >
                    {m.role ===
                      "assistant" && (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600">
                        <Bot
                          size={
                            20
                          }
                          className="text-white"
                        />
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[80%] rounded-[28px] border px-5 py-4 shadow-lg",
                        m.role ===
                          "user"
                          ? "border-purple-500/20 bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                          : "border-slate-800 bg-slate-950/60 text-slate-200"
                      )}
                    >
                      {m.role ===
                      "assistant" ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown>
                            {
                              m.content
                            }
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="leading-7">
                          {
                            m.content
                          }
                        </p>
                      )}
                    </div>

                    {m.role ===
                      "user" && (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-sm font-black text-white">
                        {getInitials(
                          user?.username
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              )}

              {/* Loading */}
              {loading && (
                <div className="flex gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600">
                    <Bot
                      size={20}
                      className="text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 rounded-[28px] border border-slate-800 bg-slate-950/60 px-5 py-4">
                    {[0, 1, 2].map(
                      (i) => (
                        <div
                          key={i}
                          className="h-2 w-2 animate-bounce rounded-full bg-purple-400"
                          style={{
                            animationDelay: `${i * 0.15}s`,
                          }}
                        />
                      )
                    )}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-800 bg-slate-950/50 p-5">
          <div className="flex items-center gap-4">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 focus-within:border-purple-500">
              <input
                value={input}
                onChange={(e) =>
                  setInput(
                    e.target.value
                  )
                }
                onKeyDown={(
                  e
                ) =>
                  e.key ===
                    "Enter" &&
                  !e.shiftKey &&
                  send()
                }
                placeholder="Ask about placements, DSA, resumes, companies..."
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                disabled={loading}
              />
            </div>

            <button
              onClick={() =>
                send()
              }
              disabled={
                loading ||
                !input.trim()
              }
              className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}