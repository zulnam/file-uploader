import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import FileList from '../FileList';

vi.mock('../LoadingIcon', () => ({
    default: () => <div data-testid="loading-icon">Loading...</div>,
}));

describe('FileList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('should render and load the component', () => {
        render(<FileList files={[]} isLoading={true} uploadProgress={{}} uploadErrors={{}} />);

        expect(screen.getByText('File List')).toBeInTheDocument();
        expect(screen.getByRole('status', { name: 'Loading files' })).toBeInTheDocument();
        expect(screen.getByTestId('loading-icon')).toBeInTheDocument();
    });

    it('should render loading state when isLoading is true', () => {
        render(<FileList files={[]} isLoading={true} uploadProgress={{}} uploadErrors={{}} />);
        expect(screen.getByRole('status', { name: 'Loading files' })).toBeInTheDocument();
        expect(screen.getByTestId('loading-icon')).toBeInTheDocument();
    });

    it('should load with no files when isLoading is false and files is empty', async () => {
        const { container } = render(<FileList files={[]} isLoading={false} uploadProgress={{}} uploadErrors={{}} />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });

        const noFilesMessage = container.querySelector('p[role="status"]');
        expect(noFilesMessage).toBeInTheDocument();
        expect(noFilesMessage?.textContent).toBe('No files uploaded');
    });

    it('should load with one file', async () => {
        const mockFiles = [{ name: 'document.pdf', size: 1024 }];

        render(<FileList files={mockFiles} isLoading={false} uploadProgress={{}} uploadErrors={{}} />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });

        expect(screen.getByText('document.pdf')).toBeInTheDocument();

        expect(screen.getByText('1 file')).toBeInTheDocument();

        const fileList = screen.getByRole('list', { name: 'Files' });
        expect(fileList).toBeInTheDocument();
        expect(fileList.children).toHaveLength(1);
    });

    it('should load with multiple files', async () => {
        const mockFiles = [
            { name: 'document1.pdf', size: 1024 },
            { name: 'document2.txt', size: 2048 },
            { name: 'image.jpg', size: 4096 },
        ];

        const { container } = render(
            <FileList files={mockFiles} isLoading={false} uploadProgress={{}} uploadErrors={{}} />
        );

        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });

        expect(screen.getByText('document1.pdf')).toBeInTheDocument();
        expect(screen.getByText('document2.txt')).toBeInTheDocument();
        expect(screen.getByText('image.jpg')).toBeInTheDocument();

        expect(screen.getByText('3 files')).toBeInTheDocument();

        const fileList = container.querySelector('ul[aria-label="Files"]');
        expect(fileList).toBeInTheDocument();
        expect(fileList?.children).toHaveLength(3);
    });

    it('should load file that shows KB', async () => {
        const mockFiles = [
            { name: 'small-file.txt', size: 5120 }, // 5 KB
        ];

        render(<FileList files={mockFiles} isLoading={false} uploadProgress={{}} uploadErrors={{}} />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });

        expect(screen.getByText('5 KB')).toBeInTheDocument();
        expect(screen.getByLabelText('File size: 5 KB')).toBeInTheDocument();
    });

    it('should load file that shows MB', async () => {
        const mockFiles = [
            { name: 'medium-file.zip', size: 5242880 }, // 5 MB
        ];

        render(<FileList files={mockFiles} isLoading={false} uploadProgress={{}} uploadErrors={{}} />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });

        expect(screen.getByText('5 MB')).toBeInTheDocument();
        expect(screen.getByLabelText('File size: 5 MB')).toBeInTheDocument();
    });

    it('should load file that shows GB', async () => {
        const mockFiles = [
            { name: 'large-file.iso', size: 3221225472 }, // 3 GB
        ];

        render(<FileList files={mockFiles} isLoading={false} uploadProgress={{}} uploadErrors={{}} />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });

        expect(screen.getByText('3 GB')).toBeInTheDocument();
        expect(screen.getByLabelText('File size: 3 GB')).toBeInTheDocument();
    });

    it('should display upload progress for file being uploaded', async () => {
        const mockFiles = [{ name: 'existing.txt', size: 1024 }];
        const mockProgress = { 'uploading.txt': 45 };

        render(<FileList files={mockFiles} isLoading={false} uploadProgress={mockProgress} uploadErrors={{}} />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });

        expect(screen.getByText('uploading.txt')).toBeInTheDocument();
        expect(screen.getByText('45%')).toBeInTheDocument();
    });

    it('should display multiple files being uploaded with their progress', async () => {
        const mockFiles = [{ name: 'existing.txt', size: 1024 }];
        const mockProgress = {
            'upload1.txt': 25,
            'upload2.pdf': 75,
        };

        render(<FileList files={mockFiles} isLoading={false} uploadProgress={mockProgress} uploadErrors={{}} />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });

        expect(screen.getByText('upload1.txt')).toBeInTheDocument();
        expect(screen.getByText('25%')).toBeInTheDocument();
        expect(screen.getByText('upload2.pdf')).toBeInTheDocument();
        expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should not show progress bar for completed uploads', async () => {
        const mockFiles = [{ name: 'completed.txt', size: 1024 }];
        const mockProgress = { 'completed.txt': 100 };

        const { container } = render(
            <FileList files={mockFiles} isLoading={false} uploadProgress={mockProgress} uploadErrors={{}} />
        );

        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });

        expect(screen.getByText('completed.txt')).toBeInTheDocument();
        // Progress bar should not be shown for 100% complete files that are on the server
        const progressBars = container.querySelectorAll('.bg-blue-600');
        expect(progressBars.length).toBe(0);
    });

    it('should display upload errors', async () => {
        const mockFiles = [{ name: 'good.txt', size: 1024 }];
        const mockErrors = { 'failed.txt': 'Upload failed: Network error' };
        const mockProgress = { 'failed.txt': 0 };

        render(
            <FileList files={mockFiles} isLoading={false} uploadProgress={mockProgress} uploadErrors={mockErrors} />
        );

        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });

        expect(screen.getByText('failed.txt')).toBeInTheDocument();
        expect(screen.getByText('Error: Upload failed: Network error')).toBeInTheDocument();
    });

    it('should not show file size for files with 0 bytes', async () => {
        const mockFiles = [{ name: 'empty.txt', size: 0 }];

        render(<FileList files={mockFiles} isLoading={false} uploadProgress={{}} uploadErrors={{}} />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });

        expect(screen.getByText('empty.txt')).toBeInTheDocument();
        // File size should not be displayed for 0 byte files
        expect(screen.queryByText('0 Bytes')).not.toBeInTheDocument();
    });

    it('should show uploading files before server files', async () => {
        const mockFiles = [
            { name: 'server1.txt', size: 1024 },
            { name: 'server2.txt', size: 2048 },
        ];
        const mockProgress = { 'uploading.txt': 50 };

        const { container } = render(
            <FileList files={mockFiles} isLoading={false} uploadProgress={mockProgress} uploadErrors={{}} />
        );

        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });

        const fileList = container.querySelector('ul[aria-label="Files"]');
        const fileItems = fileList?.querySelectorAll('li');

        expect(fileItems).toHaveLength(3);
        // Uploading file should be first
        expect(fileItems?.[0].textContent).toContain('uploading.txt');
    });

    it('should not duplicate files that are both in progress and on server', async () => {
        const mockFiles = [{ name: 'file.txt', size: 1024 }];
        const mockProgress = { 'file.txt': 100 }; // Same file in progress

        const { container } = render(
            <FileList files={mockFiles} isLoading={false} uploadProgress={mockProgress} uploadErrors={{}} />
        );

        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });

        const fileList = container.querySelector('ul[aria-label="Files"]');
        const fileItems = fileList?.querySelectorAll('li');

        // Should only show once (from server)
        expect(fileItems).toHaveLength(1);
    });

    it('should format Bytes correctly for values less than 1 KB', async () => {
        const mockFiles = [{ name: 'tiny.txt', size: 512 }];

        render(<FileList files={mockFiles} isLoading={false} uploadProgress={{}} uploadErrors={{}} />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });

        expect(screen.getByText('512 Bytes')).toBeInTheDocument();
    });

    it('should handle decimal file sizes correctly', async () => {
        const mockFiles = [{ name: 'decimal.txt', size: 1536 }]; // 1.5 KB

        render(<FileList files={mockFiles} isLoading={false} uploadProgress={{}} uploadErrors={{}} />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });

        expect(screen.getByText('1.5 KB')).toBeInTheDocument();
    });

    it('should show progress bar for files being uploaded', async () => {
        const mockProgress = { 'uploading.txt': 33 };
        const { container } = render(
            <FileList files={[]} isLoading={false} uploadProgress={mockProgress} uploadErrors={{}} />
        );

        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });

        const progressBars = container.querySelectorAll('.bg-blue-600');
        expect(progressBars.length).toBeGreaterThan(0);
    });

    it('should not show file size for files being uploaded (size is 0)', async () => {
        const mockProgress = { 'uploading.txt': 50 };

        render(<FileList files={[]} isLoading={false} uploadProgress={mockProgress} uploadErrors={{}} />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });

        expect(screen.getByText('uploading.txt')).toBeInTheDocument();
        expect(screen.queryByText('0 Bytes')).not.toBeInTheDocument();
    });
});
