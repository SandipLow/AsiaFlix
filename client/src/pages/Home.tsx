import React, { useEffect, useState } from "react";
import { useVideoStore } from "../stores/videoStore";
import { VideoCard } from "../components/VideoCard";
import { Video } from "../types/video";

export const Home: React.FC = () => {
    const genres = ["unclassified", "action", "comedy", "horror", "fantasy", "drama", "mystery", "thriller", "romance", "science fiction"];
    return (
        <div className="relative min-h-screen overflow-hidden mt-16">
            {/* Fixed Background */}
            <div className="absolute inset-0 -z-10">
                <img src="/bg_image_2.jpg" alt="bg" className="w-full h-full object-cover fixed bottom-0 left-0 right-0 z-[-10]" />
                <div className="h-full w-full fixed bottom-0 left-0 right-0 z-[-10] bg-black bg-opacity-80"></div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-100 mb-8">Discover Videos</h1>

                {/* Popular Videos */}
                <PopularVideos />

                {/* Render Genre Sections */}
                {genres.map((genre) => (
                    <GenreSection key={genre} genre={genre} />
                ))}
            </div>
        </div>
    );
};

interface GenreSectionProps {
    genre: string;
}

const GenreSection: React.FC<GenreSectionProps> = ({ genre }) => {
    const { fetchVideos } = useVideoStore();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const vids = await fetchVideos({ orderBy: "views", order: "desc", genre });
            setVideos(vids);
            setLoading(false);
        };

        fetch();
    }, [fetchVideos, genre]);

    if (loading) {
        return (
            <div className="flex items-center justify-center mt-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-200 mb-6 capitalize">{genre}</h2>
            {videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-gray-400">No videos found for {genre}</p>
                </div>
            )}
        </div>
    );
};

const PopularVideos: React.FC = () => {
    const { fetchVideos } = useVideoStore();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const vids = await fetchVideos({ orderBy: "likes", order: "desc", genre: "" });
            setVideos(vids);
            setLoading(false);
        };

        fetch();
    }, [fetchVideos]);

    if (loading) {
        return (
            <div className="flex items-center justify-center mt-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-200 mb-6 capitalize">Popular</h2>
            {videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-gray-400">No videos found for "Popular"</p>
                </div>
            )}
        </div>
    );
}
