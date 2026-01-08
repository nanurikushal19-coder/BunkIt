import React, { useRef, useEffect } from 'react';
import { Upload, ArrowUp, Sparkles, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

interface ChatPanelProps {
  hasSources: boolean;
  onAddSourceClick: () => void;
  messages: Message[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ 
  hasSources, 
  onAddSourceClick, 
  messages, 
  onSendMessage,
  isTyping 
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className="h-full flex flex-col bg-white relative">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-gray-50/30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-0 animate-in fade-in duration-700">
             <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mb-6 shadow-xl shadow-gray-200/50">
                <Sparkles className="text-zinc-900" size={28} />
             </div>
             
             {!hasSources ? (
                <>
                    <h3 className="text-xl text-gray-900 font-semibold mb-2">Start by adding a source</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-xs">Upload documents, paste text, or add links to chat with your personal AI notebook assistant.</p>
                    <button 
                        onClick={onAddSourceClick}
                        className="px-6 py-2.5 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 transition flex items-center gap-2 shadow-lg shadow-zinc-900/10 text-sm font-medium"
                    >
                        <Upload size={16} />
                        <span>Add Source</span>
                    </button>
                </>
             ) : (
                <>
                    <h3 className="text-xl text-gray-900 font-semibold mb-2">Ready to help!</h3>
                    <p className="text-gray-500 text-sm max-w-xs">Ask me anything about your uploaded sources.</p>
                </>
             )}
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-zinc-900 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}>
                  {msg.role === 'ai' && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                        <Bot size={14} className="text-zinc-900" />
                        <span className="text-xs font-bold text-gray-400 uppercase">Assistant</span>
                    </div>
                  )}
                  <p className="leading-relaxed text-sm">{msg.content}</p>
                </div>
              </motion.div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none flex gap-1 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="relative bg-gray-50 rounded-3xl border border-gray-200 focus-within:border-zinc-300 focus-within:bg-white transition-all shadow-sm">
            <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={hasSources ? "Ask a question..." : "Add a source to chat"}
                className="w-full bg-transparent text-gray-900 pl-5 pr-14 py-3.5 focus:outline-none placeholder-gray-400 text-sm"
                disabled={!hasSources && messages.length === 0}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <button 
                    onClick={handleSubmit}
                    disabled={!inputValue.trim()}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                        inputValue.trim() 
                            ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-md' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <ArrowUp size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
