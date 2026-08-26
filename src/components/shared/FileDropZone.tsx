import React, { useRef, useState } from 'react';
import { UploadCloud, FileUp, AlertTriangle } from 'lucide-react';
import { formatBytes } from '../../lib/fileUtils';

interface FileDropZoneProps {
  accept?: string[];
  maxFiles?: number;
  maxSizeMB?: number;
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
  iconColor?: string;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  accept,
  maxFiles = 20,
  maxSizeMB = 100,
  onFilesSelected,
  multiple = true,
  title = 'Drag and drop files here',
  subtitle = 'or click to browse from your device (100% Private & Local)',
  iconColor = 'text-cyan-400',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndPassFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);

    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (let i = 0; i < Math.min(fileList.length, multiple ? maxFiles : 1); i++) {
      const file = fileList[i];

      if (file.size > maxSizeBytes) {
        setErrorMessage(`File "${file.name}" exceeds maximum allowed limit of ${maxSizeMB} MB.`);
        continue;
      }

      if (accept && accept.length > 0) {
        const matches = accept.some((pattern) => {
          if (pattern === '*' || pattern === '*/*') return true;
          if (pattern.endsWith('/*')) {
            const prefix = pattern.split('/')[0];
            return file.type.startsWith(`${prefix}/`);
          }
          if (pattern.startsWith('.')) {
            return file.name.toLowerCase().endsWith(pattern.toLowerCase());
          }
          return file.type === pattern;
        });

        if (!matches) {
          setErrorMessage(`File "${file.name}" has an unsupported format.`);
          continue;
        }
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    validateAndPassFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative cursor-pointer rounded-3xl p-8 sm:p-10 transition-all text-center border-2 border-dashed flex flex-col items-center justify-center gap-3 ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : 'border-slate-700/60 hover:border-cyan-500/50 neu-inset'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept ? accept.join(',') : undefined}
          multiple={multiple}
          onChange={(e) => validateAndPassFiles(e.target.files)}
          className="hidden"
        />

        <div className={`w-14 h-14 rounded-2xl neu-flat flex items-center justify-center ${iconColor} shadow-lg shadow-cyan-500/10`}>
          {isDragOver ? <FileUp className="w-7 h-7 animate-bounce" /> : <UploadCloud className="w-7 h-7" />}
        </div>

        <div>
          <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
          <span>Max size: {maxSizeMB} MB</span>
          <span>•</span>
          <span>Max files: {multiple ? maxFiles : 1}</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
