import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore"
import { db } from "../services/firebase"

const collectionRef = "Videos"
const likeCollectionRef = "Likes"

interface VideoData {
    title: string
    description: string
    video: string
    thumbnail: string
    views: number
    createdAt: number
    genre: "action" | "comedy" | "horror" | "fantasy" | "drama" | "mystery" | "thriller" | "romance" | "science fiction"
}

export default class Video {
    constructor() {}

    static async getVideos(options? : { orderBy: string | null, order: "asc" | "desc" | null, genre: string | null }) {
        let q = query(collection(db, collectionRef))
        
        if (options && options.orderBy && options.orderBy === "likes") {
            // get videos by likes
            const videoDocs = await getDocs(q);

            const videos = await Promise.all(
                videoDocs.docs.map(async (doc) => {
                    const videoData = doc.data() as VideoData;
                    const videoId = doc.id;

                    // Query likes for this video
                    const likesQuery = query(collection(db, "Likes"), where("videoId", "==", videoId));
                    const likesSnapshot = await getDocs(likesQuery);

                    return {
                        id: videoId,
                        ...videoData,
                        likes: likesSnapshot.size // Count of likes
                    };
                })
            );

            videos.sort((a, b) => {
                const order = options.order === "desc" ? -1 : 1;
                return (a.likes - b.likes) * order;
            });

            // limit to 10 videos
            return videos.slice(0, 10);
        }
        
        if (options && options.genre) {
            q = query(q, where("genre", "==", options.genre))
        }

        if (options && options.orderBy) {
            q = query(q, orderBy(options.orderBy, options.order? options.order : "asc"))
        }

        
        const res = await getDocs(q)

        return res.docs.map((doc) => ({
            id: doc.id,
            ...doc.data() as VideoData
        }))
    }

    static async createVideo(videoData: VideoData) {
        const res = await addDoc(collection(db, collectionRef), {
            ...videoData
        })

        return res.id
    }

    static async getVideo(id: string) {
        const res = await getDoc(doc(db, collectionRef, id))

        if (!res.exists()) {
            return null
        }

        return {
            id: res.id,
            ... res.data() as VideoData
        }
    }

    static async updateVideo(id: string, videoData: any) {
        await updateDoc(doc(db, collectionRef, id), {
            ...videoData
        });
    }

    static async deleteVideo(id: string) {
        await deleteDoc(doc(db, collectionRef, id))
    }

    static async updateViews(id: string) {
        const video = await this.getVideo(id)

        if (!video) {
            return
        }

        await this.updateVideo(id, {
            views: video.views + 1
        })
    }

    static async getVideosByGenre(genre: string) {
        const q = query(collection(db, collectionRef), where("genre", "==", genre))

        const res = await getDocs(q)

        return res.docs.map((doc) => ({
            id: doc.id,
            ...doc.data() as VideoData
        }))
    }

    static async getLikedVideos(userId: string) {
        const q = query(collection(db, likeCollectionRef), where("userId", "==", userId))

        const res = await getDocs(q)

        return res.docs.map((doc) => doc.data().videoId)
    }

    static async likeVideo(videoId: string, userId: string) {
        const q = query(collection(db, likeCollectionRef), where("userId", "==", userId), where("videoId", "==", videoId))

        const res = await getDocs(q)

        if (!res.empty) {
            // delete like
            await deleteDoc(doc(db, likeCollectionRef, res.docs[0].id))
            return
        }

        await addDoc(collection(db, likeCollectionRef), {
            userId,
            videoId
        })
    }

    static async getVideoLikes(videoId: string, userId: string | null) {
        const q = query(collection(db, likeCollectionRef), where("videoId", "==", videoId))

        const res = await getDocs(q)

        const likes = res.docs.length

        if (!userId) {
            return { likes, userLiked: false }
        }

        for (const doc of res.docs) {
            if (doc.data().userId === userId) {
                return { likes, userLiked: true }
            }
        }

        return { likes, userLiked: false }
    }
    
}