import { create } from 'zustand';
import { Video, VideoState } from '../types/video';
import { useAuthStore } from './authStore';

const API_URL = 'http://localhost:3000';

export const useVideoStore = create<VideoState>(() => ({
    fetchVideos: async (options) => {
        try {
            const token = useAuthStore.getState().token;
    
            // Build query parameters for GET request
            const queryParams = new URLSearchParams(
                Object.entries(options || {}).reduce((acc, [key, value]) => {
                    if (value !== null && value !== undefined) {
                        acc[key] = value.toString();
                    }
                    return acc;
                }, {} as Record<string, string>)
            ).toString();
    
            const response = await fetch(`${API_URL}/video?${queryParams}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
    
            if (!response.ok) throw new Error("Failed to fetch videos");
    
            const videos = (await response.json()) as Video[];
            return videos;
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    fetchVideo: async (videoId: string) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/video/${videoId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch video');

            const video = await response.json() as Video;
            return video;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    uploadVideo: async (videoData: FormData) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/video/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: videoData,
            });

            if (!response.ok) throw new Error('Failed to upload video');

            const newVideo = await response.json();

            return newVideo as Video;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to upload video');
        }
    },

    getLikes: async (videoId: string) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/video/${videoId}/likes`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch likes');

            const likes = await response.json();
            return likes;
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    likeVideo: async (videoId: string) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/video/${videoId}/like`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to like video');
        } catch (error) {
            console.error(error);
            throw new Error('Failed to like video');
        }
    },

    getLikedVideos: async () => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/user/likes`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch liked videos');

            const likedVideos = await response.json() as Video[];
            return likedVideos;
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    updateVideo: async (videoId: string, videoData: Partial<Video>) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/video/${videoId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(videoData),
            });

            if (!response.ok) throw new Error('Failed to update video');

            const updatedVideo = await response.json() as Video;
            return updatedVideo;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to update video');
        }
    },

    deleteVideo: async (videoId: string) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/video/${videoId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to delete video');
        } catch (error) {
            console.error(error);
            throw new Error('Failed to delete video');
        }
    },
}));