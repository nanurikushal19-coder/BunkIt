import React, { useState } from 'react';
import { SourcesPanel } from './SourcesPanel';
import { ChatPanel, Message } from './ChatPanel';
import { StudioPanel } from './StudioPanel';
import { AddSourceModal } from './AddSourceModal';
import { Settings, Share2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Source {
  id: string;
  type: 'pdf' | 'web' | 'text' | 'drive' | 'audio';
  name: string;
  date: string;
  content?: string;
}

export interface StudioItem {
  id: string;
  type: 'audio' | 'video' | 'mindmap' | 'report' | 'flashcards' | 'quiz' | 'infographic' | 'slide';
  title: string;
  createdAt: string;
}

export const NotebookView: React.FC = () => {
  const [activeMobileTab, setActiveMobileTab] = useState<'sources' | 'chat' | 'studio'>('chat');
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  
  const [sources, setSources] = useState<Source[]>([]);
  const [studioItems, setStudioItems] = useState<StudioItem[]>([]);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleAddSource = (type: string, name: string, content?: string) => {
    const newSource: Source = {
        id: Date.now().toString(),
        type: type as any,
        name: name,
        date: new Date().toLocaleDateString(),
        content
    };
    setSources(prev => [...prev, newSource]);
    
    // Switch to chat to show summary
    if (window.innerWidth < 1024) {
        setActiveMobileTab('chat');
    }

    // Auto-Summary Logic for Pasted Text
    if (type === 'text' && content) {
        setIsTyping(true);
        setTimeout(() => {
            const summary = `I've analyzed the text "${name}".\n\n**Summary:**\n${content.substring(0, 150)}...\n\n**Key Points:**\n• The text discusses the core concepts of the topic.\n• It highlights several critical arguments.\n• The conclusion suggests further research is needed.\n\nWould you like me to generate a quiz or flashcards based on this?`;
            
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'ai',
                content: summary
            }]);
            setIsTyping(false);
        }, 1500);
    } else if (sources.length === 0) {
        // First source added (non-text)
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'ai',
                content: "Source added! I've processed the document. You can now ask me questions, summarize it, or use the Studio tools to create study materials."
            }]);
            setIsTyping(false);
        }, 1000);
    }
  };

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    };
    setMessages(prev => [...prev, newMessage]);
    setIsTyping(true);

    // Simulated AI Response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "That's a great question. Based on your sources, the concept involves understanding the fundamental principles outlined in the introduction. Is there a specific section you'd like me to elaborate on?"
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleDeleteSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const handleCreateStudioItem = (type: StudioItem['type'], title: string) => {
    const newItem: StudioItem = {
        id: Date.now().toString(),
        type,
        title,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setStudioItems(prev => [newItem, ...prev]);
  };

  return (
    <div className="fixed inset-0 bg-white text-gray-900 flex flex-col z-40 pb-[80px]"> 
      {/* Top Bar - Light Theme */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center shadow-md shadow-zinc-900/10">
                <span className="font-bold text-white text-[10px]">NB</span>
            </div>
            <h1 className="text-base font-semibold text-gray-800">My Notebook</h1>
        </div>
        
        <div className="flex items-center gap-1">
            <button 
                onClick={() => setIsSourceModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition mr-2 shadow-sm"
            >
                <Plus size={14} />
                <span>Add source</span>
            </button>
            <button className="p-2 text-gray-400 hover:text-zinc-900 transition rounded-full hover:bg-gray-50">
                <Share2 size={18} />
            </button>
            <button className="p-2 text-gray-400 hover:text-zinc-900 transition hidden sm:block rounded-full hover:bg-gray-50">
                <Settings size={18} />
            </button>
            <div className="w-7 h-7 rounded-full bg-gray-100 overflow-hidden border border-gray-200 ml-2">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
            </div>
        </div>
      </div>

      {/* Mobile Tab Switcher - Light Theme */}
      <div className="lg:hidden flex border-b border-gray-100 bg-white">
        {['sources', 'chat', 'studio'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveMobileTab(tab as any)}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide relative transition-colors ${
              activeMobileTab === tab ? 'text-zinc-900' : 'text-gray-400'
            }`}
          >
            {tab}
            {activeMobileTab === tab && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />
            )}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative bg-gray-50/50">
        {/* Desktop Grid Layout */}
        <div className="hidden lg:grid grid-cols-[280px_1fr_300px] h-full">
            <SourcesPanel 
                sources={sources} 
                onAddSourceClick={() => setIsSourceModalOpen(true)} 
                onDeleteSource={handleDeleteSource}
            />
            <ChatPanel 
                hasSources={sources.length > 0} 
                onAddSourceClick={() => setIsSourceModalOpen(true)}
                messages={messages}
                onSendMessage={handleSendMessage}
                isTyping={isTyping}
            />
            <StudioPanel 
                hasSources={sources.length > 0} 
                items={studioItems}
                onCreateItem={handleCreateStudioItem}
            />
        </div>

        {/* Mobile View */}
        <div className="lg:hidden h-full">
            {activeMobileTab === 'sources' && (
                <SourcesPanel 
                    sources={sources} 
                    onAddSourceClick={() => setIsSourceModalOpen(true)} 
                    onDeleteSource={handleDeleteSource}
                />
            )}
            {activeMobileTab === 'chat' && (
                <ChatPanel 
                    hasSources={sources.length > 0} 
                    onAddSourceClick={() => setIsSourceModalOpen(true)}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isTyping={isTyping}
                />
            )}
            {activeMobileTab === 'studio' && (
                <StudioPanel 
                    hasSources={sources.length > 0}
                    items={studioItems}
                    onCreateItem={handleCreateStudioItem}
                />
            )}
        </div>
      </div>

      <AddSourceModal 
        isOpen={isSourceModalOpen} 
        onClose={() => setIsSourceModalOpen(false)} 
        onAddSource={handleAddSource}
      />
    </div>
  );
};
