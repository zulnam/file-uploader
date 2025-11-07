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
                'File "te/st@#$%^&*().txt" contains invalid characters. Only alphanumeric, dots, underscores, and hyphens are allowed',
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
});
