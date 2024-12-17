import { useParams, useNavigate } from "react-router-dom";
import { useVideoStore } from "../stores/videoStore";
import { useEffect, useState } from "react";
import { Video } from "../types/video";

export default function Edit() {
    const { videoId } = useParams();
    const { fetchVideo, updateVideo, deleteVideo } = useVideoStore();
    const [loading, setLoading] = useState(true);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [videoData, setVideoData] = useState<Partial<Video> | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch video data
        const fetch = async () => {
            if (!videoId) {
                // Handle error
                setLoading(false);
                return;
            }
            const video = await fetchVideo(videoId);
            if (!video) {
                // Handle error
                setLoading(false);
                return;
            }

            setVideoData({
                title: video.title,
                description: video.description,
                genre: video.genre,
            });
            setLoading(false);
        };

        fetch();
    }, [fetchVideo, videoId]);

    async function handleUpdate() {
        if (!videoId || !videoData) return;
    
        setLoadingUpdate(true);
        try {
            await updateVideo(videoId, videoData);
            alert("Video updated successfully!");
        } catch (error) {
            console.error("Failed to update video:", error);
        } finally {
            setLoadingUpdate(false);
        }
    }
    

    async function handleDelete() {
        if (!videoId) return;

        setLoadingDelete(true);
        try {
            await deleteVideo(videoId);
            alert("Video deleted successfully!");
            navigate("/admin"); // Redirect to admin page
        } catch (error) {
            console.error("Failed to delete video:", error);
        } finally {
            setLoadingDelete(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!videoData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-100">Video not found</h1>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-gray-900 text-gray-100">
            <div className="container mx-auto px-4 py-8 mt-16">
                <div className="bg-gray-800 rounded-lg shadow-md p-6 max-w-lg mx-auto">
                    <h2 className="text-xl font-bold mb-4">Edit Video</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                                value={videoData.title}
                                onChange={(e) =>
                                    setVideoData({ ...videoData, title: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                                rows={4}
                                value={videoData.description}
                                onChange={(e) =>
                                    setVideoData({ ...videoData, description: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Genre</label>
                            <select
                                className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                                value={videoData.genre}
                                onChange={(e) =>
                                    setVideoData({ ...videoData, genre: e.target.value as Video["genre"] })
                                }
                            >
                                <option value="action">Action</option>
                                <option value="comedy">Comedy</option>
                                <option value="horror">Horror</option>
                                <option value="fantasy">Fantasy</option>
                                <option value="drama">Drama</option>
                                <option value="mystery">Mystery</option>
                                <option value="thriller">Thriller</option>
                                <option value="romance">Romance</option>
                                <option value="science fiction">Science Fiction</option>
                            </select>
                        </div>

                    </div>
                    <div className="flex justify-between items-center mt-6">
                        <button
                            className={`px-4 py-2 bg-blue-600 rounded-lg text-white font-medium ${loadingUpdate ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            onClick={handleUpdate}
                            disabled={loadingUpdate}
                        >
                            {loadingUpdate ? "Updating..." : "Update"}
                        </button>
                        <button
                            className={`px-4 py-2 bg-red-600 rounded-lg text-white font-medium ${loadingDelete ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            onClick={handleDelete}
                            disabled={loadingDelete}
                        >
                            {loadingDelete ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
