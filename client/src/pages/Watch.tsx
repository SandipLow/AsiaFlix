import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import { useVideoStore } from "../stores/videoStore";
import { Video } from "../types/video";
import { ThumbsUp } from "lucide-react";

export default function Watch() {
    const navigate = useNavigate();
    const { fetchVideo } = useVideoStore();
    const { videoId } = useParams();
    const [loading, setLoading] = useState(true);
    const [video, setSelectedVideo] = useState<Video | null>(null);

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

            setSelectedVideo(video);
            setLoading(false);
        }

        fetch();
    }, [fetchVideo, videoId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold">Video not found</h1>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-gray-100">
            <div className="container mx-auto px-4 py-8 mt-16">
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/")}
                        className="mb-4 text-blue-600 hover:text-blue-700"
                    >
                        ← Back to videos
                    </button>

                    <div className="w-full">
                        <VideoPlayer video={{ url: video.video, thumbnail: video.thumbnail }} />
                        <VideoInfo videoData={video} />
                    </div>

                </div>
            </div>
        </div>
    )
}

const VideoInfo = ({ videoData }: {videoData: Video}) => {
    const { likeVideo } = useVideoStore();
    const [video, setSelectedVideo] = useState<Video>(videoData);

    const handleLike = async () => {
        if (!video) return;
        await likeVideo(video.id);
        setSelectedVideo((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                userLiked: !prev.userLiked,
                likes: prev.userLiked ? prev.likes - 1 : prev.likes + 1
            }
        });
    }

    return (
        <div className="mt-4">
            <h1 className="text-2xl font-bold my-2">{video.title}</h1>
            {/* <div
                className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-100"
                style={{ whiteSpace: "pre-wrap" }}
            >
                {video.description}
            </div> */}
            <Description text={video.description} className="p-4  rounded-lg bg-gray-700" />
            <div className="flex items-center mt-4 text-sm text-gray-500">
                <span>{video.views.toLocaleString()} views</span>
                <span className="mx-2">•</span>
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center mt-4">

                <button className={`w-12 h-12 rounded-full p-3 ${ video.userLiked ? "bg-blue-600" : "bg-transparent" }`} onClick={handleLike} >
                    <ThumbsUp className={`rounded ${ video.userLiked ? "text-white" : "text-blue-600 "}`} />
                </button>
                <span className="ml-2">{video.likes} likes</span>
            </div>
        </div>
    )
}



interface DescriptionProps {
    text: string;
    initialHeight?: string;
    className?: string
}


const Description: React.FC<DescriptionProps> = ({ text, initialHeight = "6rem", className = "" }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="relative">
            <div
                className={`${className} transition-all duration-300`}
                style={{
                    whiteSpace: "pre-wrap",
                    overflow: "hidden",
                    height: expanded ? "auto" : initialHeight,
                }}
            >
                {text}
                {!expanded && (
                    <div
                        className="absolute bottom-10 left-0 right-0 h-8"
                    />
                )}
            </div>
            <div className="flex justify-end">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                    {expanded ? "See Less" : "See More"}
                </button>
            </div>
        </div>
    );
};