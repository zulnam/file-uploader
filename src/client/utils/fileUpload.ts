import { uploadChunk, uploadSingle } from '../services/uploadFiles';

// These would ideally live in AWS SSM:Parameter Store or similar
const CHUNK_SIZE = 1024 * 1024; // 1 MB
const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024; // 5 MB

export const uploadFile = async (file: File, onProgress?: (progress: number) => void) => {
    if (file.size > LARGE_FILE_THRESHOLD) {
        return await uploadFileInChunks(file, onProgress);
    }

    return await uploadSingle(file);
};

export const uploadFileInChunks = async (file: File, onProgress?: (progress: number) => void) => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    for (let currentChunkIndex = 0; currentChunkIndex < totalChunks; currentChunkIndex++) {
        const start = currentChunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const chunkFile = new File([chunk], file.name, { type: file.type });

        await uploadChunk(chunkFile, currentChunkIndex, totalChunks);

        if (onProgress) {
            const progress = ((currentChunkIndex + 1) / totalChunks) * 100;
            onProgress(progress);
        }
    }
};
