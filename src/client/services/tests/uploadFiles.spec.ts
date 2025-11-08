import axios from 'axios';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { uploadSingle, uploadChunk } from '../uploadFiles';

vi.mock('axios');

describe('uploadSingle', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should upload a single file successfully', async () => {
        const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const mockResponse = { message: 'File uploaded successfully' };

        vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

        const result = await uploadSingle(mockFile);

        expect(axios.post).toHaveBeenCalledWith(
            '/api/upload-single',
            expect.any(FormData),
            expect.objectContaining({
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
        );
        expect(result).toEqual(mockResponse);
    });

    it('should handle upload failure', async () => {
        const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const mockError = new Error('Upload failed');

        vi.mocked(axios.post).mockRejectedValue(mockError);

        await expect(uploadSingle(mockFile)).rejects.toThrow('Upload failed');
    });

    it('should upload various file types', async () => {
        const files = [
            new File(['pdf content'], 'document.pdf', { type: 'application/pdf' }),
            new File(['image data'], 'image.png', { type: 'image/png' }),
            new File(['text'], 'notes.txt', { type: 'text/plain' }),
        ];

        const mockResponse = { message: 'File uploaded successfully' };
        vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

        for (const file of files) {
            const result = await uploadSingle(file);
            expect(result).toEqual(mockResponse);
        }

        expect(axios.post).toHaveBeenCalledTimes(3);
    });

    it('should handle empty file', async () => {
        const mockFile = new File([], 'empty.txt', { type: 'text/plain' });
        const mockResponse = { message: 'File uploaded successfully' };

        vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

        const result = await uploadSingle(mockFile);
        expect(result).toEqual(mockResponse);
    });

    it('should handle network timeout', async () => {
        const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const timeoutError = new Error('Network timeout');

        vi.mocked(axios.post).mockRejectedValue(timeoutError);

        await expect(uploadSingle(mockFile)).rejects.toThrow('Network timeout');
    });
});

describe('uploadChunk', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should upload a chunk successfully', async () => {
        const mockFile = new File(['chunk data'], 'test.txt', { type: 'text/plain' });
        const mockResponse = { message: 'Chunk uploaded successfully' };

        vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

        const result = await uploadChunk(mockFile, 0, 5);

        expect(axios.post).toHaveBeenCalledWith(
            '/api/upload-chunk',
            expect.any(FormData),
            expect.objectContaining({
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
        );
        expect(result).toEqual(mockResponse);
    });

    it('should upload first chunk with correct indices', async () => {
        const mockFile = new File(['chunk'], 'test.txt', { type: 'text/plain' });
        const mockResponse = { message: 'Chunk uploaded' };

        vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

        await uploadChunk(mockFile, 0, 10);

        const callArgs = vi.mocked(axios.post).mock.calls[0];
        const formData = callArgs[1] as FormData;

        expect(formData.get('currentChunkIndex')).toBe('0');
        expect(formData.get('totalChunks')).toBe('10');
    });

    it('should upload middle chunk with correct indices', async () => {
        const mockFile = new File(['chunk'], 'test.txt', { type: 'text/plain' });
        const mockResponse = { message: 'Chunk uploaded' };

        vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

        await uploadChunk(mockFile, 5, 10);

        const callArgs = vi.mocked(axios.post).mock.calls[0];
        const formData = callArgs[1] as FormData;

        expect(formData.get('currentChunkIndex')).toBe('5');
        expect(formData.get('totalChunks')).toBe('10');
    });

    it('should upload last chunk with correct indices', async () => {
        const mockFile = new File(['chunk'], 'test.txt', { type: 'text/plain' });
        const mockResponse = { message: 'Chunk uploaded' };

        vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

        await uploadChunk(mockFile, 9, 10);

        const callArgs = vi.mocked(axios.post).mock.calls[0];
        const formData = callArgs[1] as FormData;

        expect(formData.get('currentChunkIndex')).toBe('9');
        expect(formData.get('totalChunks')).toBe('10');
    });

    it('should handle chunk upload failure', async () => {
        const mockFile = new File(['chunk'], 'test.txt', { type: 'text/plain' });
        const mockError = new Error('Chunk upload failed');

        vi.mocked(axios.post).mockRejectedValue(mockError);

        await expect(uploadChunk(mockFile, 0, 5)).rejects.toThrow('Chunk upload failed');
    });

    it('should handle single chunk upload (totalChunks = 1)', async () => {
        const mockFile = new File(['data'], 'small.txt', { type: 'text/plain' });
        const mockResponse = { message: 'Chunk uploaded' };

        vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

        const result = await uploadChunk(mockFile, 0, 1);

        expect(result).toEqual(mockResponse);
    });

    it('should preserve file name during chunk upload', async () => {
        const fileName = 'important-document.pdf';
        const mockFile = new File(['chunk'], fileName, { type: 'application/pdf' });
        const mockResponse = { message: 'Chunk uploaded' };

        vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

        await uploadChunk(mockFile, 0, 3);

        const callArgs = vi.mocked(axios.post).mock.calls[0];
        const formData = callArgs[1] as FormData;
        const uploadedFile = formData.get('file') as File;

        expect(uploadedFile.name).toBe(fileName);
    });
});
