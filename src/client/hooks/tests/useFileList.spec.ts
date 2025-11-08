import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import * as getFilesService from '../../services/getFiles';
import { useFileList } from '../useFileList';

vi.mock('../../services/getFiles');

describe('useFileList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with loading state', () => {
        vi.spyOn(getFilesService, 'getFiles').mockImplementation(
            () => new Promise(() => {}) // Never resolves
        );

        const { result } = renderHook(() => useFileList());

        expect(result.current.isLoading).toBe(true);
        expect(result.current.files).toEqual([]);
    });

    it('should fetch files on mount', async () => {
        const mockFiles = [
            { name: 'file1.txt', size: 1024 },
            { name: 'file2.pdf', size: 2048 },
        ];

        vi.spyOn(getFilesService, 'getFiles').mockResolvedValue(mockFiles);

        const { result } = renderHook(() => useFileList());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.files).toEqual(mockFiles);
        expect(getFilesService.getFiles).toHaveBeenCalledTimes(1);
    });

    it('should handle empty file list', async () => {
        vi.spyOn(getFilesService, 'getFiles').mockResolvedValue([]);

        const { result } = renderHook(() => useFileList());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.files).toEqual([]);
    });

    it('should handle fetch errors', async () => {
        const mockError = new Error('Failed to fetch files');
        vi.spyOn(getFilesService, 'getFiles').mockRejectedValue(mockError);
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() => useFileList());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.files).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch files:', mockError);

        consoleErrorSpy.mockRestore();
    });

    it('should set loading state during fetch', async () => {
        const mockFiles = [{ name: 'test.txt', size: 100 }];

        let resolvePromise: (value: { name: string; size: number }[]) => void;
        const promise = new Promise((resolve) => {
            resolvePromise = resolve;
        });

        vi.spyOn(getFilesService, 'getFiles').mockReturnValue(promise as Promise<{ name: string; size: number }[]>);

        const { result } = renderHook(() => useFileList());

        expect(result.current.isLoading).toBe(true);

        resolvePromise!(mockFiles);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.files).toEqual(mockFiles);
    });

    it('should provide refetch function', async () => {
        const mockFiles = [{ name: 'initial.txt', size: 100 }];
        vi.spyOn(getFilesService, 'getFiles').mockResolvedValue(mockFiles);

        const { result } = renderHook(() => useFileList());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.refetch).toBeInstanceOf(Function);
    });

    it('should refetch files when refetch is called', async () => {
        const initialFiles = [{ name: 'initial.txt', size: 100 }];
        const updatedFiles = [
            { name: 'initial.txt', size: 100 },
            { name: 'new.txt', size: 200 },
        ];

        vi.spyOn(getFilesService, 'getFiles').mockResolvedValueOnce(initialFiles).mockResolvedValueOnce(updatedFiles);

        const { result } = renderHook(() => useFileList());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.files).toEqual(initialFiles);

        result.current.refetch();

        await waitFor(() => {
            expect(result.current.files).toEqual(updatedFiles);
        });
        expect(getFilesService.getFiles).toHaveBeenCalledTimes(2);
    });

    it('should set loading state when refetching', async () => {
        const mockFiles = [{ name: 'test.txt', size: 100 }];

        let resolveFirstFetch: (value: { name: string; size: number }[]) => void;
        let resolveSecondFetch: (value: { name: string; size: number }[]) => void;

        const firstPromise = new Promise((resolve) => {
            resolveFirstFetch = resolve;
        });
        const secondPromise = new Promise((resolve) => {
            resolveSecondFetch = resolve;
        });

        vi.spyOn(getFilesService, 'getFiles')
            .mockReturnValueOnce(firstPromise as Promise<{ name: string; size: number }[]>)
            .mockReturnValueOnce(secondPromise as Promise<{ name: string; size: number }[]>);

        const { result } = renderHook(() => useFileList());

        expect(result.current.isLoading).toBe(true);

        resolveFirstFetch!(mockFiles);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        result.current.refetch();

        await waitFor(() => {
            expect(result.current.isLoading).toBe(true);
        });

        resolveSecondFetch!(mockFiles);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
    });

    it('should handle network errors gracefully', async () => {
        const networkError = new Error('Network timeout');
        vi.spyOn(getFilesService, 'getFiles').mockRejectedValue(networkError);
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() => useFileList());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.files).toEqual([]);
        expect(result.current.isLoading).toBe(false);

        consoleErrorSpy.mockRestore();
    });

    it('should handle large file lists', async () => {
        const largeFileList = Array.from({ length: 100 }, (_, i) => ({
            name: `file${i}.txt`,
            size: i * 1024,
        }));

        vi.spyOn(getFilesService, 'getFiles').mockResolvedValue(largeFileList);

        const { result } = renderHook(() => useFileList());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.files).toEqual(largeFileList);
        expect(result.current.files).toHaveLength(100);
    });

    it('should handle refetch errors', async () => {
        const initialFiles = [{ name: 'initial.txt', size: 100 }];
        const refetchError = new Error('Refetch failed');

        vi.spyOn(getFilesService, 'getFiles').mockResolvedValueOnce(initialFiles).mockRejectedValueOnce(refetchError);
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() => useFileList());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.files).toEqual(initialFiles);

        result.current.refetch();

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.files).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch files:', refetchError);

        consoleErrorSpy.mockRestore();
    });
});
