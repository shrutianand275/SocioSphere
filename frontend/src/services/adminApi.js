import API from './api';

// Dashboard statistics
export const getDashboardStats = async () => {
    const response = await API.get('/admin/dashboard/stats');
    return response.data;
};

// Get residents
export const getResidents = async (params = {}) => {
    const response = await API.get('/admin/residents', { params });
    return response.data;
};

// Approve resident
export const approveResident = async (id) => {
    const response = await API.patch(`/admin/residents/${id}/approve`);
    return response.data;
};

// Reject resident
export const rejectResident = async (id) => {
    const response = await API.patch(`/admin/residents/${id}/reject`);
    return response.data;
};

// Activate or deactivate resident
export const toggleResidentStatus = async (id) => {
    const response = await API.patch(
        `/admin/residents/${id}/toggle-status`
    );

    return response.data;
};