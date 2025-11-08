import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';

import FileUploader from '../FileUploader';

describe('FileUploader', () => {
    afterEach(() => {
        cleanup();
    });

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

    it('should handle successful validationMethod result', () => {
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

    it('should handle validationMethod result with error message', () => {
        const mockOnFilesSelected = vi.fn();
        render(
            <FileUploader
                onFilesSelected={mockOnFilesSelected}
                validationMethod={() => ({ isValid: false, errorMessage: 'File is too large' })}
            />
        );

        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const inputs = screen.getAllByTestId('file-input');
        const input = inputs[inputs.length - 1] as HTMLInputElement;

        fireEvent.change(input, {
            target: { files: [file] },
        });

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('File is too large')).toBeInTheDocument();
        expect(mockOnFilesSelected).not.toHaveBeenCalled();
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

    it('should trigger file input on Enter key press', () => {
        const mockOnFilesSelected = vi.fn();
        const { container } = render(<FileUploader onFilesSelected={mockOnFilesSelected} />);

        const uploadButton = container.querySelector(
            'div[role="button"][aria-label="Upload files by clicking or dragging and dropping"]'
        ) as HTMLDivElement;

        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        const clickSpy = vi.spyOn(fileInput, 'click');

        fireEvent.keyDown(uploadButton, { key: 'Enter' });

        expect(clickSpy).toHaveBeenCalled();
        clickSpy.mockRestore();
    });

    it('should trigger file input on Space key press', () => {
        const mockOnFilesSelected = vi.fn();
        const { container } = render(<FileUploader onFilesSelected={mockOnFilesSelected} />);

        const uploadButton = container.querySelector(
            'div[role="button"][aria-label="Upload files by clicking or dragging and dropping"]'
        ) as HTMLDivElement;

        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        const clickSpy = vi.spyOn(fileInput, 'click');

        fireEvent.keyDown(uploadButton, { key: ' ' });

        expect(clickSpy).toHaveBeenCalled();
        clickSpy.mockRestore();
    });

    it('should not trigger file input on other key presses', () => {
        const mockOnFilesSelected = vi.fn();
        const { container } = render(<FileUploader onFilesSelected={mockOnFilesSelected} />);

        const uploadButton = container.querySelector(
            'div[role="button"][aria-label="Upload files by clicking or dragging and dropping"]'
        ) as HTMLDivElement;

        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        const clickSpy = vi.spyOn(fileInput, 'click');

        fireEvent.keyDown(uploadButton, { key: 'a' });
        fireEvent.keyDown(uploadButton, { key: 'Escape' });
        fireEvent.keyDown(uploadButton, { key: 'Tab' });

        expect(clickSpy).not.toHaveBeenCalled();
        clickSpy.mockRestore();
    });

    it('should handle empty file selection (no files chosen)', () => {
        const mockOnFilesSelected = vi.fn();
        render(<FileUploader onFilesSelected={mockOnFilesSelected} />);

        const inputs = screen.getAllByTestId('file-input');
        const input = inputs[inputs.length - 1] as HTMLInputElement;

        fireEvent.change(input, {
            target: { files: [] },
        });

        expect(mockOnFilesSelected).not.toHaveBeenCalled();
    });

    it('should handle drag and drop with multiple files', () => {
        const mockOnFilesSelected = vi.fn();
        const { container } = render(<FileUploader onFilesSelected={mockOnFilesSelected} />);

        const uploadButton = container.querySelector(
            'div[role="button"][aria-label="Upload files by clicking or dragging and dropping"]'
        ) as HTMLDivElement;

        const files = [
            new File(['content1'], 'file1.txt', { type: 'text/plain' }),
            new File(['content2'], 'file2.txt', { type: 'text/plain' }),
            new File(['content3'], 'file3.pdf', { type: 'application/pdf' }),
        ];

        fireEvent.drop(uploadButton, {
            dataTransfer: {
                files,
            },
        });

        expect(mockOnFilesSelected).toHaveBeenCalledWith(files);
    });

    it('should stop validation on first invalid file in multiple file selection', () => {
        const mockOnFilesSelected = vi.fn();
        const mockValidation = vi.fn();
        mockValidation
            .mockReturnValueOnce({ isValid: true })
            .mockReturnValueOnce({ isValid: false, errorMessage: 'Invalid file' });

        render(<FileUploader onFilesSelected={mockOnFilesSelected} validationMethod={mockValidation} />);

        const files = [
            new File(['test1'], 'valid.txt', { type: 'text/plain' }),
            new File(['test2'], 'invalid.txt', { type: 'text/plain' }),
            new File(['test3'], 'notchecked.txt', { type: 'text/plain' }),
        ];
        const inputs = screen.getAllByTestId('file-input');
        const input = inputs[inputs.length - 1] as HTMLInputElement;

        fireEvent.change(input, {
            target: { files },
        });

        expect(mockValidation).toHaveBeenCalledTimes(2);
        expect(mockOnFilesSelected).not.toHaveBeenCalled();
        expect(screen.getByText('Invalid file')).toBeInTheDocument();
    });

    it('should display default validation error message when none provided', () => {
        const mockOnFilesSelected = vi.fn();
        render(<FileUploader onFilesSelected={mockOnFilesSelected} validationMethod={() => ({ isValid: false })} />);

        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const inputs = screen.getAllByTestId('file-input');
        const input = inputs[inputs.length - 1] as HTMLInputElement;

        fireEvent.change(input, {
            target: { files: [file] },
        });

        expect(screen.getByText('Validation failed')).toBeInTheDocument();
    });

    it('should handle click to open file dialog', () => {
        const mockOnFilesSelected = vi.fn();
        const { container } = render(<FileUploader onFilesSelected={mockOnFilesSelected} />);

        const uploadButton = container.querySelector(
            'div[role="button"][aria-label="Upload files by clicking or dragging and dropping"]'
        ) as HTMLDivElement;

        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        const clickSpy = vi.spyOn(fileInput, 'click');

        fireEvent.click(uploadButton);

        expect(clickSpy).toHaveBeenCalled();
        clickSpy.mockRestore();
    });

    it('should have proper accessibility attributes', () => {
        const { container } = render(<FileUploader onFilesSelected={() => {}} />);

        const uploadButton = container.querySelector('div[role="button"]');
        const fileInput = screen.getByLabelText('Click here to upload files or drag and drop them here');

        expect(uploadButton).toHaveAttribute('tabIndex', '0');
        expect(uploadButton).toHaveAttribute('aria-label', 'Upload files by clicking or dragging and dropping');
        expect(fileInput).toHaveAttribute('type', 'file');
        expect(fileInput).toHaveAttribute('multiple');
    });
});
