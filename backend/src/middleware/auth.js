import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import BlacklistToken from '../models/BlacklistToken.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: { code: 'NO_TOKEN', message: 'Token no proporcionado' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.jti) {
      const blacklisted = await BlacklistToken.findOne({ jti: decoded.jti });
      if (blacklisted) {
        return res.status(401).json({
          success: false,
          error: { code: 'TOKEN_REVOKED', message: 'Token revocado' }
        });
      }
    }

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' }
      });
    }

    req.user = user;
    req.tokenJti = decoded.jti;
    req.tokenDecoded = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: { code: 'INVALID_TOKEN', message: 'Token inválido' }
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: { code: 'FORBIDDEN', message: 'No tienes permisos para esta acción' }
      });
    }
    next();
  };
};
