import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it('renders with providers', () => {
    const { container } = render(<App />);
    expect(container.querySelector('[class*="MuiBox"]')).toBeInTheDocument();
  });
});
