import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Login from './Login';

/* ---- Mocks ---- */
const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../services/api', () => ({
    authService: {
        login: (...args) => mockLogin(...args),
    },
}));

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderLogin = () => {
        const { MemoryRouter } = require('react-router-dom');
        return render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
    };

    test('renders login form heading', () => {
        renderLogin();
        expect(screen.getByText('Welcome back')).toBeInTheDocument();
    });

    test('renders email and password labels', () => {
        renderLogin();
        expect(screen.getByText('Email address')).toBeInTheDocument();
        expect(screen.getByText('Password')).toBeInTheDocument();
    });

    test('renders sign in button', () => {
        renderLogin();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('renders link to register page', () => {
        renderLogin();
        expect(screen.getByText(/sign up for free/i)).toBeInTheDocument();
    });

    test('successful login navigates to home', async () => {
        const user = userEvent.setup();
        mockLogin.mockResolvedValue({ token: 'test-token' });
        renderLogin();

        const emailInput = document.querySelector('input[name="email"]');
        const passwordInput = document.querySelector('input[name="password"]');
        await user.type(emailInput, 'test@test.com');
        await user.type(passwordInput, 'password123');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'test@test.com',
                password: 'password123',
            });
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    test('failed login shows error alert', async () => {
        const user = userEvent.setup();
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        mockLogin.mockRejectedValue({
            response: { data: { message: 'Invalid email or password' } },
        });
        renderLogin();

        const emailInput = document.querySelector('input[name="email"]');
        const passwordInput = document.querySelector('input[name="password"]');
        await user.type(emailInput, 'test@test.com');
        await user.type(passwordInput, 'wrong');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Invalid email or password');
        });

        alertSpy.mockRestore();
    });
});
