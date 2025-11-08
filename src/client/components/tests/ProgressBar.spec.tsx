import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ProgressBar from '../ProgressBar';

describe('ProgressBar', () => {
    it('should render with 0% progress', () => {
        const { container } = render(<ProgressBar percentage={0} />);
        const progressBar = container.querySelector('.bg-blue-600');

        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveStyle({ width: '0%' });
    });

    it('should render with 50% progress', () => {
        const { container } = render(<ProgressBar percentage={50} />);
        const progressBar = container.querySelector('.bg-blue-600');

        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveStyle({ width: '50%' });
    });

    it('should render with 100% progress', () => {
        const { container } = render(<ProgressBar percentage={100} />);
        const progressBar = container.querySelector('.bg-blue-600');

        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('should render with fractional percentage', () => {
        const { container } = render(<ProgressBar percentage={33.33} />);
        const progressBar = container.querySelector('.bg-blue-600');

        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveStyle({ width: '33.33%' });
    });

    it('should render progress bar with correct styling', () => {
        const { container } = render(<ProgressBar percentage={25} />);
        const progressBar = container.querySelector('.bg-blue-600');

        expect(progressBar).toHaveClass('bg-blue-600', 'h-2.5', 'rounded-full');
    });
});
