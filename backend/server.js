const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'null'], // Allow local development
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage (replace with database in production)
let users = [];
let profiles = [];
let sessions = {}; // Store token -> userId mapping
let roles = [
    {
        id: 'Customer',
        name: 'Customer',
        description: 'Find and book services from trusted local businesses',
        icon: 'fas fa-user'
    },
    {
        id: 'BusinessOwner',
        name: 'Business Owner',
        description: 'Manage your business and connect with customers',
        icon: 'fas fa-briefcase'
    },
    {
        id: 'ServiceProvider',
        name: 'Service Provider',
        description: 'Offer your professional services to the community',
        icon: 'fas fa-tools'
    },
    {
        id: 'Wholesaler',
        name: 'Wholesaler',
        description: 'Supply products to businesses and retailers',
        icon: 'fas fa-warehouse'
    }
];

// Middleware to verify authentication
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }

    const userId = sessions[token];
    if (!userId) {
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid or expired token' 
        });
    }

    req.userId = userId;
    req.token = token;
    next();
}

// Routes
app.get('/api/roles', (req, res) => {
    res.json({ success: true, data: roles });
});

app.post('/api/register', (req, res) => {
    try {
        const { email, password, firstName, lastName, phone } = req.body;
        
        // Check if user already exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User already exists with this email' 
            });
        }

        // Create new user
        const newUser = {
            id: uuidv4(),
            email,
            password, // In production, hash this password
            firstName,
            lastName,
            phone,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        // Generate auth token (simple UUID for demo)
        const authToken = uuidv4();
        
        // Store session
        sessions[authToken] = newUser.id;

        res.json({
            success: true,
            message: 'Registration successful',
            token: authToken,
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                phone: newUser.phone,
                profileCompleted: false
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

app.post('/api/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Generate auth token
        const authToken = uuidv4();
        
        // Store session
        sessions[authToken] = user.id;
        
        // Check if user has completed profile
        const profile = profiles.find(p => p.userId === user.id);
        const needsProfileCompletion = !profile;

        res.json({
            success: true,
            message: 'Login successful',
            needsProfileCompletion: needsProfileCompletion,
            token: authToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                profileCompleted: !!profile,
                role: user.role || null,
                uniqueId: user.uniqueId || null
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Get user profile (check if profile exists)
app.get('/api/profile', authenticateToken, (req, res) => {
    try {
        const user = users.find(u => u.id === req.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const profile = profiles.find(p => p.userId === req.userId);

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                profileCompleted: !!profile
            },
            profile: profile || null
        });
    } catch (error) {
        console.error('Profile retrieval error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Complete user profile after role selection
app.post('/api/complete-profile', authenticateToken, (req, res) => {
    try {
        const { role, profileData, businessInitials, userChosenNumber } = req.body;
        
        const user = users.find(u => u.id === req.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Check if user already has a profile
        const existingProfile = profiles.find(p => p.userId === req.userId);
        if (existingProfile) {
            return res.status(400).json({ 
                success: false, 
                message: 'Profile already exists' 
            });
        }

        // Generate unique ID based on role
        let uniqueId;
        if (role === 'BusinessOwner' || role === 'Wholesaler') {
            // Custom format: INITIALS-NUMBER-RANDOM
            const initials = (businessInitials || 'BIZ').toUpperCase();
            const number = String(userChosenNumber || Math.floor(Math.random() * 10000)).padStart(4, '0');
            const random = Math.random().toString(36).substr(2, 6).toUpperCase();
            uniqueId = `${initials}-${number}-${random}`;
        } else {
            // Standard format: ROLE-TIMESTAMP-RANDOM
            const timestamp = Date.now().toString().slice(-8);
            const random = Math.random().toString(36).substr(2, 6).toUpperCase();
            uniqueId = `${role.toUpperCase()}-${timestamp}-${random}`;
        }
        
        const profile = {
            id: uuidv4(),
            userId: req.userId,
            uniqueId,
            role,
            profileData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        profiles.push(profile);
        
        // Update user object
        user.profileCompleted = true;
        user.role = role;
        user.uniqueId = uniqueId;

        console.log('Profile created:', profile);

        res.json({
            success: true,
            message: 'Profile completed successfully',
            token: req.token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                uniqueId: user.uniqueId,
                profileCompleted: true
            },
            profile
        });
    } catch (error) {
        console.error('Profile completion error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});