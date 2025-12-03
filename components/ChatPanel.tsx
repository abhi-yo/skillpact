import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { trpc } from "@/lib/trpc";
import { toast } from 'sonner';

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:4000';
  }
  return 'https://skillpact-chat-server-production.up.railway.app';
};

export interface ChatMessage {
  id?: string;
  senderId: string;
  content: string;
  createdAt?: string;
}

interface ChatPanelProps {
  exchangeId: string;
  userId: string;
}

const ChatPanel: React.FC<ChatPanelProps & { className?: string }> = ({ exchangeId, userId, className = "" }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { data: initialMessages } = trpc.message.getMessages.useQuery(
    { exchangeId },
    { 
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);
  useEffect(() => {
    if (!exchangeId) return;

    const url = getSocketUrl();

    const socket = io(url);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join', exchangeId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('message', (msg: ChatMessage) => {
      if (msg.senderId !== userId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on('connect_error', (err) => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [exchangeId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = trpc.message.sendMessage.useMutation({
    onError: () => {
      toast.error('Failed to send message. Please try again.');
    }
  });

  const sendMessage = () => {
    if (!input.trim()) return;

    const msg: ChatMessage = {
      senderId: userId,
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, msg]);

    sendMutation.mutate({ exchangeId, content: msg.content });

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('message', { exchangeId, message: msg });
    }

    setInput('');
  };

  return (
    <div className={`bg-white p-4 font-satoshi flex flex-col h-full ${className}`}>
      <div className="mb-4 text-lg font-bold tracking-tight">Chat</div>
      <div className="flex-1 overflow-y-auto mb-3 bg-white p-3 rounded-xl border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">No messages yet. Start the conversation.</div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
          >
            <span
              className={`inline-block max-w-xs break-words rounded-xl border-[2px] border-black px-3 py-2 text-sm leading-relaxed shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                msg.senderId === userId ? 'bg-blue-100' : 'bg-yellow-50'
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-auto flex gap-2">
        <input
          className="flex-1 rounded-xl border-[2px] border-black bg-white px-3 py-2 text-sm font-satoshi placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
          placeholder="Type a message..."
        />
        <button
          className="px-5 py-2 rounded-xl border-[2px] border-black bg-blue-400 text-sm font-semibold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
          onClick={sendMessage}
          disabled={!input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;