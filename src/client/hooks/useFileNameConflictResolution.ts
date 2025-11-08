import { useCallback } from 'react';

export const useFileNameConflictResolution = (existingFileNames: Set<string>) => {
    const resolveFileNameConflicts = useCallback(
        (files: File[]): File[] => {
            const nameTracker = new Set(existingFileNames);

            return files.map((file) => {
                if (!nameTracker.has(file.name)) {
                    nameTracker.add(file.name);
                    return file;
                }

                const lastDotIndex = file.name.lastIndexOf('.');
                const baseName = lastDotIndex > 0 ? file.name.substring(0, lastDotIndex) : file.name;
                const extension = lastDotIndex > 0 ? file.name.substring(lastDotIndex) : '';

                let counter = 1;
                let newName = `${baseName} (${counter})${extension}`;
                while (nameTracker.has(newName)) {
                    counter++;
                    newName = `${baseName} (${counter})${extension}`;
                }

                nameTracker.add(newName);

                return new File([file], newName, { type: file.type });
            });
        },
        [existingFileNames]
    );

    return { resolveFileNameConflicts };
};
