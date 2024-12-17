import React, { useState, useEffect } from "react";
import { useVideoStore } from "../stores/videoStore";
import { VideoCard } from "../components/VideoCard";
import { Video } from "../types/video";
import { useAuthStore } from "../stores/authStore";

const ProfilePage: React.FC = () => {
    const { user, loading: loadingUser, update, logout } = useAuthStore();
    const [edit_user, setEdit_User] = useState({
        userName: "",
        email: "",
        phone: "",
        dob: "",
        address: "",
    });
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (user) {
            setEdit_User(user);
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEdit_User((prevUser) => ({ ...prevUser, [name]: value }));
    };

    const handleSave = () => {
        update(edit_user);
        setEditing(false);
    };

    return (
        <div className="bg-gray-900 text-gray-100 min-h-screen">
            <div className="container mx-auto px-4 py-8 mt-16">
                <h1 className="text-2xl font-bold mb-6">Profile</h1>

                {/* User Info Section */}
                <div className="bg-gray-800 shadow rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">User Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Editable fields */}
                        {
                            loadingUser || !user ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            ) : (
                                <>
                                    <div>
                                        <label htmlFor="userName" className="block text-sm font-medium text-gray-400">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            id="userName"
                                            name="userName"
                                            value={edit_user.userName}
                                            onChange={handleInputChange}
                                            disabled={!editing}
                                            className="mt-1 p-2 block w-full bg-gray-700 text-gray-100 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={edit_user.email}
                                            onChange={handleInputChange}
                                            disabled={!editing}
                                            className="mt-1 p-2 block w-full bg-gray-700 text-gray-100 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={edit_user.phone}
                                            onChange={handleInputChange}
                                            disabled={!editing}
                                            className="mt-1 p-2 block w-full bg-gray-700 text-gray-100 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="age" className="block text-sm font-medium text-gray-400">
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            id="dob"
                                            name="dob"
                                            value={edit_user.dob}
                                            onChange={handleInputChange}
                                            disabled={!editing}
                                            className="mt-1 p-2 block w-full bg-gray-700 text-gray-100 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-400">
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={edit_user.address}
                                            onChange={handleInputChange}
                                            disabled={!editing}
                                            className="mt-1 p-2 block w-full bg-gray-700 text-gray-100 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </>
                            )
                        }
                    </div>

                    <div className="mt-6">
                        {editing ? (
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
                            >
                                Save
                            </button>
                        ) : (
                            <button
                                onClick={() => setEditing(true)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md shadow-sm hover:bg-gray-700"
                            >
                                Edit
                            </button>
                        )}

                        <button
                            onClick={logout}
                            className="ml-4 px-4 py-2 border border-red-600 text-red-600 rounded-md shadow-sm hover:bg-red-700 hover:text-white"
                        >
                            Log out
                        </button>
                    </div>
                </div>

                <LikedVideos />

            </div>
        </div>
    );
};

export default ProfilePage;

const LikedVideos: React.FC = () => {
    const { getLikedVideos } = useVideoStore();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const vids = await getLikedVideos();
            setVideos(vids);
            setLoading(false);
        };

        fetch();
    }, [getLikedVideos]);

    if (loading) {
        return (
            <div className="flex items-center justify-center mt-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="mt-12">
            <h2 className="text-lg font-semibold mb-4">Liked Videos</h2>
            {videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => video && (
                        <VideoCard
                            key={video.id}
                            video={video}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-gray-400">You haven't liked any videos yet.</p>
                </div>
            )}
        </div>
    );
};