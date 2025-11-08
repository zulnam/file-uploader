import axios from 'axios';

export const uploadSingle = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('/api/upload-single', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data as { message: string };
};

export const uploadChunk = async (file: File, currentChunkIndex: number, totalChunks: number) => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('currentChunkIndex', currentChunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());

    const response = await axios.post('/api/upload-chunk', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data as { message: string };
};
