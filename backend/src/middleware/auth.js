// Simple authentication middleware (can be enhanced with JWT later)

// Authentication middleware - requires valid user
export const requireAuth = (req, res, next) => {
  // For now, simulate an authenticated admin user
  // In production, this would verify JWT token
  req.user = { userId: 1, username: 'admin', role: 'ADMIN' };
  next();
};

// Optional authentication middleware - adds user info if available
export const optionalAuth = (req, res, next) => {
  // For now, no authentication required for public endpoints
  req.user = null;
  next();
};

// Admin authorization middleware - requires admin role
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Owner or admin authorization middleware
export const requireOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const resourceUserId = parseInt(req.params.userId) || parseInt(req.body.userId);
  
  if (req.user.role === 'ADMIN' || req.user.userId === resourceUserId) {
    next();
  } else {
    return res.status(403).json({ error: 'Access denied' });
  }
};
