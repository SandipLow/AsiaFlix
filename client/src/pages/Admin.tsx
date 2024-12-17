import React, { useEffect, useState } from 'react';
import { UploadVideo } from '../components/UploadVideo';
import { useVideoStore } from '../stores/videoStore';
import { VideoCard } from '../components/VideoCard';
import { Video } from '../types/video';
import { useNavigate } from 'react-router-dom';

export const Admin: React.FC = () => {
    const { fetchVideos } = useVideoStore();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            const vids = await fetchVideos();
            setVideos(vids);
            setLoading(false);
        };

        fetch();
    }, [fetchVideos]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className='w-full min-h-screen bg-gray-900 text-gray-100'>
            <div className="container mx-auto px-4 py-8 mt-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">Upload New Video</h2>
                            <UploadVideo addVideo={(vid) => { setVideos(vids => [...vids, vid]); }} />
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold mb-4">Uploaded Videos</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {videos.map((video) => (
                                <VideoCard
                                    key={video.id}
                                    video={video}
                                    onClick={() => { navigate("/edit/"+video.id) }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};