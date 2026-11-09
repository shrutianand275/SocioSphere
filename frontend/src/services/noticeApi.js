import API from './api';

export const getNotices = async (params = {}) => {
    const response = await API.get('/notices', { params });
    return response.data;
};

export const getNoticeById = async (id) => {
    const response = await API.get(`/notices/${id}`);
    return response.data;
};

export const createNotice = async (data) => {
    const response = await API.post('/notices', data);
    return response.data;
};

export const updateNotice = async (id, data) => {
    const response = await API.patch(`/notices/${id}`, data);
    return response.data;
};

export const deleteNotice = async (id) => {
    const response = await API.delete(`/notices/${id}`);
    return response.data;
};

export const getNoticeStats = async () => {
    const response = await API.get('/notices/admin/stats');
    return response.data;
};