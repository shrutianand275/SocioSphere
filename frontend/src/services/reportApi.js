import API from './api';

export const getSocietyOverview = () =>
    API.get('/reports/overview');

export const getComplaintAnalytics = () =>
    API.get('/reports/complaints');

export const getExpenseAnalytics = () =>
    API.get('/reports/expenses');

export const getVotingAnalytics = () =>
    API.get('/reports/voting');

export const getResidentAnalytics = () =>
    API.get('/reports/residents');