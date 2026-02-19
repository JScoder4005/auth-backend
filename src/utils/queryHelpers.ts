/**
 * Database query optimization helpers
 */

/**
 * Select fields for expense queries (avoid fetching unnecessary data)
 */
export const expenseSelectFields = {
  id: true,
  amount: true,
  description: true,
  date: true,
  type: true,
  categoryId: true,
  userId: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      name: true,
      color: true,
      icon: true,
      type: true,
    },
  },
};

/**
 * Select fields for category queries
 */
export const categorySelectFields = {
  id: true,
  name: true,
  color: true,
  icon: true,
  type: true,
  userId: true,
  createdAt: true,
};

/**
 * Select fields for budget queries
 */
export const budgetSelectFields = {
  id: true,
  name: true,
  amount: true,
  period: true,
  categoryId: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: {
      id: true,
      name: true,
      color: true,
      icon: true,
      type: true,
    },
  },
};

/**
 * Select fields for user queries (excluding sensitive data)
 */
export const userSelectFields = {
  id: true,
  email: true,
  createdAt: true,
};


/**
 * Build date range filter
 */
export const buildDateFilter = (startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) return {};
  
  const filter: any = {};
  if (startDate) filter.gte = new Date(startDate);
  if (endDate) filter.lte = new Date(endDate);
  
  return Object.keys(filter).length > 0 ? { date: filter } : {};
};

/**
 * Sanitize and parse pagination params
 */
export const parsePaginationParams = (page?: string, limit?: string) => {
  const parsedPage = Math.max(1, parseInt(page || '1'));
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit || '10')));
  const skip = (parsedPage - 1) * parsedLimit;
  
  return {
    page: parsedPage,
    limit: parsedLimit,
    skip,
  };
};
