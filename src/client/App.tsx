import { type ReactElement, useCallback } from 'react';

import FileList from './components/FileList';
import FileUploader from './components/FileUploader';
import { useFileList } from './hooks/useFileList';
import { useFileNameConflictResolution } from './hooks/useFileNameConflictResolution';
import { useFileUpload } from './hooks/useFileUpload';
import { useFileValidation } from './hooks/useFileValidation';

export const App = (): ReactElement => {
    // its clear that the App component is doing a bit of prop drilling
    // however for the scope of this demo, i believe it's fine
    // for more complex apps we could use React Context or a state mangement library
    const { files, fileNameSet, isLoading, refetch } = useFileList();
    const { uploadFiles, progress, errors } = useFileUpload();
    const { resolveFileNameConflicts } = useFileNameConflictResolution(fileNameSet);

    const handleFilesSelected = useCallback(
        async (selectedFiles: File[]) => {
            const resolvedFileNames = resolveFileNameConflicts(selectedFiles);
            await uploadFiles(resolvedFileNames);
            refetch();
        },
        [resolveFileNameConflicts, uploadFiles, refetch]
    );

    return (
        <main className="relative isolate h-dvh">
            <img
                src="https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoid2VhcmVcL2FjY291bnRzXC82ZVwvNDAwMDM4OFwvcHJvamVjdHNcLzk4NFwvYXNzZXRzXC9iOFwvMTE1MjY1XC8xMjYwMTU0YzFhYmVmMDVjNjZlY2Q2MDdmMTRhZTkxNS0xNjM4MjU4MjQwLmpwZyJ9:weare:_kpZgwnGPTxOhYxIyfS1MhuZmxGrFCzP6ZW6dc-F6BQ?width=2400"
                alt="background image"
                aria-hidden="true"
                className="absolute inset-0 -z-10 h-full w-full object-cover object-top"
            />

            <div className="mx-auto max-w-7xl px-6 py-32 text-center sm:py-40 lg:px-8">
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-800 sm:text-5xl">Hello there</h1>
                <p className="mt-4 text-base text-gray-900 sm:mt-6">
                    Everything brand starts small, let&apos;s build something great.
                </p>
            </div>
            <div className="mx-auto max-w-3xl px-6 py-32 text-center lg:px-8 rounded-lg shadow-lg bg-white">
                <FileUploader
                    onFilesSelected={handleFilesSelected}
                    validationMethod={useFileValidation({ maxSize: 100 * 1024 * 1024 })} // 100 MB
                />
                <FileList files={files} isLoading={isLoading} uploadProgress={progress} uploadErrors={errors} />
            </div>
        </main>
    );
};
