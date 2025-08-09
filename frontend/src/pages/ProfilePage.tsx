import { useState } from 'react';
import api from '../api';
import { useAuth } from '../useAuth';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.patch('/users/me', { firstName, lastName });
    await refreshUser();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    await api.post('/users/me/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    await refreshUser();
  };

  return (
    <div>
      <h2>Profile</h2>
      {user?.profilePictureUrl && (
        <img
          src={new URL(user.profilePictureUrl, import.meta.env.VITE_API_URL).href}
          alt="Profile"
          width={100}
        />
      )}
      <p>Email: {user?.email}</p>
      <form onSubmit={handleSubmit}>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
        />
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
        />
        <button type="submit">Save</button>
      </form>
      <input type="file" onChange={handleFileChange} />
    </div>
  );
}
