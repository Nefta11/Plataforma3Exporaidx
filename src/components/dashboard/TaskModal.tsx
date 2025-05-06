import React, { useState } from 'react';
import { Check, X, Upload } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Task } from '../../types/task';
import { useEffect } from 'react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskNumber: number;
  isOrangeButton?: boolean;
  onComplete: (taskNumber: number, isCompleted: boolean) => void;
  isCompleted: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskNumber,
  isOrangeButton = false,
  onComplete,
  isCompleted: initialIsCompleted
}) => {
  const [notes, setNotes] = useState('');
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [files, setFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Reset state when modal opens with a new task
  useEffect(() => {
    setIsCompleted(initialIsCompleted);
    setNotes('');
    setFiles([]);
  }, [taskNumber, initialIsCompleted]);

  const handleStatusChange = (newState: boolean) => {
    setIsCompleted(newState);
    onComplete(taskNumber, newState);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      onComplete(taskNumber, true);
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tarea ${taskNumber}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="block text-xs font-medium text-gray-900 text-center">
            Descripción de la Tarea
          </label>
          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-center">
            <p className="text-xs text-gray-600 leading-relaxed">
              Para completar esta tarea:
            </p>
            <ul className="mt-3 space-y-2 text-xs text-gray-600">
              <li>Agrega notas relevantes sobre el progreso</li>
              <li>Adjunta los archivos necesarios</li>
              <li>Marca como completada usando el interruptor</li>
            </ul>
            <p className="mt-3 text-xs text-gray-600">
              Tu progreso se guardará automáticamente
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-900 mb-2 text-center">
            Notas
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[120px] px-4 py-3 bg-gray-50/50 border border-gray-200 
              rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400
              transition-all duration-200 ease-out backdrop-blur-sm
              placeholder:text-gray-400 text-gray-900 font-medium text-sm text-center"
            placeholder="Escribe aquí tus notas sobre el progreso de la tarea..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-900 mb-2 text-center">
            Cargar Archivos
          </label>
          <div 
            className={`
              relative group border-2 border-dashed rounded-xl
              ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}
              transition-all duration-200 ease-out
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full px-4 py-6 flex flex-col items-center justify-center text-gray-500">
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <span className="text-sm font-medium text-center">
                Arrastra los archivos aquí
                <br />
                o haz clic para seleccionarlos
              </span>
            </div>
          </div>
          
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span className="text-sm truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between py-2 px-4 bg-gray-50/30 
          border border-gray-100 rounded-xl">
          <label htmlFor="completed" className="text-xs font-medium text-gray-900">
            Tarea completada
          </label>
          <div className="relative">
            <input
              type="checkbox"
              id="completed"
              checked={isCompleted}
              onChange={(e) => handleStatusChange(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-12 h-7 rounded-full transition-all duration-200 ease-out cursor-pointer
              ${isCompleted ? 'bg-blue-500' : 'bg-gray-200'}`}
              onClick={() => handleStatusChange(!isCompleted)}>
              <div className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white 
                shadow-sm transition-all duration-200 ease-out transform
                ${isCompleted ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium rounded-xl border border-gray-200
              hover:bg-gray-50 transition-all duration-200 ease-out text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-medium rounded-xl
              bg-gradient-to-br from-blue-500 to-blue-600 text-white border border-blue-400
              hover:from-blue-600 hover:to-blue-700 transition-all duration-200 ease-out
              shadow-sm hover:shadow transform hover:scale-[1.02]"
          >
            <Check size={16} />
            {isSaving ? 'Guardando...' : 'Completar Tarea'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}