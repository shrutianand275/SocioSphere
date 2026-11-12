import API from './api';

// Get expenses with filters
export const getExpenses = (params = {}) =>
    API.get('/expenses', { params });

// Get expense statistics
export const getExpenseStats = () =>
    API.get('/expenses/stats');

// Get single expense
export const getExpenseById = (id) =>
    API.get(`/expenses/${id}`);

// Add expense
export const createExpense = (data) =>
    API.post('/expenses', data);

// Update expense
export const updateExpense = (id, data) =>
    API.put(`/expenses/${id}`, data);

// Delete expense
export const deleteExpense = (id) =>
    API.delete(`/expenses/${id}`);