import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import FileUploader from '../FileUploader';

describe('FileUploader', () => {
    it('should render the file uploader', () => {
        render(<FileUploader onFilesSelected={() => {}} />);
        expect(screen.getByLabelText('Upload files by clicking or dragging and dropping')).toBeInTheDocument();
    });

    it('should handle onFilesSelected method with one file', () => {
        const mockOnFilesSelected = vi.fn();
        render(<FileUploader onFilesSelected={mockOnFilesSelected} />);

        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const inputs = screen.getAllByTestId('file-input');
        const input = inputs[inputs.length - 1] as HTMLInputElement;

        fireEvent.change(input, {
            target: { files: [file] },
        });

        expect(mockOnFilesSelected).toHaveBeenCalledWith([file]);
        expect(mockOnFilesSelected).toHaveBeenCalledTimes(1);
    });

    it('should handle onFilesSelected method with multiple files', () => {
        const mockOnFilesSelected = vi.fn();
        render(<FileUploader onFilesSelected={mockOnFilesSelected} />);

        const files = [
            new File(['test'], 'test.txt', { type: 'text/plain' }),
            new File(['test'], 'test.txt', { type: 'text/plain' }),
        ];
        const inputs = screen.getAllByTestId('file-input');
        const input = inputs[inputs.length - 1] as HTMLInputElement;

        fireEvent.change(input, {
            target: { files },
        });

        expect(mockOnFilesSelected).toHaveBeenCalledWith(files);
        expect(mockOnFilesSelected).toHaveBeenCalledTimes(1);
    });

    it('should handle validationMethod method with one file', () => {
        const mockOnFilesSelected = vi.fn();
        render(<FileUploader onFilesSelected={mockOnFilesSelected} validationMethod={() => ({ isValid: true })} />);

        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const inputs = screen.getAllByTestId('file-input');
        const input = inputs[inputs.length - 1] as HTMLInputElement;

        fireEvent.change(input, {
            target: { files: [file] },
        });

        expect(mockOnFilesSelected).toHaveBeenCalledWith([file]);
        expect(mockOnFilesSelected).toHaveBeenCalledTimes(1);
    });

    it('should handle validationMethod method with multiple files', () => {
        const mockOnFilesSelected = vi.fn();
        render(<FileUploader onFilesSelected={mockOnFilesSelected} validationMethod={() => ({ isValid: true })} />);

        const files = [
            new File(['test'], 'test.txt', { type: 'text/plain' }),
            new File(['test'], 'test.txt', { type: 'text/plain' }),
        ];
        const inputs = screen.getAllByTestId('file-input');
        const input = inputs[inputs.length - 1] as HTMLInputElement;

        fireEvent.change(input, {
            target: { files },
        });

        expect(mockOnFilesSelected).toHaveBeenCalledWith(files);
        expect(mockOnFilesSelected).toHaveBeenCalledTimes(1);
    });

    it('should handle validationMethod method with one file that is invalid', () => {
        const mockOnFilesSelected = vi.fn();
        render(
            <FileUploader
                onFilesSelected={mockOnFilesSelected}
                validationMethod={() => ({ isValid: false, errorMessage: 'Invalid file' })}
            />
        );

        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const inputs = screen.getAllByTestId('file-input');
        const input = inputs[inputs.length - 1] as HTMLInputElement;

        fireEvent.change(input, {
            target: { files: [file] },
        });

        expect(mockOnFilesSelected).not.toHaveBeenCalled();
        expect(mockOnFilesSelected).toHaveBeenCalledTimes(0);
    });

    it('should apply active styling on drag enter', () => {
        const { container } = render(<FileUploader onFilesSelected={() => {}} />);

        const uploadButton = container.querySelector(
            'div[role="button"][aria-label="Upload files by clicking or dragging and dropping"]'
        ) as HTMLDivElement;

        // Initially should have default border class
        expect(uploadButton).toHaveClass('border-gray-300');
        expect(uploadButton).not.toHaveClass('border-blue-400');
        expect(uploadButton).not.toHaveClass('bg-blue-50');

        // After drag enter, should have active classes
        fireEvent.dragEnter(uploadButton);

        expect(uploadButton).toHaveClass('border-blue-400');
        expect(uploadButton).toHaveClass('bg-blue-50');
        expect(uploadButton).not.toHaveClass('border-gray-300');
    });

    it('should remove active styling on drag leave', () => {
        const { container } = render(<FileUploader onFilesSelected={() => {}} />);

        const uploadButton = container.querySelector(
            'div[role="button"][aria-label="Upload files by clicking or dragging and dropping"]'
        ) as HTMLDivElement;

        // Trigger drag enter first
        fireEvent.dragEnter(uploadButton);
        expect(uploadButton).toHaveClass('border-blue-400');
        expect(uploadButton).toHaveClass('bg-blue-50');

        // Then drag leave should revert to default
        fireEvent.dragLeave(uploadButton);

        expect(uploadButton).toHaveClass('border-gray-300');
        expect(uploadButton).not.toHaveClass('border-blue-400');
        expect(uploadButton).not.toHaveClass('bg-blue-50');
    });

    it('should handle drag over without changing state', () => {
        const { container } = render(<FileUploader onFilesSelected={() => {}} />);

        const uploadButton = container.querySelector(
            'div[role="button"][aria-label="Upload files by clicking or dragging and dropping"]'
        ) as HTMLDivElement;

        // Set to drag state first
        fireEvent.dragEnter(uploadButton);
        expect(uploadButton).toHaveClass('border-blue-400');
        expect(uploadButton).toHaveClass('bg-blue-50');

        // Drag over should maintain the same state
        fireEvent.dragOver(uploadButton);

        expect(uploadButton).toHaveClass('border-blue-400');
        expect(uploadButton).toHaveClass('bg-blue-50');
    });

    it('should revert to normal styling after drop', () => {
        const mockOnFilesSelected = vi.fn();
        const { container } = render(<FileUploader onFilesSelected={mockOnFilesSelected} />);

        const uploadButton = container.querySelector(
            'div[role="button"][aria-label="Upload files by clicking or dragging and dropping"]'
        ) as HTMLDivElement;

        // Set to drag state
        fireEvent.dragEnter(uploadButton);
        expect(uploadButton).toHaveClass('border-blue-400');
        expect(uploadButton).toHaveClass('bg-blue-50');

        // Drop should revert to normal styling
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        fireEvent.drop(uploadButton, {
            dataTransfer: {
                files: [file],
            },
        });

        expect(uploadButton).toHaveClass('border-gray-300');
        expect(uploadButton).not.toHaveClass('border-blue-400');
        expect(uploadButton).not.toHaveClass('bg-blue-50');
        expect(mockOnFilesSelected).toHaveBeenCalledWith([file]);
    });
});
