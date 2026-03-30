const jwt = require('jsonwebtoken');
const { User } = require('../models');
const UserRepository = require('../repositories/UserRepository');

/**
 * Controller — AuthController
 * Handles user registration and login.
 * Business logic extracted from authRoutes.js.
 */
class AuthController {
    
    static generateToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    }

    /**
     * POST /api/auth/register
     */
    static async register(req, res) {
        try {
            const { name, email, password } = req.body;
            const userExists = await UserRepository.findByEmail(email);

            if (userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const user = await UserRepository.create({
                name,
                email,
                passwordHash: password,
                walletBalance: 1000 // Default for testing
            });

            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                walletBalance: user.walletBalance,
                token: AuthController.generateToken(user.id)
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * POST /api/auth/login
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await UserRepository.findByEmail(email);

            if (user && (await user.matchPassword(password))) {
                res.json({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    walletBalance: user.walletBalance,
                    token: AuthController.generateToken(user.id)
                });
            } else {
                res.status(401).json({ message: 'Invalid email or password' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = AuthController;
