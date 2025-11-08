import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useFileNameConflictResolution } from '../useFileNameConflictResolution';

describe('useFileNameConflictResolution', () => {
    it('should not modify files when there are no conflicts', () => {
        const existingFiles = new Set(['existing1.txt', 'existing2.pdf']);
        const { result } = renderHook(() => useFileNameConflictResolution(existingFiles));

        const files = [
            new File(['content'], 'new1.txt', { type: 'text/plain' }),
            new File(['content'], 'new2.pdf', { type: 'application/pdf' }),
        ];

        const resolveFileNameConflicts = result.current.resolveFileNameConflicts(files);

        expect(resolveFileNameConflicts).toHaveLength(2);
        expect(resolveFileNameConflicts[0].name).toBe('new1.txt');
        expect(resolveFileNameConflicts[1].name).toBe('new2.pdf');
    });

    it('should rename a single file when it triggers a conflict', () => {
        const existingFiles = new Set(['test.txt']);
        const { result } = renderHook(() => useFileNameConflictResolution(existingFiles));

        const files = [new File(['content'], 'test.txt', { type: 'text/plain' })];

        const resolveFileNameConflicts = result.current.resolveFileNameConflicts(files);

        expect(resolveFileNameConflicts).toHaveLength(1);
        expect(resolveFileNameConflicts[0].name).toBe('test (1).txt');
    });

    it('should rename multiple files with the same name in sequential order', () => {
        const existingFiles = new Set(['file.txt']);
        const { result } = renderHook(() => useFileNameConflictResolution(existingFiles));

        const files = [
            new File(['content1'], 'file.txt', { type: 'text/plain' }),
            new File(['content2'], 'file.txt', { type: 'text/plain' }),
            new File(['content3'], 'file.txt', { type: 'text/plain' }),
        ];

        const resolveFileNameConflicts = result.current.resolveFileNameConflicts(files);

        expect(resolveFileNameConflicts).toHaveLength(3);
        expect(resolveFileNameConflicts[0].name).toBe('file (1).txt');
        expect(resolveFileNameConflicts[1].name).toBe('file (2).txt');
        expect(resolveFileNameConflicts[2].name).toBe('file (3).txt');
    });

    it('should handle files with multiple dots in the name', () => {
        const existingFiles = new Set(['archive.tar.gz']);
        const { result } = renderHook(() => useFileNameConflictResolution(existingFiles));

        const files = [new File(['content'], 'archive.tar.gz', { type: 'application/gzip' })];

        const resolveFileNameConflicts = result.current.resolveFileNameConflicts(files);

        expect(resolveFileNameConflicts).toHaveLength(1);
        expect(resolveFileNameConflicts[0].name).toBe('archive.tar (1).gz');
    });

    it('should skip numbers that already exist', () => {
        const existingFiles = new Set(['file.txt', 'file (1).txt', 'file (2).txt']);
        const { result } = renderHook(() => useFileNameConflictResolution(existingFiles));

        const files = [new File(['content'], 'file.txt', { type: 'text/plain' })];

        const resolveFileNameConflicts = result.current.resolveFileNameConflicts(files);

        expect(resolveFileNameConflicts).toHaveLength(1);
        expect(resolveFileNameConflicts[0].name).toBe('file (3).txt');
    });

    it('should handle mixed scenarios with conflicts and non-conflicts', () => {
        const existingFiles = new Set(['duplicate.txt', 'image.png']);
        const { result } = renderHook(() => useFileNameConflictResolution(existingFiles));

        const files = [
            new File(['content1'], 'unique.txt', { type: 'text/plain' }),
            new File(['content2'], 'duplicate.txt', { type: 'text/plain' }),
            new File(['content3'], 'image.png', { type: 'image/png' }),
            new File(['content4'], 'another.pdf', { type: 'application/pdf' }),
        ];

        const resolveFileNameConflicts = result.current.resolveFileNameConflicts(files);

        expect(resolveFileNameConflicts).toHaveLength(4);
        expect(resolveFileNameConflicts[0].name).toBe('unique.txt');
        expect(resolveFileNameConflicts[1].name).toBe('duplicate (1).txt');
        expect(resolveFileNameConflicts[2].name).toBe('image (1).png');
        expect(resolveFileNameConflicts[3].name).toBe('another.pdf');
    });

    it('should preserve file content and type', () => {
        const existingFiles = new Set(['test.txt']);
        const { result } = renderHook(() => useFileNameConflictResolution(existingFiles));

        const originalContent = 'Hello World';
        const files = [new File([originalContent], 'test.txt', { type: 'text/plain' })];

        const resolveFileNameConflicts = result.current.resolveFileNameConflicts(files);

        expect(resolveFileNameConflicts[0].type).toBe('text/plain');
        expect(resolveFileNameConflicts[0].size).toBe(originalContent.length);
    });

    it('should not mutate the original existing files set', () => {
        const existingFiles = new Set(['test.txt']);
        const originalSize = existingFiles.size;
        const { result } = renderHook(() => useFileNameConflictResolution(existingFiles));

        const files = [new File(['content'], 'test.txt', { type: 'text/plain' })];

        result.current.resolveFileNameConflicts(files);

        expect(existingFiles.size).toBe(originalSize);
        expect(existingFiles.has('test (1).txt')).toBe(false);
    });
});
