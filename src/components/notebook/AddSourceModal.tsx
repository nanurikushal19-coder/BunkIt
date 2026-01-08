import React, { useState, useRef } from 'react';
import { X, Upload, Link, HardDrive, FileText, ArrowLeft, Copy, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSource: (type: string, name: string, content?: string) => void;
}

type ViewMode = 'menu' | 'url' | 'text' | 'drive';

export const AddSourceModal: React.FC<AddSourceModalProps> = ({ isOpen, onClose, onAddSource }) => {
  const [view, setView] = useState<ViewMode>('menu');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setView('menu');
    setInputValue('');
    setIsLoading(false);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setTimeout(() => {
        onAddSource('pdf', file.name);
        resetAndClose();
      }, 1000);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue) return;
    setIsLoading(true);
    setTimeout(() => {
        let name = inputValue.replace(/^https?:\/\//, '').split('/')[0];
        if (name.length > 20) name = name.substring(0, 20) + '...';
        onAddSource('web', name || 'Website Link');
        resetAndClose();
    }, 800);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue) return;
    setIsLoading(true);
    setTimeout(() => {
        const name = inputValue.substring(0, 20) + (inputValue.length > 20 ? '...' : '');
        onAddSource('text', name, inputValue);
        resetAndClose();
    }, 600);
  };

  const handleDriveSelect = (fileName: string) => {
    setIsLoading(true);
    setTimeout(() => {
        onAddSource('drive', fileName);
        resetAndClose();
    }, 800);
  };

  const ListItem = ({ icon: Icon, label, onClick, color }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition group"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} bg-opacity-10`}>
        <Icon size={20} className={color.replace('bg-', 'text-')} />
      </div>
      <span className="flex-1 text-left text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400" />
    </button>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-gray-100"
        >
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-2">
                {view !== 'menu' && (
                    <button onClick={() => setView('menu')} className="p-1 -ml-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <h2 className="text-base font-semibold text-gray-900">
                    {view === 'menu' && 'Add Source'}
                    {view === 'url' && 'Website Link'}
                    {view === 'text' && 'Paste Text'}
                    {view === 'drive' && 'Google Drive'}
                </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>

          <div className="p-2">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-gray-500 text-xs font-medium">Adding source...</p>
                </div>
            ) : (
                <>
                    {/* MENU VIEW */}
                    {view === 'menu' && (
                        <div className="flex flex-col gap-1 p-2">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={handleFileUpload}
                                accept=".pdf,.txt,.md,.doc,.docx"
                            />
                            <ListItem 
                                icon={Upload} 
                                label="Upload File" 
                                color="bg-blue-500 text-blue-600" 
                                onClick={() => fileInputRef.current?.click()} 
                            />
                            <ListItem 
                                icon={HardDrive} 
                                label="Google Drive" 
                                color="bg-green-500 text-green-600" 
                                onClick={() => setView('drive')} 
                            />
                            <ListItem 
                                icon={Link} 
                                label="Website Link" 
                                color="bg-orange-500 text-orange-600" 
                                onClick={() => setView('url')} 
                            />
                            <ListItem 
                                icon={Copy} 
                                label="Paste Text" 
                                color="bg-purple-500 text-purple-600" 
                                onClick={() => setView('text')} 
                            />
                        </div>
                    )}

                    {/* URL VIEW */}
                    {view === 'url' && (
                        <form onSubmit={handleUrlSubmit} className="p-4 space-y-4">
                            <div>
                                <input 
                                    type="url" 
                                    autoFocus
                                    required
                                    placeholder="https://example.com"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="w-full bg-gray-50 text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all text-sm"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={!inputValue}
                                className="w-full py-3 bg-zinc-900 text-white font-medium rounded-xl hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Add Link
                            </button>
                        </form>
                    )}

                    {/* TEXT VIEW */}
                    {view === 'text' && (
                        <form onSubmit={handleTextSubmit} className="p-4 space-y-4">
                            <textarea 
                                autoFocus
                                required
                                placeholder="Paste your text content here..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full h-40 bg-gray-50 text-gray-900 p-4 rounded-xl border border-gray-200 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all resize-none text-sm"
                            />
                            <button 
                                type="submit"
                                disabled={!inputValue}
                                className="w-full py-3 bg-zinc-900 text-white font-medium rounded-xl hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Add Text
                            </button>
                        </form>
                    )}

                    {/* DRIVE VIEW (Mock) */}
                    {view === 'drive' && (
                        <div className="p-2 space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase ml-3 mb-2">Recent Files</p>
                            <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                                {['Project_Proposal.pdf', 'Meeting_Notes.docx', 'Research_Data.pdf', 'Lecture_Slides.pdf'].map((file, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => handleDriveSelect(file)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-left group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:text-zinc-900">
                                            <FileText size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-700 truncate">{file}</p>
                                            <p className="text-[10px] text-gray-400">Modified {i + 1}d ago</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
