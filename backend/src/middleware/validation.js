// Simple validation middleware

// Validate post creation/update data
export const validatePost = (req, res, next) => {
  const { title, content } = req.body;
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (title.length > 200) {
    errors.push({ field: 'title', message: 'Title must not exceed 200 characters' });
  }

  if (!content || content.trim().length === 0) {
    errors.push({ field: 'content', message: 'Content is required' });
  }

  if (req.body.status && !['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(req.body.status.toUpperCase())) {
    errors.push({ field: 'status', message: 'Status must be DRAFT, PUBLISHED, or ARCHIVED' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
  }

  next();
};

// Validate category creation/update data
export const validateCategory = (req, res, next) => {
  const { name } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.length > 100) {
    errors.push({ field: 'name', message: 'Name must not exceed 100 characters' });
  }

  if (req.body.description && req.body.description.length > 500) {
    errors.push({ field: 'description', message: 'Description must not exceed 500 characters' });
  }

  if (req.body.color && !/^#[0-9A-F]{6}$/i.test(req.body.color)) {
    errors.push({ field: 'color', message: 'Color must be a valid hex color code' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
  }

  next();
};

// Validate tag creation/update data
export const validateTag = (req, res, next) => {
  const { name } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.length > 100) {
    errors.push({ field: 'name', message: 'Name must not exceed 100 characters' });
  }

  // Tags don't have description field in database schema

  if (req.body.color && !/^#[0-9A-F]{6}$/i.test(req.body.color)) {
    errors.push({ field: 'color', message: 'Color must be a valid hex color code' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
  }

  next();
};

// Validate comment creation/update data
export const validateComment = (req, res, next) => {
  const { content } = req.body;
  const errors = [];

  if (!content || content.trim().length === 0) {
    errors.push({ field: 'content', message: 'Comment content is required' });
  } else if (content.length > 2000) {
    errors.push({ field: 'content', message: 'Comment content must not exceed 2000 characters' });
  }

  if (req.body.parentId && isNaN(parseInt(req.body.parentId))) {
    errors.push({ field: 'parentId', message: 'Parent ID must be a valid number' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
  }

  next();
};

// Validate comment status update
export const validateCommentStatus = (req, res, next) => {
  const { status } = req.body;
  const errors = [];

  if (!status) {
    errors.push({ field: 'status', message: 'Status is required' });
  } else if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
    errors.push({ field: 'status', message: 'Status must be PENDING, APPROVED, or REJECTED' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
  }

  next();
};

// Validate user role update
export const validateUserRole = (req, res, next) => {
  const { role } = req.body;
  const errors = [];

  if (!role) {
    errors.push({ field: 'role', message: 'Role is required' });
  } else if (!['USER', 'ADMIN'].includes(role.toUpperCase())) {
    errors.push({ field: 'role', message: 'Role must be USER or ADMIN' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
  }

  next();
};
