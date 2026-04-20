import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

describe('Home Page', () => {
    const renderHome = () =>
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

    test('renders hero heading', () => {
        renderHome();
        expect(screen.getByText(/Bid\. Win\./i)).toBeInTheDocument();
        expect(screen.getByText(/Experience\./i)).toBeInTheDocument();
    });

    test('renders hero description text', () => {
        renderHome();
        expect(screen.getByText(/premier marketplace/i)).toBeInTheDocument();
    });

    test('renders Explore Auctions link', () => {
        renderHome();
        expect(screen.getByText(/Explore Auctions/i)).toBeInTheDocument();
    });

    test('renders Sell a ticket link', () => {
        renderHome();
        expect(screen.getByText(/Sell a ticket/i)).toBeInTheDocument();
    });

    test('renders all three feature cards', () => {
        renderHome();
        expect(screen.getByText('Fair Value Discovery')).toBeInTheDocument();
        expect(screen.getByText('Secure Escrow')).toBeInTheDocument();
        expect(screen.getByText('Exclusive Access')).toBeInTheDocument();
    });

    test('Explore Auctions link points to /auctions', () => {
        renderHome();
        const link = screen.getByText(/Explore Auctions/i).closest('a');
        expect(link).toHaveAttribute('href', '/auctions');
    });

    test('Sell a ticket link points to /sell', () => {
        renderHome();
        const link = screen.getByText(/Sell a ticket/i).closest('a');
        expect(link).toHaveAttribute('href', '/sell');
    });
});
