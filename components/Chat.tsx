'use client';

import { useState, useCallback } from 'react';
import { Message } from '@/lib/types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="border-b px-4 py-3 bg-white">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">B</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">BenefitsAI</h1>
            <p className="text-sm text-gray-500">Your benefits eligibility assistant</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden max-w-3xl mx-auto w-full">
        <MessageList messages={messages} isLoading={isLoading} />

        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-100">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        <MessageInput onSend={sendMessage} disabled={isLoading} />
      </main>

      <footer className="border-t py-2 px-4 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          This tool provides general information only. Always verify eligibility with official sources.
        </p>
      </footer>
    </div>
  );
}
