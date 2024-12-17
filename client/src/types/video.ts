export interface Video {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    video: string;
    createdAt: string;
    views: number;
    genre: "action" | "comedy" | "horror" | "fantasy" | "drama" | "mystery" | "thriller" | "romance" | "science fiction";
    likes: number;
    userLiked: boolean;
}

export interface VideoState {
    fetchVideos: (options?: { orderBy: string|null, order: string|null, genre: string|null }) => Promise<Video[]>;
    fetchVideo: (videoId: string) => Promise<Video | null>;
    uploadVideo: (videoData: FormData) => Promise<Video>;
    getLikes: (videoId: string) => Promise<number>;
    likeVideo: (videoId: string) => Promise<void>;
    getLikedVideos: () => Promise<Video[]>;
    updateVideo: (videoId: string, videoData: Partial<Video>) => Promise<Video>;
    deleteVideo: (videoId: string) => Promise<void>;
}