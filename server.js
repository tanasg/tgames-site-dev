require('dotenv').config();
const shell = require('shelljs');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const app = express();
const port = process.env.PORT || 5000;

// Kill any process using port 5000 (for Mac/Linux)
shell.exec('lsof -t -i :5000 | xargs kill -9', { silent: true });

// MongoDB connection string from .env file
const mongoUri = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(mongoUri, {
    tls: true
})
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Define User schema and model with additional validation
const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'Username is required'], 
        unique: true, 
        match: [/^[a-zA-Z0-9_-]{4,}$/, 'Username is invalid. Must be at least 4 characters long and contain only letters, numbers, underscores, or hyphens.'] // Alphanumeric, 4+ characters, underscores, or hyphens
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true,
        validate: {
            validator: function (v) {
                return validator.isEmail(v) && /(\.com|\.org|\.edu|\.gov)$/.test(v);
            },
            message: props => `${props.value} is not a valid email! Must end with .com, .org, .edu, or .gov.`
        }
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'], 
        minlength: [6, 'Password must be at least 6 characters long'] // Example length validation
    },
    phoneNumber: { 
        type: String,
        match: [/^\d{10}$/, 'Phone number is invalid'] // Example regex validation: 10-digit phone numbers
    }
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// JWT authentication middleware
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Registration route
app.post('/register', async (req, res) => {
    console.log('Registration data:', req.body); // Log received data
    try {
        const { username, email, password, phoneNumber } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, phoneNumber });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error); // Log the error
        if (error.code === 11000) {
            if (error.keyPattern.username) {
                res.status(400).json({ message: 'Username already exists' });
            } else if (error.keyPattern.email) {
                res.status(400).json({ message: 'Email already exists' });
            }
        } else if (error.errors) {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            res.status(400).json({ message: 'Validation error', errors: validationErrors });
        } else {
            res.status(400).json({ message: 'Error registering user', error: error.message });
        }
    }
});

// Login route
app.post('/login', async (req, res) => {
    console.log('Login data:', req.body); // Log received data
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid password' });
      }
      // Generate JWT
      const token = jwt.sign({ email: user.email, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Error during login:', error); // Log the error
      res.status(400).json({ message: 'Error logging in', error: error.message });
    }
  });

// Home route - protected
app.get('/home', authenticateJWT, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html')); // Serve your home.html file
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});