import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import * as fileUploadUtil from '../../utils/fileUpload';
import { useFileUpload } from '../useFileUpload';

vi.mock('../../utils/fileUpload');

describe('useFileUpload', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with empty state', () => {
        const { result } = renderHook(() => useFileUpload());

        expect(result.current.progress).toEqual({});
        expect(result.current.errors).toEqual({});
        expect(result.current.isUploading).toBe(false);
    });

    it('should upload a single file successfully', async () => {
        const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
        vi.spyOn(fileUploadUtil, 'uploadFile').mockResolvedValue({ message: 'Success' });

        const { result } = renderHook(() => useFileUpload());

        await act(async () => {
            await result.current.uploadFiles([mockFile]);
        });

        expect(fileUploadUtil.uploadFile).toHaveBeenCalledWith(mockFile, expect.any(Function));
        expect(result.current.isUploading).toBe(false);
    });

    it('should track upload progress', async () => {
        const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

        vi.spyOn(fileUploadUtil, 'uploadFile').mockImplementation((file, onProgress) => {
            if (onProgress) {
                onProgress(50);
                onProgress(100);
            }
            return Promise.resolve({ message: 'Success' });
        });

        const { result } = renderHook(() => useFileUpload());

        await act(async () => {
            await result.current.uploadFiles([mockFile]);
        });

        expect(result.current.progress).toHaveProperty('test.txt');
    });

    it('should upload multiple files sequentially', async () => {
        const mockFiles = [
            new File(['content1'], 'file1.txt', { type: 'text/plain' }),
            new File(['content2'], 'file2.txt', { type: 'text/plain' }),
            new File(['content3'], 'file3.txt', { type: 'text/plain' }),
        ];

        vi.spyOn(fileUploadUtil, 'uploadFile').mockResolvedValue({ message: 'Success' });

        const { result } = renderHook(() => useFileUpload());

        await act(async () => {
            await result.current.uploadFiles(mockFiles);
        });

        expect(fileUploadUtil.uploadFile).toHaveBeenCalledTimes(3);
        expect(result.current.isUploading).toBe(false);
    });

    it('should set isUploading to true during upload', async () => {
        const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

        let resolveUpload: () => void;
        const uploadPromise = new Promise<{ message: string }>((resolve) => {
            resolveUpload = () => resolve({ message: 'Success' });
        });

        vi.spyOn(fileUploadUtil, 'uploadFile').mockReturnValue(uploadPromise as Promise<void | { message: string }>);

        const { result } = renderHook(() => useFileUpload());

        act(() => {
            result.current.uploadFiles([mockFile]).catch(() => {});
        });

        expect(result.current.isUploading).toBe(true);

        resolveUpload!();

        await waitFor(() => {
            expect(result.current.isUploading).toBe(false);
        });
    });

    it('should handle upload errors', async () => {
        const mockFile = new File(['content'], 'error.txt', { type: 'text/plain' });
        const uploadError = new Error('Upload failed');

        vi.spyOn(fileUploadUtil, 'uploadFile').mockRejectedValue(uploadError);

        const { result } = renderHook(() => useFileUpload());

        await act(async () => {
            await result.current.uploadFiles([mockFile]);
        });

        expect(result.current.errors).toHaveProperty('error.txt');
        expect(result.current.errors['error.txt']).toBe('Upload failed');
        expect(result.current.isUploading).toBe(false);
    });

    it('should continue uploading after one file fails', async () => {
        const mockFiles = [
            new File(['content1'], 'success.txt', { type: 'text/plain' }),
            new File(['content2'], 'failure.txt', { type: 'text/plain' }),
            new File(['content3'], 'success2.txt', { type: 'text/plain' }),
        ];

        vi.spyOn(fileUploadUtil, 'uploadFile')
            .mockResolvedValueOnce({ message: 'Success' })
            .mockRejectedValueOnce(new Error('Failed'))
            .mockResolvedValueOnce({ message: 'Success' });

        const { result } = renderHook(() => useFileUpload());

        await act(async () => {
            await result.current.uploadFiles(mockFiles);
        });

        expect(fileUploadUtil.uploadFile).toHaveBeenCalledTimes(3);
        expect(result.current.errors).toHaveProperty('failure.txt');
        expect(result.current.isUploading).toBe(false);
    });

    it('should handle non-Error exceptions', async () => {
        const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

        vi.spyOn(fileUploadUtil, 'uploadFile').mockRejectedValue('String error');

        const { result } = renderHook(() => useFileUpload());

        await act(async () => {
            await result.current.uploadFiles([mockFile]);
        });

        expect(result.current.errors['test.txt']).toBe('Upload failed');
    });

    it('should update progress for each file independently', async () => {
        const mockFiles = [
            new File(['content1'], 'file1.txt', { type: 'text/plain' }),
            new File(['content2'], 'file2.txt', { type: 'text/plain' }),
        ];

        vi.spyOn(fileUploadUtil, 'uploadFile').mockImplementation((file, onProgress) => {
            if (onProgress) {
                onProgress(file.name === 'file1.txt' ? 25 : 75);
            }
            return Promise.resolve({ message: 'Success' });
        });

        const { result } = renderHook(() => useFileUpload());

        await act(async () => {
            await result.current.uploadFiles(mockFiles);
        });

        expect(result.current.progress).toHaveProperty('file1.txt');
        expect(result.current.progress).toHaveProperty('file2.txt');
    });

    it('should handle empty file array', async () => {
        const { result } = renderHook(() => useFileUpload());

        await act(async () => {
            await result.current.uploadFiles([]);
        });

        expect(result.current.isUploading).toBe(false);
        expect(result.current.progress).toEqual({});
        expect(result.current.errors).toEqual({});
    });

    it('should accumulate progress across multiple uploads', async () => {
        const mockFile1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
        const mockFile2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });

        vi.spyOn(fileUploadUtil, 'uploadFile').mockImplementation((file, onProgress) => {
            if (onProgress) {
                onProgress(100);
            }
            return Promise.resolve({ message: 'Success' });
        });

        const { result } = renderHook(() => useFileUpload());

        await act(async () => {
            await result.current.uploadFiles([mockFile1]);
        });

        expect(result.current.progress).toHaveProperty('file1.txt');

        await act(async () => {
            await result.current.uploadFiles([mockFile2]);
        });

        expect(result.current.progress).toHaveProperty('file1.txt');
        expect(result.current.progress).toHaveProperty('file2.txt');
    });

    it('should accumulate errors across multiple uploads', async () => {
        const mockFile1 = new File(['content1'], 'error1.txt', { type: 'text/plain' });
        const mockFile2 = new File(['content2'], 'error2.txt', { type: 'text/plain' });

        vi.spyOn(fileUploadUtil, 'uploadFile')
            .mockRejectedValueOnce(new Error('First error'))
            .mockRejectedValueOnce(new Error('Second error'));

        const { result } = renderHook(() => useFileUpload());

        await act(async () => {
            await result.current.uploadFiles([mockFile1]);
        });

        expect(result.current.errors).toHaveProperty('error1.txt');

        await act(async () => {
            await result.current.uploadFiles([mockFile2]);
        });

        expect(result.current.errors).toHaveProperty('error1.txt');
        expect(result.current.errors).toHaveProperty('error2.txt');
    });

    it('should handle large files with progress updates', async () => {
        const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.zip', { type: 'application/zip' });

        vi.spyOn(fileUploadUtil, 'uploadFile').mockImplementation((file, onProgress) => {
            if (onProgress) {
                onProgress(25);
                onProgress(50);
                onProgress(75);
                onProgress(100);
            }
            return Promise.resolve({ message: 'Success' });
        });

        const { result } = renderHook(() => useFileUpload());

        await act(async () => {
            await result.current.uploadFiles([largeFile]);
        });

        expect(result.current.progress).toHaveProperty('large.zip');
        expect(result.current.isUploading).toBe(false);
    });

    it('should provide uploadFiles function reference', () => {
        const { result } = renderHook(() => useFileUpload());

        expect(result.current.uploadFiles).toBeInstanceOf(Function);
    });

    it('should handle files with same content but different names', async () => {
        const mockFiles = [
            new File(['same content'], 'copy1.txt', { type: 'text/plain' }),
            new File(['same content'], 'copy2.txt', { type: 'text/plain' }),
        ];

        vi.spyOn(fileUploadUtil, 'uploadFile').mockImplementation((file, onProgress) => {
            if (onProgress) {
                onProgress(100);
            }
            return Promise.resolve({ message: 'Success' });
        });

        const { result } = renderHook(() => useFileUpload());

        await act(async () => {
            await result.current.uploadFiles(mockFiles);
        });

        expect(result.current.progress).toHaveProperty('copy1.txt');
        expect(result.current.progress).toHaveProperty('copy2.txt');
    });
});
