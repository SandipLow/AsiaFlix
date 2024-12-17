import React from 'react';
import { Play } from 'lucide-react';
import { Video } from '../types/video';
import { useNavigate } from 'react-router-dom';

interface VideoCardProps {
    video: Video;
    onClick?: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
    const navigate = useNavigate()
    
    return (
        <div
            className="group relative overflow-hidden rounded-lg cursor-pointer"
            onClick={onClick ? onClick : (() => navigate(`/watch/${video.id}`))}
        >
            <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-12 h-12 text-white" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                <h3 className="text-white font-semibold">{video.title}</h3>
                <p className="text-gray-300 text-sm">{video.views?.toLocaleString()} views</p>
            </div>
        </div>
    );
};