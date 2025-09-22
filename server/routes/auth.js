import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { auth } from '../middleware/auth.js'
import { validateRegister, validateLogin, validateRequest } from '../middleware/validation.js'

const router = express.Router()

// Register
router.post('/register', validateRegister, validateRequest, async (req, res) => {
  try {
    const { username, email, password, role } = req.body
    console.log('Registering user:', { username, email, role })

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      })
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: role || 'developer'
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    )

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error during registration' })
  }
})

// Login
router.post('/login', validateLogin, validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    )

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error during login' })
  }
})

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id)

    // Check if username or email already exists (excluding current user)
    if (username !== user.username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: user._id } 
      })
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' })
      }
    }

    if (email !== user.email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: user._id } 
      })
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' })
      }
    }

    // Update basic info
    user.username = username
    user.email = email

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' })
      }

      const isMatch = await user.comparePassword(currentPassword)
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' })
      }

      user.password = newPassword
    }

    await user.save()

    res.json(user.toJSON())
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ message: 'Server error during profile update' })
  }
})

// Logout (client-side only, but we can track it)
router.post('/logout', auth, async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
    res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: 'Server error during logout' })
  }
})

export default router