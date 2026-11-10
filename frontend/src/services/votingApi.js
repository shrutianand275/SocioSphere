import API from './api';

// Get all polls
export const getVotings = async (params = {}) => {
    const response = await API.get('/voting', { params });
    return response.data;
};

// Get poll details
export const getVotingById = async (id) => {
    const response = await API.get(`/voting/${id}`);
    return response.data;
};

// Create poll
export const createVoting = async (data) => {
    const response = await API.post('/voting', data);
    return response.data;
};

// Update poll
export const updateVoting = async (id, data) => {
    const response = await API.patch(`/voting/${id}`, data);
    return response.data;
};

// Close poll
export const closeVoting = async (id) => {
    const response = await API.patch(`/voting/${id}/close`);
    return response.data;
};

// Delete poll
export const deleteVoting = async (id) => {
    const response = await API.delete(`/voting/${id}`);
    return response.data;
};

// Submit vote
export const submitVote = async (id, optionId) => {
    const response = await API.post(`/voting/${id}/vote`, {
        optionId
    });
    return response.data;
};

// Get results
export const getVotingResults = async (id) => {
    const response = await API.get(`/voting/${id}/results`);
    return response.data;
};

// Get statistics
export const getVotingStats = async () => {
    const response = await API.get('/voting/admin/stats');
    return response.data;
};