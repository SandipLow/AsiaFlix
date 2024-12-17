import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useVideoStore } from '../stores/videoStore';
import { Video } from '../types/video';

export const UploadVideo = ({ addVideo }: { addVideo: (vid: Video)=> void }) => {
    const [uploading, setUploading] = useState(false);
    const uploadVideo = useVideoStore((state) => state.uploadVideo);

    const handleUpload = async (event: React.ChangeEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        try {
            setUploading(true);
            const vid = await uploadVideo(formData);
            addVideo(vid);
            event.target.reset();
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
                <label className="block text-sm font-medium">Title</label>
                <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-3 py-2 bg-gray-600 rounded-lg"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                    name="description"
                    required
                    className="w-full px-3 py-2 bg-gray-600 rounded-lg"
                    rows={4}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium">genre</label>
                <select name="genre" required className="w-full px-3 py-2 bg-gray-600 rounded-lg">
                    <option selected value="unclassified">Unclassified</option>
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

            <div className="space-y-2">
                <label className="block text-sm font-medium">Video File</label>
                <input
                    type="file"
                    name="video"
                    accept="video/*"
                    required
                    className="w-full"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium">Thumbnail</label>
                <input
                    type="file"
                    name="thumbnail"
                    accept="image/*"
                    required
                    className="w-full"
                />
            </div>

            <button
                type="submit"
                disabled={uploading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
                <Upload className="w-5 h-5" />
                {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
        </form>
    );
};