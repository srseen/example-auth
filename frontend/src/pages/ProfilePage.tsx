import { useState } from "react";
import api from "../api";
import { useAuth } from "../useAuth";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.patch("/users/me", { firstName, lastName });
    await refreshUser();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await api.post("/users/me/profile-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await refreshUser();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
          Profile
        </h2>

        <div className="flex flex-col items-center mb-6">
          {user?.profilePictureUrl ? (
            <img
              src={
                new URL(user.profilePictureUrl, import.meta.env.VITE_API_URL)
                  .href
              }
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-300 shadow-md"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-5xl font-bold border-4 border-blue-300 shadow-md">
              {user?.firstName ? user.firstName[0].toUpperCase() : ""}
            </div>
          )}
          <p className="mt-4 text-lg font-medium text-gray-700">
            {user?.email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </form>
        <div className="mt-6">
          <label
            htmlFor="profilePicture"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Upload Profile Picture
          </label>
          <input
            type="file"
            id="profilePicture"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          />
        </div>
      </div>
    </div>
  );
}
