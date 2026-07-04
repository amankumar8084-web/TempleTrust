import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';
import { UnauthorizedError, ForbiddenError } from '../utils/customErrors.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Get token from Authorization header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new UnauthorizedError('You are not logged in. Please log in to gain access.'));
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id).populate('role');
    if (!currentUser) {
      return next(new UnauthorizedError('The user belonging to this token no longer exists.'));
    }

    if (currentUser.status !== 'active') {
      return next(new ForbiddenError('Your account has been suspended or is pending approval.'));
    }

    // 4. Grant access
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

// RBAC Guard by Role Name
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ForbiddenError('You do not have permission to perform this action.'));
    }
    
    const userRole = req.user.role.name;
    if (!roles.includes(userRole) && userRole !== 'Super Admin') {
      return next(new ForbiddenError('You do not have permission to perform this action.'));
    }

    next();
  };
};

// Fine-grained permission checker
export const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ForbiddenError('Permission denied.'));
    }

    const { permissions, name } = req.user.role;
    
    // Super Admin bypass
    if (name === 'Super Admin') {
      return next();
    }

    if (!permissions || !permissions.includes(permission)) {
      return next(new ForbiddenError('You do not have the required permission to perform this action.'));
    }

    next();
  };
};

export const optionalProtect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id).populate('role');
      if (currentUser && currentUser.status === 'active') {
        req.user = currentUser;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

