import { Router, Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { v4 as uuidv4 } from "uuid";
import upload from "../middlewares/upload";
import Video from "../models/Video";
import fetchUser from "../middlewares/fetchUser";
import { supabase } from "../services/superbase";

const router = Router();

const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user!.role !== "admin") {
        res.status(401).send("Unauthorized");
        return;
    }

    next();
}

router.post(
    "/upload",
    fetchUser,
    checkAdmin,
    upload.fields([
        { name: "video", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const files = req.files as { video?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] };
            const videoFile = files.video?.[0];
            const thumbnailFile = files.thumbnail?.[0];

            if (!videoFile) {
                res.status(400).send("Video file is required");
                return;
            }

            if (!thumbnailFile) {
                res.status(400).send("Thumbnail file is required");
                return;
            }

            const vidId = uuidv4();
            const videoPath = videoFile.path
            const outputPath = `./uploads/${vidId}`
            const hlsPath = `${outputPath}/index.m3u8`

            if (!fs.existsSync(outputPath)) {
                fs.mkdirSync(outputPath, { recursive: true })
            }

            // FFmpeg command to generate HLS segments
            const ffmpegCommand = `ffmpeg -i ${videoPath}  -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

            await new Promise((resolve, reject) => {
                console.log("Processing video",);
                exec(ffmpegCommand, (err, stdout, stderr) => {
                    if (err) {
                        console.error("Error processing video:", err);
                        reject(err);
                        return;
                    }

                    fs.rmSync(videoPath);

                    console.log("Video processed successfully:", stdout, stderr);
                    resolve(null);
                });
            });

            // Move thumbnail the thumbnail to the video directory
            fs.renameSync(thumbnailFile.path, `${outputPath}/thumbnail.jpg`);


            // upload to supabase
            const hlsfiles = fs.readdirSync(outputPath);
            for (const file of hlsfiles) {
                const filePath = path.join(outputPath, file);
                const fileContent = fs.readFileSync(filePath);

                console.log(`Uploading ${file} to Supabase`);

                const { error } = await supabase.storage
                    .from('asiaflix')
                    .upload(`${outputPath}/${file}`, fileContent, {
                        cacheControl: '3600',
                        upsert: true,
                    });

                if (error) {
                    throw new Error(`Supabase upload error for hls segments: ${error.message}`);
                }
            }

            console.log(`Uploading thumbnail to Supabase`);

            const { error: thumbnailError } = await supabase.storage
                .from('asiaflix')
                .upload(`${outputPath}/thumbnail.jpg`, fs.readFileSync(`${outputPath}/thumbnail.jpg`), {
                    cacheControl: '3600',
                    upsert: true,
                });

            if (thumbnailError) {
                throw new Error(`Supabase upload error for thumbnail: ${thumbnailError.message}`);
            }
            else {
                console.log(`Thumbnail uploaded to Supabase`);
            }

            // cleanup
            fs.rmSync(outputPath, { recursive: true });


            // Generate public URLs for the video and thumbnail
            const videoUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/asiaflix/${outputPath}/index.m3u8`;
            const thumbnailUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/asiaflix/${outputPath}/thumbnail.jpg`;

            // Create video document
            const videoData = {
                title: req.body.title,
                description: req.body.description,
                genre: req.body.genre ? req.body.genre : "unclassified",
                video: videoUrl,
                thumbnail: thumbnailUrl,
                views: 0
            };

            const videoId = await Video.createVideo(videoData);
            res.json({ id: videoId, ...videoData });
        } catch (error) {
            console.error("Error uploading video:", error);
            res.status(500).json({ error: "Failed to upload video" });
        }
    }
);

router.get("/", async (req, res) => {
    try {
        // Extract query parameters and cast to string or null
        const orderBy = typeof req.query.orderBy === "string" ? req.query.orderBy : null;
        const order = req.query.order === "asc" || req.query.order === "desc" ? req.query.order : null;
        const genre = typeof req.query.genre === "string" ? req.query.genre : null;

        // Fetch videos based on the options
        const videos = await Video.getVideos({ orderBy, order, genre });
        res.json(videos);
    } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json({ error: "Failed to fetch videos" });
    }
});

router.get("/:id", fetchUser, async (req, res) => {
    try {
        const video = await Video.getVideo(req.params.id);

        if (!video) {
            res.status(404).send("Video not found");
            return;
        }

        // Increment video views
        Video.updateViews(req.params.id);

        // get likes
        const { likes, userLiked } = await Video.getVideoLikes(req.params.id, req.user ? req.user.id : null);

        res.json({ ...video, likes, userLiked });
    } catch (error) {
        console.error("Error fetching video:", error);
        res.status(500).json({ error: "Failed to fetch video" });
    }
});

router.put("/:id", fetchUser, checkAdmin, async (req, res) => {
    try {
        const video = await Video.getVideo(req.params.id);
        
        if (!video) {
            res.status(404).send("Video not found");
            return;
        }

        const videoData = {
            title: req.body.title,
            description: req.body.description,
            genre: req.body.genre ? req.body.genre : "unclassified",
        };

        await Video.updateVideo(req.params.id, videoData);
        res.json({ id: req.params.id, ...videoData });
    } catch (error) {
        console.error("Error updating video:", error);
        res.status(500).json({ error: "Failed to update video" });
    }
})

router.delete("/:id", fetchUser, checkAdmin, async (req, res) => {
    try {
        const video = await Video.getVideo(req.params.id);
        
        if (!video) {
            res.status(404).send("Video not found");
            return;
        }

        await Video.deleteVideo(req.params.id);
        res.send("Deleted video");
    } catch (error) {
        console.error("Error deleting video:", error);
        res.status(500).json({ error: "Failed to delete video" });
    }
})

router.post("/:id/like", fetchUser, async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            res.status(401).send("Unauthorized");
            return;
        }

        const video = await Video.getVideo(req.params.id);

        if (!video) {
            res.status(404).send("Video not found");
            return;
        }

        await Video.likeVideo(req.params.id, user.id);

        res.send("Liked video");
    } catch (error) {
        console.error("Error liking video:", error);
        res.status(500).json({ error: "Failed to like video" });
    }
})


export default router;
