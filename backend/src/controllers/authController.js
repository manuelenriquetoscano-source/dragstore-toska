import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import BlacklistToken from '../models/BlacklistToken.js';

function generateToken(user) {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { userId: user._id, role: user.role, jti },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  return { token, jti };
}

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'EMAIL_EXISTS', message: 'El email ya está registrado' }
      });
    }

    const user = await User.create({ name, email, password, role });

    const { token } = generateToken(user);

    res.status(201).json({
      success: true,
      data: { user: user.toJSON(), token },
      message: 'Usuario registrado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ 
        success: false, 
        error: { code: 'INVALID_CREDENTIALS', message: 'Email o contraseña incorrectos' }
      });
    }

    if (!user.active) {
      return res.status(401).json({ 
        success: false, 
        error: { code: 'USER_INACTIVE', message: 'Usuario inactivo' }
      });
    }

    const { token } = generateToken(user);

    res.json({
      success: true,
      data: { user: user.toJSON(), token },
      message: 'Inicio de sesión exitoso'
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) updates.password = password;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user,
      message: 'Perfil actualizado'
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const user = req.user;
    const oldJti = req.tokenJti;

    if (oldJti) {
      const decoded = req.tokenDecoded;
      await BlacklistToken.create({
        jti: oldJti,
        expiresAt: new Date(decoded.exp * 1000)
      });
    }

    const { token } = generateToken(user);

    res.json({
      success: true,
      data: { token },
      message: 'Token renovado'
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const jti = req.tokenJti;
    const decoded = req.tokenDecoded;

    if (jti && decoded) {
      await BlacklistToken.create({
        jti,
        expiresAt: new Date(decoded.exp * 1000)
      });
    }

    res.json({
      success: true,
      message: 'Sesión cerrada'
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};
