import { useCallback } from 'react';

interface FileValidationConfig {
    maxSize?: number;
    maxNameLength?: number;
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

            if (maxSize && file.size > maxSize) {
                return {
                    isValid: false,
                    errorMessage: `File "${fileName}" exceeds the maximum size of ${maxSize} bytes`,
                };
            }

            if (fileName.length > maxNameLength) {
                return {
                    isValid: false,
                    errorMessage: `File "${fileName}" name is too long (max ${maxNameLength} characters)`,
                };
            }

            const extensionMatch = fileName.match(/\.([^.]+)$/);
            if (!extensionMatch) {
                // ideally this would be logged to a error tracking service like Sentry or Rollbar
                // but for the purpose of this demo, we'll just log it to the console
                console.warn(`File "${fileName}" must have a file extension`);
                return {
                    isValid: false,
                    errorMessage: `File "${fileName}" must have a file extension`,
                };
            }

            const extension = extensionMatch[1].toLowerCase();
            const executableExtensions = ['exe', 'dll', 'bat', 'cmd', 'sh', 'js', 'php', 'py', 'jar'];

            if (executableExtensions.includes(extension)) {
                // ideally this would be logged to a error tracking service like Sentry or Rollbar
                // but for the purpose of this demo, we'll just log it to the console
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
