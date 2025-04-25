// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';

// dotenv.config();

// // Middleware to enforce role-based access
// export const authMiddleware = (allowedRoles) => {
//   return (req, res,next) => {
//     const token = req.cookies.jwt;

//     if (!token) {
//       console.error('No token found.');
//       return res.status(401).json({ message: 'Access denied. No token provided.' });
//     }

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = decoded;

//       // Log decoded token for debugging
//       console.log('Decoded Token:', decoded);

//       // Check if user role is allowed
//       if (!decoded.role || !allowedRoles.includes(decoded.role)) {
//         console.error('Forbidden: Insufficient permissions');
//         return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
//       }

//       next();
//     } catch (error) {
//       console.error('Token Verification Error:', error.message);
//       return res.status(400).json({ message: 'Invalid or expired token.' });
//     }
//   };
// };


import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    let token;

    // Check headers (Bearer) first, then cookies
    if (req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    } else {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Check role (case-sensitive)
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }

      next();
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }
  };
};