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

        res.json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    phone: newUser.phone
                },
                token: authToken
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

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone
                },
                token: authToken
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

app.post('/api/profile', (req, res) => {
    try {
        const { role, ...profileData } = req.body;
        
        // Generate unique ID for the profile
        const uniqueId = `${role.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        const profile = {
            id: uuidv4(),
            uniqueId,
            role,
            ...profileData,
            createdAt: new Date().toISOString()
        };

        // In a real app, you'd save this to a database
        console.log('Profile created:', profile);

        res.json({
            success: true,
            message: 'Profile created successfully',
            data: {
                profile,
                uniqueId
            }
        });
    } catch (error) {
        console.error('Profile creation error:', error);
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