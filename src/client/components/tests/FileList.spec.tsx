import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import FileList from '../FileList';

vi.mock('../LoadingIcon', () => ({
    default: () => <div data-testid="loading-icon">Loading...</div>
}));

describe('FileList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('should render and load the component', async () => {
        
        render(<FileList files={[]} isLoading={true} />);
        
        expect(screen.getByText('File List')).toBeInTheDocument();
        expect(screen.getByRole('status', { name: 'Loading files' })).toBeInTheDocument();
        expect(screen.getByTestId('loading-icon')).toBeInTheDocument(); 
    });

    it('should render loading state when isLoading is true', async () => {
        render(<FileList files={[]} isLoading={true} />);
        expect(screen.getByRole('status', { name: 'Loading files' })).toBeInTheDocument();
        expect(screen.getByTestId('loading-icon')).toBeInTheDocument();
    });

    it('should load with no files when isLoading is false and files is empty', async () => {
        const { container } = render(<FileList files={[]} isLoading={false} />);
        
        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });
        
        const noFilesMessage = container.querySelector('p[role="status"]');
        expect(noFilesMessage).toBeInTheDocument();
        expect(noFilesMessage?.textContent).toBe('No files uploaded');
    });

    it('should load with one file', async () => {
        const mockFiles = [
            { name: 'document.pdf', size: 1024 }
        ];
        
        render(<FileList files={mockFiles} isLoading={false} />);
        
        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });
        
        expect(screen.getByText('document.pdf')).toBeInTheDocument();
        
        expect(screen.getByText('1 file uploaded')).toBeInTheDocument();
        
        const fileList = screen.getByRole('list', { name: 'Uploaded files' });
        expect(fileList).toBeInTheDocument();
        expect(fileList.children).toHaveLength(1);
    });

    it('should load with multiple files', async () => {
        const mockFiles = [
            { name: 'document1.pdf', size: 1024 },
            { name: 'document2.txt', size: 2048 },
            { name: 'image.jpg', size: 4096 }
        ];
        
        const { container } = render(<FileList files={mockFiles} isLoading={false} />);
        
        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });
        
        expect(screen.getByText('document1.pdf')).toBeInTheDocument();
        expect(screen.getByText('document2.txt')).toBeInTheDocument();
        expect(screen.getByText('image.jpg')).toBeInTheDocument();
        
        expect(screen.getByText('3 files uploaded')).toBeInTheDocument();
        
        const fileList = container.querySelector('ul[aria-label="Uploaded files"]');
        expect(fileList).toBeInTheDocument();
        expect(fileList?.children).toHaveLength(3);
    });

    it('should load file that shows KB', async () => {
        const mockFiles = [
            { name: 'small-file.txt', size: 5120 } // 5 KB
        ];
        
        render(<FileList files={mockFiles} isLoading={false} />);
        
        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });
        
        expect(screen.getByText('5 KB')).toBeInTheDocument();
        expect(screen.getByLabelText('File size: 5 KB')).toBeInTheDocument();
    });

    it('should load file that shows MB', async () => {
        const mockFiles = [
            { name: 'medium-file.zip', size: 5242880 } // 5 MB
        ];
        
        render(<FileList files={mockFiles} isLoading={false} />);
        
        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });
        
        expect(screen.getByText('5 MB')).toBeInTheDocument();
        expect(screen.getByLabelText('File size: 5 MB')).toBeInTheDocument();
    });

    it('should load file that shows GB', async () => {
        const mockFiles = [
            { name: 'large-file.iso', size: 3221225472 } // 3 GB
        ];
        
        render(<FileList files={mockFiles} isLoading={false} />);
        
        await waitFor(() => {
            expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
        });
        
        expect(screen.getByText('3 GB')).toBeInTheDocument();
        expect(screen.getByLabelText('File size: 3 GB')).toBeInTheDocument();
    });
});

