import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useFileValidation } from '../useFileValidation';

describe('useFileValidation', () => {
    it('should return a function', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        expect(validationMethod).toBeInstanceOf(Function);
    });

    it('should return a validation result', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const validationResult = validationMethod(file);
        expect(validationResult).toEqual({ isValid: true });
    });

    it('should return a validation result with an error message for file size', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        Object.defineProperty(file, 'size', { value: 10485761 });
        const validationResult = validationMethod(file);
        expect(validationResult).toEqual({
            isValid: false,
            errorMessage: 'File "test.txt" exceeds the maximum size of 10485760 bytes',
        });
    });

    it('should return a validation result with an error message for file name length', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const file = new File(
            ['test'],
            'aaaaaaaaaafRYVuOZbOnOmEQvLfKAeP0fh6ez7_sxBRB97f1KqB8o9wC0M4f0DRchgveI-Nq5N9feSB1R0gDzVYCHkvvjw.igNnyDOSdbX-JsPxaxXKjJu2SiENNPh87Ha4j-4dGS8gNdjJ0uVIg2SJCnxvig6UN7M._2GAx0F4elrujUgvga4ST4dBp0_KcQIuAxb_EmAEEtldEnzMVXUSnWGF6hfhvm1hzpsCL8Fe7DQZ.3NOBgpL-FyZ1MyYtaj.txt',
            { type: 'text/plain' }
        );
        const validationResult = validationMethod(file);
        expect(validationResult).toEqual({
            isValid: false,
            errorMessage:
                'File "aaaaaaaaaafRYVuOZbOnOmEQvLfKAeP0fh6ez7_sxBRB97f1KqB8o9wC0M4f0DRchgveI-Nq5N9feSB1R0gDzVYCHkvvjw.igNnyDOSdbX-JsPxaxXKjJu2SiENNPh87Ha4j-4dGS8gNdjJ0uVIg2SJCnxvig6UN7M._2GAx0F4elrujUgvga4ST4dBp0_KcQIuAxb_EmAEEtldEnzMVXUSnWGF6hfhvm1hzpsCL8Fe7DQZ.3NOBgpL-FyZ1MyYtaj.txt" name is too long (max 255 characters)',
        });
    });

    it('should return a validation result with an error message for invalid characters', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const file = new File(['test'], 'te/st@#$%^&*().txt', { type: 'text/plain' });
        const validationResult = validationMethod(file);
        expect(validationResult).toEqual({
            isValid: false,
            errorMessage:
                'File "te/st@#$%^&*().txt" contains invalid characters. Only alphanumeric, spaces, dots, underscores, and hyphens are allowed',
        });
    });

    it('should return a validation result with an error message for missing file extension', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const file = new File(['test'], 'test', { type: 'text/plain' });
        const validationResult = validationMethod(file);
        expect(validationResult).toEqual({ isValid: false, errorMessage: 'File "test" must have a file extension' });
    });

    it('should return a validation result with an error message for executable file extension', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const file = new File(['test'], 'test.exe', { type: 'text/plain' });
        const validationResult = validationMethod(file);
        expect(validationResult).toEqual({
            isValid: false,
            errorMessage: 'File "test.exe" has an executable extension (.exe) which is not allowed',
        });
    });

    it('should use custom maxSize when provided', () => {
        const { result } = renderHook(() => useFileValidation({ maxSize: 1024 }));
        const validationMethod = result.current;
        const file = new File(['test'], 'large.txt', { type: 'text/plain' });
        Object.defineProperty(file, 'size', { value: 2048 });
        const validationResult = validationMethod(file);
        expect(validationResult).toEqual({
            isValid: false,
            errorMessage: 'File "large.txt" exceeds the maximum size of 1024 bytes',
        });
    });

    it('should use custom maxNameLength when provided', () => {
        const { result } = renderHook(() => useFileValidation({ maxNameLength: 10 }));
        const validationMethod = result.current;
        const file = new File(['test'], 'verylongfilename.txt', { type: 'text/plain' });
        const validationResult = validationMethod(file);
        expect(validationResult).toEqual({
            isValid: false,
            errorMessage: 'File "verylongfilename.txt" name is too long (max 10 characters)',
        });
    });

    it('should validate files at exact maxSize', () => {
        const { result } = renderHook(() => useFileValidation({ maxSize: 1024 }));
        const validationMethod = result.current;
        const file = new File(['test'], 'exact.txt', { type: 'text/plain' });
        Object.defineProperty(file, 'size', { value: 1024 });
        const validationResult = validationMethod(file);
        expect(validationResult).toEqual({ isValid: true });
    });

    it('should validate files at exact maxNameLength', () => {
        const { result } = renderHook(() => useFileValidation({ maxNameLength: 8 }));
        const validationMethod = result.current;
        const file = new File(['test'], 'test.txt', { type: 'text/plain' }); // exactly 8 characters
        const validationResult = validationMethod(file);
        expect(validationResult).toEqual({ isValid: true });
    });

    it('should reject all executable extensions - dll', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const file = new File(['test'], 'library.dll', { type: 'application/octet-stream' });
        const validationResult = validationMethod(file);
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errorMessage).toContain('.dll');
    });

    it('should reject all executable extensions - bat', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const file = new File(['test'], 'script.bat', { type: 'application/bat' });
        const validationResult = validationMethod(file);
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errorMessage).toContain('.bat');
    });

    it('should reject all executable extensions - cmd', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const file = new File(['test'], 'command.cmd', { type: 'application/cmd' });
        const validationResult = validationMethod(file);
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errorMessage).toContain('.cmd');
    });

    it('should reject all executable extensions - sh', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const file = new File(['test'], 'script.sh', { type: 'application/x-sh' });
        const validationResult = validationMethod(file);
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errorMessage).toContain('.sh');
    });

    it('should reject all executable extensions - js', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const file = new File(['test'], 'script.js', { type: 'application/javascript' });
        const validationResult = validationMethod(file);
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errorMessage).toContain('.js');
    });

    it('should reject all executable extensions - php', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const file = new File(['test'], 'index.php', { type: 'application/php' });
        const validationResult = validationMethod(file);
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errorMessage).toContain('.php');
    });

    it('should reject all executable extensions - py', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const file = new File(['test'], 'script.py', { type: 'text/x-python' });
        const validationResult = validationMethod(file);
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errorMessage).toContain('.py');
    });

    it('should reject all executable extensions - jar', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const file = new File(['test'], 'application.jar', { type: 'application/java-archive' });
        const validationResult = validationMethod(file);
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errorMessage).toContain('.jar');
    });

    it('should handle files with multiple dots in name', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const file = new File(['test'], 'my.file.name.txt', { type: 'text/plain' });
        const validationResult = validationMethod(file);
        expect(validationResult).toEqual({ isValid: true });
    });

    it('should be case insensitive for extensions', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const file = new File(['test'], 'script.EXE', { type: 'application/octet-stream' });
        const validationResult = validationMethod(file);
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errorMessage).toContain('.exe');
    });

    it('should allow valid file types', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const validFiles = [
            new File(['test'], 'document.pdf', { type: 'application/pdf' }),
            new File(['test'], 'image.png', { type: 'image/png' }),
            new File(['test'], 'data.json', { type: 'application/json' }),
            new File(['test'], 'video.mp4', { type: 'video/mp4' }),
            new File(['test'], 'archive.zip', { type: 'application/zip' }),
        ];

        for (const file of validFiles) {
            const result = validationMethod(file);
            expect(result.isValid).toBe(true);
        }
    });

    it('should allow files with spaces in names', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const file = new File(['test'], 'my file name.txt', { type: 'text/plain' });
        const validationResult = validationMethod(file);
        expect(validationResult).toEqual({ isValid: true });
    });

    it('should allow files with underscores and hyphens', () => {
        const { result } = renderHook(() => useFileValidation());
        const validationMethod = result.current;
        const file = new File(['test'], 'my_file-name.txt', { type: 'text/plain' });
        const validationResult = validationMethod(file);
        expect(validationResult).toEqual({ isValid: true });
    });
});
