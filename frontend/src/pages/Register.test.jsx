import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Register from './Register';

/* ---- Mocks ---- */
const mockNavigate = vi.fn();
const mockRegister = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../services/api', () => ({
    authService: {
        register: (...args) => mockRegister(...args),
    },
}));

describe('Register Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderRegister = () => {
        const { MemoryRouter } = require('react-router-dom');
        return render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
    };

    test('renders registration form heading', () => {
        renderRegister();
        expect(screen.getByText('Create an account')).toBeInTheDocument();
    });

    test('renders name, email, and password labels', () => {
        renderRegister();
        expect(screen.getByText('Full Name')).toBeInTheDocument();
        expect(screen.getByText('Email address')).toBeInTheDocument();
        expect(screen.getByText('Password')).toBeInTheDocument();
    });

    test('renders create account button', () => {
        renderRegister();
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    test('renders link to login page', () => {
        renderRegister();
        expect(screen.getByText(/sign in here/i)).toBeInTheDocument();
    });

    test('successful registration navigates to home', async () => {
        const user = userEvent.setup();
        mockRegister.mockResolvedValue({ token: 'new-token' });
        renderRegister();

        const nameInput = document.querySelector('input[name="name"]');
        const emailInput = document.querySelector('input[name="email"]');
        const passwordInput = document.querySelector('input[name="password"]');
        await user.type(nameInput, 'Alice');
        await user.type(emailInput, 'alice@test.com');
        await user.type(passwordInput, 'password123');
        await user.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith({
                name: 'Alice',
                email: 'alice@test.com',
                password: 'password123',
            });
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    test('failed registration shows error alert', async () => {
        const user = userEvent.setup();
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        mockRegister.mockRejectedValue({
            response: { data: { message: 'User already exists' } },
        });
        renderRegister();

        const nameInput = document.querySelector('input[name="name"]');
        const emailInput = document.querySelector('input[name="email"]');
        const passwordInput = document.querySelector('input[name="password"]');
        await user.type(nameInput, 'Alice');
        await user.type(emailInput, 'alice@test.com');
        await user.type(passwordInput, 'password123');
        await user.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('User already exists');
        });

        alertSpy.mockRestore();
    });
});
