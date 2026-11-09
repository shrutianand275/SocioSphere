import API from './api';

// Get complaints
export const getComplaints = async (params = {}) => {
    const response = await API.get('/complaints', { params });
    return response.data;
};

// Get complaint details
export const getComplaintById = async (id) => {
    const response = await API.get(`/complaints/${id}`);
    return response.data;
};

// Submit complaint
export const createComplaint = async (complaintData) => {
    const response = await API.post('/complaints', complaintData);
    return response.data;
};

// Get complaint statistics
export const getComplaintStats = async () => {
    const response = await API.get('/complaints/admin/stats');
    return response.data;
};

// Update complaint status
export const updateComplaintStatus = async (id, data) => {
    const response = await API.patch(
        `/complaints/${id}/status`,
        data
    );

    return response.data;
};

// Assign complaint
export const assignComplaint = async (id, assignedTo) => {
    const response = await API.patch(
        `/complaints/${id}/assign`,
        { assignedTo }
    );

    return response.data;
};