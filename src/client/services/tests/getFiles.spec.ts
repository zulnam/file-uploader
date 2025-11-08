import axios from 'axios';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { getFiles } from '../getFiles';

vi.mock('axios');

describe('getFiles', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch files successfully', async () => {
        const mockFiles = [
            { name: 'file1.txt', size: 1024 },
            { name: 'file2.pdf', size: 2048 },
        ];

        vi.mocked(axios.get).mockResolvedValue({
            data: { files: mockFiles },
        });

        const result = await getFiles();

        expect(axios.get).toHaveBeenCalledWith('/api/files');
        expect(result).toEqual(mockFiles);
    });

    it('should return empty array when no files exist', async () => {
        vi.mocked(axios.get).mockResolvedValue({
            data: { files: [] },
        });

        const result = await getFiles();

        expect(axios.get).toHaveBeenCalledWith('/api/files');
        expect(result).toEqual([]);
    });

    it('should handle network errors', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const mockError = new Error('Network error');

        vi.mocked(axios.get).mockRejectedValue(mockError);

        await expect(getFiles()).rejects.toThrow('Network error');
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching files:', mockError);

        consoleErrorSpy.mockRestore();
    });

    it('should handle server errors', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const mockError = {
            response: {
                status: 500,
                data: { error: 'Internal server error' },
            },
        };

        vi.mocked(axios.get).mockRejectedValue(mockError);

        await expect(getFiles()).rejects.toEqual(mockError);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching files:', mockError);

        consoleErrorSpy.mockRestore();
    });

    it('should handle malformed response', async () => {
        vi.mocked(axios.get).mockResolvedValue({
            data: { files: [{ name: 'test.txt', size: 500 }] },
        });

        const result = await getFiles();

        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('name');
        expect(result[0]).toHaveProperty('size');
    });

    it('should handle files with various sizes', async () => {
        const mockFiles = [
            { name: 'tiny.txt', size: 0 },
            { name: 'small.txt', size: 1024 },
            { name: 'large.zip', size: 1048576 },
            { name: 'huge.iso', size: 1073741824 },
        ];

        vi.mocked(axios.get).mockResolvedValue({
            data: { files: mockFiles },
        });

        const result = await getFiles();

        expect(result).toEqual(mockFiles);
        expect(result).toHaveLength(4);
    });
});
