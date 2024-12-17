import React, { useEffect, useRef } from 'react';
import videojs from "video.js";
import "video.js/dist/video-js.css";
import Player from 'video.js/dist/types/player';

interface VideoPlayerProps {
    video: { url: string, thumbnail: string };
}

interface VideoJsPlayerOptions {
    controls: boolean;
    responsive: boolean;
    fluid: boolean;
    poster: string;
    playbackRates: number[];
    autoplay: boolean;
    qualitySelector: boolean;
    sources: {
        src: string;
        type: string;
    }[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video }) => {
    const playerRef = useRef<Player | null>(null)

    const videoPlayerOptions: VideoJsPlayerOptions = {
        controls: true,
        responsive: true,
        fluid: true,
        poster: video.thumbnail,
        playbackRates: [0.5, 1, 1.5, 2],
        qualitySelector: true,
        autoplay: false,
        sources: [
            {
                src: video.url,
                type: "application/x-mpegURL"
            }
        ]
    }
    const handlePlayerReady = (player: Player) => {
        playerRef.current = player;

        // You can handle player events here, for example:
        player.on("waiting", () => {
            videojs.log("player is waiting");
        });

        player.on("dispose", () => {
            videojs.log("player will dispose");
        });
    };

    return (
        <VideoPlr
            options={videoPlayerOptions}
            onReady={handlePlayerReady}
        />
    );
};


export default VideoPlayer;


interface VideoPlrProps {
    options: VideoJsPlayerOptions;
    onReady?: (player: Player) => void;
}

const VideoPlr: React.FC<VideoPlrProps> = ({ options, onReady }) => {
    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<Player | null>(null);

    useEffect(() => {
        // Make sure Video.js player is only initialized once
        if (!playerRef.current) {
            // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
            const videoElement = document.createElement("video-js");

            videoElement.classList.add("vjs-big-play-centered");
            videoRef.current?.appendChild(videoElement);

            const player = (playerRef.current = videojs(videoElement, options, () => {
                videojs.log("player is ready");
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                onReady && onReady(player);
            }));

            player.poster(options.poster);

        } else {
            const player = playerRef.current;

            player.autoplay(options.autoplay);
            player.src(options.sources);
        }
    }, [options, onReady]);

    // Dispose the Video.js player when the functional component unmounts
    useEffect(() => {
        const player = playerRef.current;

        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, []);

    return (
        <div
            data-vjs-player
        >
            <div ref={videoRef} />
        </div>
    );
};
