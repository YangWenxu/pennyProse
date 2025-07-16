import Joi from 'joi';

export const createCommentSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Comment content cannot be empty',
      'string.max': 'Comment content must not exceed 2000 characters',
      'any.required': 'Comment content is required'
    }),
  
  authorName: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Author name must not exceed 100 characters'
    }),
  
  authorEmail: Joi.string()
    .email()
    .max(255)
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.max': 'Email must not exceed 255 characters'
    }),
  
  parentId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Parent ID must be a number',
      'number.integer': 'Parent ID must be an integer',
      'number.positive': 'Parent ID must be positive'
    })
});

export const updateCommentSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Comment content cannot be empty',
      'string.max': 'Comment content must not exceed 2000 characters',
      'any.required': 'Comment content is required'
    })
});

export const updateCommentStatusSchema = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'APPROVED', 'REJECTED')
    .required()
    .messages({
      'any.only': 'Status must be one of: PENDING, APPROVED, REJECTED',
      'any.required': 'Status is required'
    })
});

export const commentQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100'
    }),
  
  status: Joi.string()
    .valid('all', 'pending', 'approved', 'rejected')
    .default('all')
    .messages({
      'any.only': 'Status must be one of: all, pending, approved, rejected'
    }),
  
  postId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Post ID must be a number',
      'number.integer': 'Post ID must be an integer',
      'number.positive': 'Post ID must be positive'
    })
});

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const dataToValidate = schema === commentQuerySchema ? req.query : req.body;
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    if (schema === commentQuerySchema) {
      req.validatedQuery = value;
    } else {
      req.validatedData = value;
    }
    
    next();
  };
};
