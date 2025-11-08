import { render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, afterEach } from 'vitest';

import LoadingIcon from '../LoadingIcon';

describe('LoadingIcon', () => {
    afterEach(() => {
        cleanup();
    });

    it('should render the loading icon', () => {
        render(<LoadingIcon />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have screen reader text', () => {
        const { container } = render(<LoadingIcon />);
        const screenReaderText = container.querySelector('.sr-only');

        expect(screenReaderText).toBeInTheDocument();
        expect(screenReaderText?.textContent).toBe('Loading...');
    });

    it('should render SVG with proper attributes', () => {
        const { container } = render(<LoadingIcon />);
        const svg = container.querySelector('svg');

        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute('aria-hidden', 'true');
        expect(svg).toHaveClass('animate-spin');
    });

    it('should have proper ARIA attributes for accessibility', () => {
        const { container } = render(<LoadingIcon />);
        const status = screen.getByRole('status');
        const screenReaderText = container.querySelector('.sr-only');

        expect(status).toBeInTheDocument();
        expect(screenReaderText).toBeInTheDocument();
        expect(screenReaderText?.textContent).toBe('Loading...');
    });
});
