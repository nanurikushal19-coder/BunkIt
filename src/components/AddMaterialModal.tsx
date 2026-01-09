import React, { useState, useRef } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { Subject, Material } from '../types';

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (material: Material) => void;
  subjects: Subject[];
}

export const AddMaterialModal: React.FC<AddMaterialModalProps> = ({ isOpen, onClose, onAdd, subjects }) => {
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Limit file size to ~2MB for localStorage safety in this demo
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large for this demo (Max 2MB).");
        return;
      }
      setSelectedFile(file);
      if (!title) {
        // Auto-fill title with filename (without extension)
        const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !selectedFile || !title) return;

    setIsProcessing(true);

    // Convert file to Base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      
      const newMaterial: Material = {
        id: Date.now().toString(),
        subjectId,
        title,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileData: base64String,
        dateAdded: new Date().toLocaleDateString(),
        size: (selectedFile.size / 1024).toFixed(1) + ' KB'
      };

      onAdd(newMaterial);
      setIsProcessing(false);
      resetForm();
      onClose();
    };
    
    reader.onerror = () => {
      alert("Failed to read file");
      setIsProcessing(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  const resetForm = () => {
    setSubjectId('');
    setTitle('');
    setSelectedFile(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Upload Material</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Subject Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Subject</label>
            <select 
              required
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition appearance-none"
            >
              <option value="" disabled>Select a subject</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Document</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition ${
                selectedFile ? 'border-zinc-900 bg-zinc-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              {selectedFile ? (
                <div className="text-center">
                  <div className="w-10 h-10 bg-zinc-900 text-white rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FileText size={20} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Click to change</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Click to upload file</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, Docs, Images (Max 2MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Unit 1 Notes"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition"
            />
          </div>

          <button 
            type="submit"
            disabled={isProcessing || !selectedFile || !subjectId}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-3.5 rounded-xl mt-4 transition-colors active:scale-[0.98] shadow-lg shadow-zinc-900/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </>
            ) : (
              'Save Material'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
