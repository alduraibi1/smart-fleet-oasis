
import { describe, it, expect } from 'vitest';
import { render, screen } from './test-utils';
import App from '../App';
import { BrowserRouter } from 'react-router-dom';

describe('Smoke Tests', () => {
  it('renders app without crashing', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });

  it('displays welcome message for unauthenticated users', async () => {
    render(<App />);
    // Should show welcome screen since no user is authenticated
    expect(screen.getByText(/CarRent Pro/i)).toBeInTheDocument();
  });

  it('handles navigation without errors', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    // App should render without throwing navigation errors
    expect(document.body).toBeInTheDocument();
  });
});
