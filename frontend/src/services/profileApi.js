import API from './api';

export const getMyProfile = () =>
    API.get('/profile/me');

export const updateMyProfile = (data) =>
    API.put('/profile/me', data);

export const changePassword = (data) =>
    API.put('/profile/change-password', data);