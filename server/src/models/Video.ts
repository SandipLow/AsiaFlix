import { supabase } from "../services/superbase";

const videoTable = 'Videos';
const likeTable = 'Likes';

interface VideoData {
    title: string;
    description: string;
    video: string;
    thumbnail: string;
    views: number;
    createdAt?: Date;
    genre: "action" | "comedy" | "horror" | "fantasy" | "drama" | "mystery" | "thriller" | "romance" | "science fiction";
}

export default class Video {
    constructor() {}

    static async getVideos(options?: { orderBy: string | null; order: "asc" | "desc" | null; genre: string | null }) {
        const { orderBy, order, genre } = options || {};

        // handle orderBy = likes
        if (orderBy === 'likes') {
            const { data, error } = await supabase
                .from(videoTable)
                .select(`
                    *,
                    likes:Likes(
                        userId,
                        createdat
                    )
                `)

            if (error) throw error;

            const res = data.sort((a, b) => {
                if (order === 'asc') {
                    return a.likes.length - b.likes.length;
                } else {
                    return b.likes.length - a.likes.length;
                }
            }).map(d=> ({...d, likes: d.likes.length}));

            return res;
        }


        const baseQuery = supabase.from(videoTable).select(`
            *,
            likes:Likes(
                userId,
                createdat
            )
        `)
        
        // Filter by genre
        if (genre) {
            baseQuery.eq('genre', genre);
        }
        
        // Order by
        if (orderBy) {
            baseQuery.order(orderBy, { ascending: order === 'asc' });
        }
        
        const { data, error } = await baseQuery;

        if (error) throw error;

        return data;

        
    }

    static async createVideo(videoData: VideoData) {
        const { data, error } = await supabase.from(videoTable).insert(videoData).select().single();
        if (error) throw error;

        return data.id;
    }

    static async getVideo(id: string) {
        const { data, error } = await supabase.from(videoTable).select('*').eq('id', id).single();
        if (error) throw error;

        return data;
    }

    static async updateVideo(id: string, videoData: Partial<VideoData>) {
        const { error } = await supabase.from(videoTable).update(videoData).eq('id', id);
        if (error) throw error;
    }

    static async deleteVideo(id: string) {
        const { error } = await supabase.from(videoTable).delete().eq('id', id);
        if (error) throw error;
    }

    static async updateViews(id: string) {
        const video = await this.getVideo(id);

        if (!video) return;

        const { error } = await supabase
            .from(videoTable)
            .update({ views: video.views + 1 })
            .eq('id', id);

        if (error) throw error;
    }

    static async getVideosByGenre(genre: string) {
        const { data, error } = await supabase.from(videoTable).select('*').eq('genre', genre);
        if (error) throw error;

        return data;
    }

    static async getLikedVideos(userId: string) {
        const { data, error } = await supabase.from(likeTable).select('videoId').eq('userId', userId);
        if (error) throw error;

        return data.map((like) => like.videoId);
    }

    static async likeVideo(videoId: string, userId: string) {
        const { data, error } = await supabase
            .from(likeTable)
            .select('*')
            .eq('userId', userId)
            .eq('videoId', videoId);

        if (error) throw error;

        if (data.length > 0) {
            // Unlike video
            const { error: deleteError } = await supabase
                .from(likeTable)
                .delete()
                .eq('id', data[0].id);

            if (deleteError) throw deleteError;
            return;
        }

        // Like video
        const { error: insertError } = await supabase
            .from(likeTable)
            .insert({ userId, videoId });

        if (insertError) throw insertError;
    }

    static async getVideoLikes(videoId: string, userId: string | null) {
        const { data, error } = await supabase.from(likeTable).select('*').eq('videoId', videoId);
        if (error) throw error;

        const likes = data.length;

        if (!userId) {
            return { likes, userLiked: false };
        }

        const userLiked = data.some((like) => like.userId === userId);

        return { likes, userLiked };
    }
}
