import Joi from 'joi';
import { UserInputError } from 'apollo-server-errors';
import { Logger } from '@core/globals';

// Feature schema for reuse
const featureSchema = Joi.object({
  featureKey: Joi.string().trim().required().messages({
    'string.empty': 'featureKey must not be empty',
    'any.required': 'featureKey is required'
  }),
  description: Joi.string().trim().required().messages({
    'string.empty': 'description must not be empty',
    'any.required': 'description is required'
  }),
  not_available_description: Joi.string().allow('').optional(),
  available: Joi.boolean().default(true),
  limit: Joi.alternatives()
    .try(
      Joi.string().trim().min(1),
      Joi.number().positive()
    )
    .optional()
    .messages({
      'string.empty': 'limit must not be empty if provided as a string',
      'number.positive': 'limit must be a positive number if provided as a number'
    }),
  unit: Joi.string().allow('').optional()
});

// Schema for creating a subscription
const createSubscriptionSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'name must not be empty',
    'any.required': 'name is required'
  }),
  planCode: Joi.string().trim().pattern(/^[a-zA-Z0-9_]+$/).required().messages({
    'string.empty': 'planCode must not be empty',
    'string.pattern.base': 'planCode must contain only letters, numbers, and underscores',
    'any.required': 'planCode is required'
  }),
  description: Joi.string().trim().required().messages({
    'string.empty': 'description must not be empty',
    'any.required': 'description is required'
  }),
  type: Joi.string().valid('subscription', 'addon').required().messages({
    'string.empty': 'type must not be empty',
    'any.only': 'type must be either subscription or addon',
    'any.required': 'type is required'
  }),
  price: Joi.number().required().messages({
    'number.base': 'price must be a number',
    'any.required': 'price is required'
  }),
  interval: Joi.string().valid('Monthly', 'Yearly', 'Lifetime').required().messages({
    'string.empty': 'interval must not be empty',
    'any.only': 'interval must be one of: Monthly, Yearly, Lifetime',
    'any.required': 'interval is required'
  }),
  duration: Joi.number().integer().positive().optional().messages({
    'number.base': 'duration must be a number',
    'number.integer': 'duration must be an integer',
    'number.positive': 'duration must be a positive number'
  }),
  currency: Joi.string().default('USD').optional().messages({
    'string.empty': 'currency must not be empty if provided'
  }),
  features: Joi.array().items(featureSchema).optional().messages({
    'array.base': 'features must be an array'
  }),
  status: Joi.string().required().messages({
    'string.empty': 'status must not be empty',
    'any.required': 'status is required'
  }),
  createdById: Joi.string().required().messages({
    'string.empty': 'createdById must not be empty',
    'any.required': 'createdById is required'
  }),
  updatedById: Joi.string().optional(),
  coinflowPlanId: Joi.string().optional() // This will be set by the service
});

// Schema for updating a subscription
const updateSubscriptionSchema = Joi.object({
  name: Joi.string().trim().optional().messages({
    'string.empty': 'name must not be empty if provided'
  }),
  planCode: Joi.string().trim().pattern(/^[a-zA-Z0-9_]+$/).optional().messages({
    'string.empty': 'planCode must not be empty if provided',
    'string.pattern.base': 'planCode must contain only letters, numbers, and underscores'
  }),
  description: Joi.string().trim().optional().messages({
    'string.empty': 'description must not be empty if provided'
  }),
  type: Joi.string().valid('subscription', 'addon').optional().messages({
    'string.empty': 'type must not be empty if provided',
    'any.only': 'type must be either subscription or addon'
  }),
  price: Joi.number().optional().messages({
    'number.base': 'price must be a number',
    'number.positive': 'price must be a positive number'
  }),
  features: Joi.array().items(featureSchema).optional().messages({
    'array.base': 'features must be an array'
  }),
  updatedById: Joi.string().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

/**
 * Validates subscription creation payload using Joi
 * @param payload The subscription data to validate
 * @throws UserInputError if validation fails
 */
export const validateCreateSubscription = (payload: any): void => {
  Logger.info('Validating subscription creation payload with Joi');
  
  const { error, value } = createSubscriptionSchema.validate(payload, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    Logger.error(`Validation error: ${errorMessage}`);
    throw new UserInputError(errorMessage);
  }
  
  Logger.info('Subscription payload validation successful');
  return value;
};

/**
 * Validates subscription update payload using Joi
 * @param payload The subscription update data to validate
 * @throws UserInputError if validation fails
 */
export const validateUpdateSubscription = (payload: any): void => {
  Logger.info('Validating subscription update payload with Joi');
  
  const { error, value } = updateSubscriptionSchema.validate(payload, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    Logger.error(`Validation error: ${errorMessage}`);
    throw new UserInputError(errorMessage);
  }
  
  Logger.info('Subscription update payload validation successful');
  return value;
};