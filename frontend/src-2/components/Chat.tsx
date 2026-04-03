import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@/src/context/UserContext';
import { useRequests } from '@/src/context/RequestContext';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Send, User, Activity } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ChatProps {
  requestId: string;
}

const Chat: React.FC<ChatProps> = ({ requestId }) => {
  const { profile } = useUser();
  const { requests, sendMessage } = useRequests();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const request = requests.find(r => r.id === requestId);
  const messages = request?.messages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await sendMessage(requestId, text);
    setText('');
  };

  return (
    <div className="flex flex-col h-[400px] bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">
          <Send className="w-4 h-4 text-blue-600" />
          Mission Chat
        </h3>
        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">
          Live
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Send className="w-8 h-8 opacity-20" />
            <p className="text-xs">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === profile?.uid;
            return (
              <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                <div className={cn(
                  "max-w-[80%] p-3 rounded-2xl text-sm shadow-sm",
                  isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                )}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <Input 
          placeholder="Type a message..." 
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" className="shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default Chat;
