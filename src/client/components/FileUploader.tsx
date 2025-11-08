import { useState, useRef, type ReactElement, type ChangeEvent, type DragEvent } from 'react';

import { type ValidationResult } from '../hooks/useFileValidation';

interface FileUploaderProps {
    onFilesSelected: (files: File[]) => void;
    validationMethod?: (file: File) => ValidationResult;
}

const FileUploader = ({ onFilesSelected, validationMethod }: FileUploaderProps): ReactElement => {
    const [isDragEvent, setIsDragEvent] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragEvent(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragEvent(false);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragEvent(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    };

    const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
        handleFiles(selectedFiles);
    };

    const handleFiles = (files: File[]) => {
        if (files.length === 0) {
            return;
        }

        setValidationError(null);

        if (!validationMethod) {
            onFilesSelected(files);
            return;
        }

        for (const file of files) {
            const result = validationMethod(file);
            if (!result.isValid) {
                setValidationError(result.errorMessage || 'Validation failed');
                return;
            }
        }
        onFilesSelected(files);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            className={`m-20 border-2 border-dashed rounded-lg p-8 flex flex-col items-center transition-colors duration-300 group cursor-pointer ${
                isDragEvent ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
            role="button"
            tabIndex={0}
            aria-label="Upload files by clicking or dragging and dropping"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
        >
            {validationError && (
                <div role="alert" aria-live="assertive" className="text-red-500 text-sm mb-2">
                    {validationError}
                </div>
            )}
            <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                    isDragEvent ? 'bg-blue-800 scale-110' : 'bg-blue-300 group-hover:scale-110 group-hover:bg-blue-800'
                }`}
            >
                <img
                    src="/arrow-up-from-bracket-solid-full.svg"
                    alt="Upload icon"
                    aria-hidden="true"
                    className="w-8 h-8 transition-all duration-300 group-hover:scale-110"
                    style={{ filter: 'invert(1)' }}
                />
            </div>
            <label htmlFor="file-input" className="sr-only">
                Click here to upload files or drag and drop them here
            </label>
            <input
                ref={fileInputRef}
                id="file-input"
                type="file"
                onChange={handleFileInputChange}
                className="sr-only"
                data-testid="file-input"
                multiple
            />
            <p className="font-medium">Click to Upload or Drag and Drop</p>
            <p className="text-sm text-gray-500">Select one or more files</p>
        </div>
    );
};

export default FileUploader;
