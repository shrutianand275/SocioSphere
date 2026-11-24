import API from './api';

export const getMySociety = () =>
    API.get('/society/my-society');

export const updateSociety = (data) =>
    API.put('/society/update', data);

export const updateComplaintCategories = (categories) =>
    API.put('/society/complaint-categories', { categories });

export const updateExpenseCategories = (categories) =>
    API.put('/society/expense-categories', { categories });

export const updateEmergencyInformation = (data) =>
    API.put('/society/emergency-information', data);