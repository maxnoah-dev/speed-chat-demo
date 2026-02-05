import Joi from 'joi';

// Validation schema for creating a new post
export const createPostSchema = Joi.object({
  user_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'user_id must be a number',
      'number.positive': 'user_id must be positive',
      'any.required': 'user_id is required'
    }),
  
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'title must be at least 3 characters',
      'string.max': 'title must not exceed 200 characters',
      'any.required': 'title is required'
    }),
  
  content: Joi.string()
    .trim()
    .min(10)
    .max(5000)
    .required()
    .messages({
      'string.min': 'content must be at least 10 characters',
      'string.max': 'content must not exceed 5000 characters',
      'any.required': 'content is required'
    })
});

// Middleware for request validation
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages
      });
    }

    // Replace req.body with validated data
    req.body = value;
    next();
  };
};
