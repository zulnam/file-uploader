import { describe, expect, it, vi, beforeEach } from 'vitest';

import * as uploadFilesService from '../../services/uploadFiles';
import { uploadFile, uploadFileInChunks } from '../fileUpload';

vi.mock('../../services/uploadFiles');

describe('uploadFile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should upload small file using uploadSingle', async () => {
        const mockFile = new File(['small content'], 'small.txt', { type: 'text/plain' });
        Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }); // 1 MB

        const mockResponse = { message: 'File uploaded' };
        vi.spyOn(uploadFilesService, 'uploadSingle').mockResolvedValue(mockResponse);

        const result = await uploadFile(mockFile);

        expect(uploadFilesService.uploadSingle).toHaveBeenCalledWith(mockFile);
        expect(result).toEqual(mockResponse);
    });

    it('should upload large file using uploadFileInChunks', async () => {
        const mockFile = new File(['large content'], 'large.txt', { type: 'text/plain' });
        Object.defineProperty(mockFile, 'size', { value: 6 * 1024 * 1024 }); // 6 MB

        vi.spyOn(uploadFilesService, 'uploadChunk').mockResolvedValue({ message: 'Chunk uploaded' });

        const mockOnProgress = vi.fn();
        await uploadFile(mockFile, mockOnProgress);

        expect(uploadFilesService.uploadChunk).toHaveBeenCalled();
        expect(mockOnProgress).toHaveBeenCalled();
    });

    it('should upload file exactly at threshold using uploadSingle', async () => {
        const mockFile = new File(['content'], 'exact.txt', { type: 'text/plain' });
        Object.defineProperty(mockFile, 'size', { value: 5 * 1024 * 1024 }); // Exactly 5 MB

        const mockResponse = { message: 'File uploaded' };
        vi.spyOn(uploadFilesService, 'uploadSingle').mockResolvedValue(mockResponse);

        const result = await uploadFile(mockFile);

        expect(uploadFilesService.uploadSingle).toHaveBeenCalledWith(mockFile);
        expect(result).toEqual(mockResponse);
    });

    it('should upload file just over threshold using uploadFileInChunks', async () => {
        const mockFile = new File(['content'], 'just-over.txt', { type: 'text/plain' });
        Object.defineProperty(mockFile, 'size', { value: 5 * 1024 * 1024 + 1 }); // 5 MB + 1 byte

        vi.spyOn(uploadFilesService, 'uploadChunk').mockResolvedValue({ message: 'Chunk uploaded' });

        await uploadFile(mockFile);

        expect(uploadFilesService.uploadChunk).toHaveBeenCalled();
    });

    it('should not call onProgress for small files', async () => {
        const mockFile = new File(['small'], 'small.txt', { type: 'text/plain' });
        Object.defineProperty(mockFile, 'size', { value: 1024 });

        const mockOnProgress = vi.fn();
        vi.spyOn(uploadFilesService, 'uploadSingle').mockResolvedValue({ message: 'Uploaded' });

        await uploadFile(mockFile, mockOnProgress);

        expect(mockOnProgress).not.toHaveBeenCalled();
    });
});

