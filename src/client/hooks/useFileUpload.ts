import { useState, useCallback } from 'react';

import { uploadFile } from '../utils/fileUpload';

interface UploadState {
    progress: Record<string, number>;
    errors: Record<string, string>;
    isUploading: boolean;
}

export const useFileUpload = () => {
    const [uploadState, setUploadState] = useState<UploadState>({
        progress: {},
        errors: {},
        isUploading: false,
    });

    const uploadFiles = useCallback(async (files: File[]) => {
        setUploadState((prev) => ({ ...prev, isUploading: true }));

        for (const file of files) {
            try {
                await uploadFile(file, (progress) => {
                    setUploadState((prev) => ({
                        ...prev,
                        progress: { ...prev.progress, [file.name]: progress },
                    }));
                });
            } catch (error) {
                setUploadState((prev) => ({
                    ...prev,
                    errors: {
                        ...prev.errors,
                        [file.name]: error instanceof Error ? error.message : 'Upload failed',
                    },
                }));
            }
        }

        setUploadState((prev) => ({ ...prev, isUploading: false }));
    }, []);

    return {
        uploadFiles,
        ...uploadState,
    };
};
