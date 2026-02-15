import { Response } from 'express';

/**
 * Response helper utilities
 */

export const successResponse = (
  res: Response,
  data: any,
  message: string = 'Success',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message: string = 'Error occurred',
  statusCode: number = 500,
  errors?: any
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

export const paginatedResponse = (
  res: Response,
  data: any[],
  page: number,
  limit: number,
  total: number
) => {
  return res.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  });
};