describe('uploadFileInChunks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should upload file in chunks with progress updates', async () => {
        const mockFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.txt', { type: 'text/plain' });
        Object.defineProperty(mockFile, 'size', { value: 50 * 1024 * 1024 }); // 50 MB

        vi.spyOn(uploadFilesService, 'uploadChunk').mockResolvedValue({ message: 'Chunk uploaded' });
        const mockOnProgress = vi.fn();

        await uploadFileInChunks(mockFile, mockOnProgress);

        // 3 MB / 1 MB chunks = 3 chunks
        expect(uploadFilesService.uploadChunk).toHaveBeenCalledTimes(50);
        expect(mockOnProgress).toHaveBeenCalledTimes(50);
    });

    it('should handle file with incomplete last chunk', async () => {
        const mockFile = new File(['x'.repeat(2.5 * 1024 * 1024)], 'partial.txt', { type: 'text/plain' });
        Object.defineProperty(mockFile, 'size', { value: 2.5 * 1024 * 1024 }); // 2.5 MB

        vi.spyOn(uploadFilesService, 'uploadChunk').mockResolvedValue({ message: 'Chunk uploaded' });

        await uploadFileInChunks(mockFile);

        // 2.5 MB / 1 MB = 3 chunks (last one is 0.5 MB)
        expect(uploadFilesService.uploadChunk).toHaveBeenCalledTimes(3);
    });

    it('should upload chunks in correct order', async () => {
        const mockFile = new File(['x'.repeat(3 * 1024 * 1024)], 'ordered.txt', { type: 'text/plain' });
        Object.defineProperty(mockFile, 'size', { value: 3 * 1024 * 1024 });

        vi.spyOn(uploadFilesService, 'uploadChunk').mockResolvedValue({ message: 'Chunk uploaded' });

        await uploadFileInChunks(mockFile);

        expect(uploadFilesService.uploadChunk).toHaveBeenNthCalledWith(1, expect.any(File), 0, 3);
        expect(uploadFilesService.uploadChunk).toHaveBeenNthCalledWith(2, expect.any(File), 1, 3);
        expect(uploadFilesService.uploadChunk).toHaveBeenNthCalledWith(3, expect.any(File), 2, 3);
    });

    it('should preserve file name across all chunks', async () => {
        const fileName = 'important-file.pdf';
        const mockFile = new File(['x'.repeat(2 * 1024 * 1024)], fileName, { type: 'application/pdf' });
        Object.defineProperty(mockFile, 'size', { value: 2 * 1024 * 1024 });

        vi.spyOn(uploadFilesService, 'uploadChunk').mockResolvedValue({ message: 'Chunk uploaded' });

        await uploadFileInChunks(mockFile);

        const calls = vi.mocked(uploadFilesService.uploadChunk).mock.calls;
        for (const call of calls) {
            const chunkFile = call[0];
            expect(chunkFile.name).toBe(fileName);
        }
    });

    it('should work without onProgress callback', async () => {
        const mockFile = new File(['x'.repeat(2 * 1024 * 1024)], 'no-progress.txt', { type: 'text/plain' });
        Object.defineProperty(mockFile, 'size', { value: 2 * 1024 * 1024 });

        vi.spyOn(uploadFilesService, 'uploadChunk').mockResolvedValue({ message: 'Chunk uploaded' });

        await expect(uploadFileInChunks(mockFile)).resolves.not.toThrow();
        expect(uploadFilesService.uploadChunk).toHaveBeenCalledTimes(2);
    });

    it('should handle chunk upload failure', async () => {
        const mockFile = new File(['x'.repeat(2 * 1024 * 1024)], 'fail.txt', { type: 'text/plain' });
        Object.defineProperty(mockFile, 'size', { value: 2 * 1024 * 1024 });

        vi.spyOn(uploadFilesService, 'uploadChunk').mockRejectedValue(new Error('Chunk upload failed'));

        await expect(uploadFileInChunks(mockFile)).rejects.toThrow('Chunk upload failed');
    });

    it('should preserve file type across chunks', async () => {
        const fileType = 'video/mp4';
        const mockFile = new File(['x'.repeat(2 * 1024 * 1024)], 'video.mp4', { type: fileType });
        Object.defineProperty(mockFile, 'size', { value: 2 * 1024 * 1024 });

        vi.spyOn(uploadFilesService, 'uploadChunk').mockResolvedValue({ message: 'Chunk uploaded' });

        await uploadFileInChunks(mockFile);

        const calls = vi.mocked(uploadFilesService.uploadChunk).mock.calls;
        for (const call of calls) {
            const chunkFile = call[0];
            expect(chunkFile.type).toBe(fileType);
        }
    });
});
