import { useCallback } from 'react';

interface FileValidationConfig {
    maxSize?: number;
    maxNameLength?: number;
    blockedExtensions?: string[];
}

export interface ValidationResult {
    isValid: boolean;
    errorMessage?: string;
}

export const useFileValidation = (config: FileValidationConfig = {}) => {
    const { maxSize = 10 * 1024 * 1024, maxNameLength = 255 } = config;

    const validateFile = useCallback(
        (file: File): ValidationResult => {
            const fileName = file.name;

            // Check file size
            if (maxSize && file.size > maxSize) {
                return {
                    isValid: false,
                    errorMessage: `File "${fileName}" exceeds the maximum size of ${maxSize} bytes`,
                };
            }

            // Check for overly long names
            if (fileName.length > maxNameLength) {
                return {
                    isValid: false,
                    errorMessage: `File "${fileName}" name is too long (max ${maxNameLength} characters)`,
                };
            }

            // Check for safe naming pattern ([a-zA-Z0-9._-]+)
            const safeNamePattern = /^[\w.-]+$/;
            if (!safeNamePattern.test(fileName)) {
                console.warn(
                    `File "${fileName}" contains invalid characters. Only alphanumeric, dots, underscores, and hyphens are allowed`
                );
                return {
                    isValid: false,
                    errorMessage: `File "${fileName}" contains invalid characters. Only alphanumeric, dots, underscores, and hyphens are allowed`,
                };
            }

            // Check for valid extension: must exist but cannot be executable
            const extensionMatch = fileName.match(/\.([^.]+)$/);
            if (!extensionMatch) {
                console.warn(`File "${fileName}" must have a file extension`);
                return {
                    isValid: false,
                    errorMessage: `File "${fileName}" must have a file extension`,
                };
            }

            const extension = extensionMatch[1].toLowerCase();
            const executableExtensions = ['exe', 'dll', 'bat', 'cmd', 'sh', 'js', 'php', 'py', 'jar'];

            if (executableExtensions.includes(extension)) {
                console.warn(`File "${fileName}" has an executable extension (.${extension}) which is not allowed`);
                return {
                    isValid: false,
                    errorMessage: `File "${fileName}" has an executable extension (.${extension}) which is not allowed`,
                };
            }

            return { isValid: true };
        },
        [maxSize, maxNameLength]
    );

    return validateFile;
};
