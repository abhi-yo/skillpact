import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { trpc } from "@/lib/trpc";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://skillpact-chat-server-production.up.railway.app';

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
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch initial history
  const { data: initialMessages } = trpc.message.getMessages.useQuery({ exchangeId });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('join', exchangeId);
    socket.on('message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.disconnect();
    };
  }, [exchangeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = trpc.message.sendMessage.useMutation();

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: ChatMessage = {
      senderId: userId,
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };
    // Persist then emit for realtime UI updates
    sendMutation.mutate({ exchangeId, content: msg.content });
    socketRef.current?.emit('message', { exchangeId, message: msg });
    setInput('');
  };

  return (
    <div className={`border-2 border-black bg-white p-4 rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-satoshi flex flex-col ${className}` }>
      <div className="font-bold mb-2 text-lg">Chat</div>
      <div className="flex-1 overflow-y-auto mb-2 bg-gray-50 p-2 rounded-lg border-2 border-black">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.senderId === userId ? 'flex justify-end' : 'flex justify-start'}>
            <span className="inline-block px-3 py-2 rounded-lg bg-gray-200 text-black mb-1 max-w-xs break-words font-satoshi text-base border border-gray-300">
              {msg.content}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2 mt-2">
        <input
          className="flex-1 border-2 border-black rounded-lg px-3 py-2 text-base font-satoshi focus:outline-none focus:ring-2 focus:ring-black"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
          placeholder="Type a message..."
        />
        <button
          className="px-6 py-2 bg-blue-500 text-white font-bold border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-satoshi text-base hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPanel; 