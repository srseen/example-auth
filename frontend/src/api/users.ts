import api from './index';

export const updateProfile = (data: { firstName?: string; lastName?: string }) =>
  api.patch('/users/me', data);

export const uploadProfilePicture = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/users/me/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const changePassword = (data: {
  currentPassword: string;
  newPassword: string;
}) => api.patch('/users/me/password', data);

export const deleteAccount = () => api.delete('/users/me');
