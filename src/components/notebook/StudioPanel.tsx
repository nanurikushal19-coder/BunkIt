import React, { useState } from 'react';
import { Plus, Mic, Video, Network, FileBarChart, Layers, HelpCircle, PenTool, Play, FileText, CheckCircle2 } from 'lucide-react';
import { StudioItem } from './NotebookView';

interface StudioPanelProps {
  hasSources: boolean;
  items: StudioItem[];
  onCreateItem: (type: StudioItem['type'], title: string) => void;
}

const TOOLS = [
  { id: 'audio', icon: Mic, label: 'Audio Overview', color: 'text-blue-500 bg-blue-50' },
  { id: 'video', icon: Video, label: 'Video Summary', color: 'text-red-500 bg-red-50' },
  { id: 'mindmap', icon: Network, label: 'Mind Map', color: 'text-green-500 bg-green-50' },
  { id: 'report', icon: FileBarChart, label: 'Study Guide', color: 'text-amber-500 bg-amber-50' },
  { id: 'flashcards', icon: Layers, label: 'Flashcards', color: 'text-purple-500 bg-purple-50' },
  { id: 'quiz', icon: HelpCircle, label: 'Practice Quiz', color: 'text-pink-500 bg-pink-50' },
];

export const StudioPanel: React.FC<StudioPanelProps> = ({ hasSources, items, onCreateItem }) => {
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const handleToolClick = (toolId: string, label: string) => {
    if (!hasSources) return;
    
    setGeneratingId(toolId);
    setTimeout(() => {
        onCreateItem(toolId as any, label);
        setGeneratingId(null);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-100">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-gray-100 lg:border-none">
        <h2 className="text-gray-800 font-semibold text-sm uppercase tracking-wide">Studio Tools</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* Tools Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
            {TOOLS.map((tool) => {
                const isGenerating = generatingId === tool.id;
                return (
                    <button 
                        key={tool.id}
                        disabled={!hasSources || isGenerating}
                        onClick={() => handleToolClick(tool.id, tool.label)}
                        className="relative overflow-hidden flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-300 hover:shadow-md transition text-center disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isGenerating && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-[1px] z-10">
                                <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tool.color} mb-1`}>
                            <tool.icon size={20} />
                        </div>
                        <span className="text-xs text-gray-700 font-medium">{tool.label}</span>
                    </button>
                );
            })}
        </div>

        {/* Output List */}
        <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Generated Content</h3>
            
            {items.length === 0 ? (
                <div className="flex flex-col items-center text-center mt-4 p-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
                    <PenTool className="text-gray-300 mb-3" size={24} />
                    <p className="text-gray-400 text-xs font-medium">
                        {hasSources 
                            ? "Select a tool to generate content." 
                            : "Add sources to unlock tools."}
                    </p>
                </div>
            ) : (
                <div className="space-y-2 animate-in slide-in-from-bottom duration-500">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-300 hover:shadow-sm transition group cursor-pointer">
                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 group-hover:text-zinc-900 transition">
                                {item.type === 'audio' ? <Play size={18} /> : <FileText size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm text-gray-800 font-medium truncate">{item.title}</h4>
                                <p className="text-[10px] text-gray-500 font-medium">Generated at {item.createdAt}</p>
                            </div>
                            <CheckCircle2 size={16} className="text-green-500" />
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
