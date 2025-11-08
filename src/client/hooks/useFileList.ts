import { useState, useEffect, useCallback, useMemo } from 'react';

import { getFiles } from '../services/getFiles';

interface FileListState {
    files: { name: string; size: number }[];
    isLoading: boolean;
}

export const useFileList = () => {
    const [state, setState] = useState<FileListState>({
        files: [],
        isLoading: true,
    });

    // I decided to use both array and Set as the Set is faster for lookups but the array is required for UI rendering via map
    // this is a trade off and I'm open to other suggestions
    const fileNameSet = useMemo(() => new Set(state.files.map((f) => f.name)), [state.files]);

    const fetchFiles = useCallback(() => {
        setState((prev) => ({ ...prev, isLoading: true }));

        getFiles()
            .then((files) => {
                setState({ files, isLoading: false });
            })
            .catch((error) => {
                // ideally this would be logged to a error tracking service like Sentry or Rollbar
                // but for the purpose of this demo, we'll just log it to the console
                console.error('Failed to fetch files:', error);
                setState({ files: [], isLoading: false });
            });
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    return { ...state, fileNameSet, refetch: fetchFiles };
};
