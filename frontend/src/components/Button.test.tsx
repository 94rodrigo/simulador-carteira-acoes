import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Button from './Button';

describe('Button component', () => {
    it('renders correctly', () => {
        const { getByText } = render(<Button label="Click me" />);
        expect(getByText('Click me')).toBeInTheDocument();
    });
    
    it('handles click events', async () => {
        const handleClick = vi.fn();
        const { getByText } = render(<Button label="Click me" onClick={handleClick} />);
        await fireEvent.click(getByText('Click me'));
        expect(handleClick).toHaveBeenCalled();
    });
});