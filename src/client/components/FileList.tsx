import { type ReactElement, useMemo } from 'react';

import LoadingIcon from './LoadingIcon';
import ProgressBar from './ProgressBar';

export interface FileListProps {
    files: { name: string; size: number }[];
    fileNameSet: Set<string>;
    isLoading: boolean;
    uploadProgress: Record<string, number>;
    uploadErrors: Record<string, string>;
}

const FileList = ({ files, fileNameSet, isLoading, uploadProgress, uploadErrors }: FileListProps): ReactElement => {
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) {
            return '0 Bytes';
        }
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
    };

    const allFiles = useMemo(() => {
        const uploadingFiles = Object.keys(uploadProgress)
            .filter((fileName) => !fileNameSet.has(fileName))
            .map((fileName) => ({
                name: fileName,
                size: 0, // files being uploaded don't have a size yet
                progress: uploadProgress[fileName],
                error: uploadErrors[fileName],
            }));

        const serverFilesWithProgress = files.map((file) => ({
            ...file,
            progress: 100,
            error: undefined,
        }));

        return [...uploadingFiles, ...serverFilesWithProgress];
    }, [files, fileNameSet, uploadProgress, uploadErrors]);

    return (
        <div className="flex flex-col justify-center items-center h-full border-2 border-gray-300 rounded-lg p-8">
            <h2 className="text-2xl font-bold">File List</h2>
            <div aria-live="polite" aria-busy={isLoading} className="w-full flex justify-center">
                {isLoading ? (
                    <div className="flex flex-col items-center" role="status" aria-label="Loading files">
                        <LoadingIcon />
                        <span className="sr-only">Loading files...</span>
                    </div>
                ) : (
                    <div className="flex flex-col w-full">
                        {allFiles.length > 0 ? (
                            <>
                                <span className="sr-only">
                                    {allFiles.length} {allFiles.length === 1 ? 'file' : 'files'}
                                </span>
                                <ul className="space-y-4" aria-label="Files">
                                    {allFiles.map((file) => (
                                        <li key={file.name} className="flex flex-col space-y-2">
                                            <div className="flex flex-row justify-between">
                                                <span className="font-medium">{file.name}</span>
                                                {file.size > 0 && (
                                                    <span
                                                        className="text-gray-600"
                                                        aria-label={`File size: ${formatFileSize(file.size)}`}
                                                    >
                                                        {formatFileSize(file.size)}
                                                    </span>
                                                )}
                                            </div>
                                            {file.progress !== undefined && file.progress < 100 && (
                                                <div className="flex flex-col space-y-1">
                                                    <ProgressBar percentage={file.progress} />
                                                    <span className="text-xs text-gray-500 text-right">
                                                        {Math.round(file.progress)}%
                                                    </span>
                                                </div>
                                            )}
                                            {file.error && (
                                                <span className="text-xs text-red-500" role="alert">
                                                    Error: {file.error}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <p role="status" aria-live="polite">
                                No files uploaded
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileList;
