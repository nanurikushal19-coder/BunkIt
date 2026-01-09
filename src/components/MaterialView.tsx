import React, { useState } from 'react';
import { Plus, Folder, FileText, ChevronRight, Download, Eye, Search } from 'lucide-react';
import { Material, Subject } from '../types';
import { AddMaterialModal } from './AddMaterialModal';
import { motion, AnimatePresence } from 'framer-motion';

interface MaterialViewProps {
  materials: Material[];
  subjects: Subject[];
  onAddMaterial: (material: Material) => void;
  onDeleteMaterial: (id: string) => void;
}

export const MaterialView: React.FC<MaterialViewProps> = ({ 
  materials, 
  subjects, 
  onAddMaterial,
  onDeleteMaterial
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Group materials by subject
  const materialsBySubject = subjects.reduce((acc, subject) => {
    const subjectMaterials = materials.filter(m => m.subjectId === subject.id);
    if (subjectMaterials.length > 0) {
      acc[subject.id] = subjectMaterials;
    }
    return acc;
  }, {} as Record<string, Material[]>);

  // Filter subjects based on search or existence of materials
  const filteredSubjectIds = Object.keys(materialsBySubject).filter(subId => {
    const subject = subjects.find(s => s.id === subId);
    if (!subject) return false;
    
    // If searching, check subject name or material titles
    if (searchQuery) {
      const nameMatch = subject.name.toLowerCase().includes(searchQuery.toLowerCase());
      const materialMatch = materialsBySubject[subId].some(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return nameMatch || materialMatch;
    }
    
    return true;
  });

  const handleOpenMaterial = (material: Material) => {
    // Open Base64 data in new tab
    const win = window.open();
    if (win) {
        win.document.write(
            `<iframe src="${material.fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-24">
      <div className="max-w-md mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Study Material</h1>
            <p className="text-gray-500 text-sm mt-1">All your documents in one place</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-10 h-10 rounded-2xl bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 flex items-center justify-center hover:scale-105 transition"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text"
                placeholder="Search subjects or files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-zinc-900 transition shadow-sm"
            />
        </div>

        {/* Content */}
        <div className="space-y-3">
          {filteredSubjectIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Folder size={48} className="mb-4 opacity-20" />
              <p className="text-center">
                {searchQuery ? 'No matches found' : 'No materials uploaded yet'}
              </p>
              {!searchQuery && (
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="mt-2 text-zinc-900 font-medium text-sm hover:underline"
                >
                    Upload your first document
                </button>
              )}
            </div>
          ) : (
            filteredSubjectIds.map(subjectId => {
              const subject = subjects.find(s => s.id === subjectId);
              const subjectMaterials = materialsBySubject[subjectId];
              const isExpanded = expandedSubjectId === subjectId || searchQuery.length > 0;

              if (!subject) return null;

              return (
                <div key={subjectId} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  {/* Subject Header */}
                  <button 
                    onClick={() => setExpandedSubjectId(isExpanded ? null : subjectId)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Folder size={20} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                        <p className="text-xs text-gray-500">{subjectMaterials.length} files</p>
                      </div>
                    </div>
                    <ChevronRight 
                        size={20} 
                        className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} 
                    />
                  </button>

                  {/* Files List */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100 bg-gray-50/50"
                      >
                        <div className="p-2 space-y-1">
                          {subjectMaterials.map(material => (
                            <div 
                                key={material.id} 
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-sm transition group"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                                        <FileText size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-medium text-gray-900 truncate">{material.title}</h4>
                                        <p className="text-[10px] text-gray-500">{material.dateAdded} • {material.size}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => handleOpenMaterial(material)}
                                        className="p-2 text-gray-400 hover:text-zinc-900 hover:bg-gray-100 rounded-lg transition"
                                        title="View"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if(confirm('Delete this file?')) onDeleteMaterial(material.id);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                        title="Delete"
                                    >
                                        <Download size={18} className="rotate-45" /> {/* Using rotate for delete icon look or use Trash */}
                                    </button>
                                </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AddMaterialModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={onAddMaterial}
        subjects={subjects}
      />
    </div>
  );
};
