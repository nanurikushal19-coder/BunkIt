import React from 'react';
import { Plus, Search, Globe, Sparkles, FileText, Trash2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Source {
  id: string;
  type: 'pdf' | 'web' | 'text';
  name: string;
  date: string;
}

interface SourcesPanelProps {
  sources: Source[];
  onAddSourceClick: () => void;
  onDeleteSource: (id: string) => void;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({ sources, onAddSourceClick, onDeleteSource }) => {
  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-100">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-gray-800 font-semibold text-sm uppercase tracking-wide">Sources</h2>
        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{sources.length}</span>
      </div>

      {/* Add Source Button */}
      <div className="px-4 mb-4">
        <button 
          onClick={onAddSourceClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition group"
        >
          <Plus size={18} className="text-zinc-900" />
          <span className="text-sm font-medium">Add source</span>
        </button>
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
        {sources.length === 0 ? (
          <div className="text-center mt-10 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No sources yet</p>
            <p className="text-xs mt-1 opacity-60 max-w-[200px] mx-auto">
              Upload PDFs or add links to start chatting
            </p>
          </div>
        ) : (
          sources.map((source) => (
            <motion.div 
              key={source.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="group flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition cursor-pointer"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    source.type === 'pdf' ? 'bg-red-50 text-red-500' : 
                    source.type === 'web' ? 'bg-blue-50 text-blue-500' : 
                    'bg-amber-50 text-amber-500'
                }`}>
                    <FileText size={16} />
                </div>
                <div className="truncate">
                    <p className="text-sm font-medium text-gray-800 truncate">{source.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{source.type.toUpperCase()} • {source.date}</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteSource(source.id); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition bg-white rounded-md shadow-sm"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
