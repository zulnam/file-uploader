import { type ReactElement } from 'react';

import LoadingIcon from './LoadingIcon';

export interface FileListProps {
    files: { name: string; size: number }[];
    isLoading: boolean;
}

const FileList = ({ files, isLoading }: FileListProps): ReactElement => {
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) {
            return '0 Bytes';
        }
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
    };

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
                    <div className="flex flex-col">
                        {files.length > 0 ? (
                            <>
                                <span className="sr-only">
                                    {files.length} {files.length === 1 ? 'file' : 'files'} uploaded
                                </span>
                                <ul className="space-y-2" aria-label="Uploaded files">
                                    {files.map((file) => (
                                        <li key={file.name} className="flex flex-row justify-between">
                                            <span className="font-medium">{file.name}</span>
                                            <span
                                                className="text-gray-600"
                                                aria-label={`File size: ${formatFileSize(file.size)}`}
                                            >
                                                {formatFileSize(file.size)}
                                            </span>
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
