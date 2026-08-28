import { useState } from 'react';
import api from '../api/axios';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UploadVideoModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'videoFile') {
      setVideoFile(e.target.files[0]);
    } else if (e.target.name === 'thumbnail') {
      setThumbnail(e.target.files[0]);
    }
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile || !thumbnail || !formData.title || !formData.description) {
      toast.error('All fields are required!');
      return;
    }

    const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
    const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;

    if (videoFile.size > MAX_VIDEO_SIZE) {
      toast.error('Video size must be less than 50MB');
      return;
    }
    
    if (thumbnail.size > MAX_THUMBNAIL_SIZE) {
      toast.error('Thumbnail size must be less than 5MB');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('videoFile', videoFile);
    data.append('thumbnail', thumbnail);

    setUploading(true);
    try {
      await api.post('/videos', data);
      toast.success('Video uploaded successfully!');
      
      setFormData({ title: '', description: '' });
      setVideoFile(null);
      setThumbnail(null);
      
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-bg-dark border border-border w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-white">Upload Video</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[#272727] rounded-full text-text-muted hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 scrollbar-thin">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Video File *</label>
              <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center hover:border-primary/50 transition-colors bg-[#1f1f1f]">
                <Video className="w-12 h-12 text-text-muted mb-4" />
                <p className="text-white font-medium mb-1">Drag and drop your video here</p>
                <p className="text-sm text-text-muted mb-4">MP4, WebM, or OGG</p>
                <input
                  type="file"
                  name="videoFile"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="video-upload"
                />
                <label 
                  htmlFor="video-upload"
                  className="bg-[#272727] hover:bg-[#3f3f3f] text-white px-4 py-2 rounded-full cursor-pointer font-medium transition-colors"
                >
                  Select File
                </label>
                {videoFile && (
                  <p className="mt-4 text-sm text-green-500 font-medium bg-green-500/10 px-3 py-1 rounded-full">
                    ✓ {videoFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Thumbnail *</label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center hover:border-primary/50 transition-colors bg-[#1f1f1f] h-48 relative overflow-hidden">
                  {thumbnail ? (
                    <img 
                      src={URL.createObjectURL(thumbnail)} 
                      alt="Thumbnail preview" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-text-muted mb-2" />
                      <p className="text-sm text-text-muted mb-4 text-center">Upload a picture that shows what's in your video</p>
                    </>
                  )}
                  <input
                    type="file"
                    name="thumbnail"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label 
                    htmlFor="thumbnail-upload"
                    className="bg-[#272727] hover:bg-[#3f3f3f] text-white px-4 py-2 rounded-full cursor-pointer font-medium transition-colors relative z-10"
                  >
                    {thumbnail ? 'Change Image' : 'Select Image'}
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Add a catchy title"
                    className="w-full bg-[#1f1f1f] border border-border rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-medium text-white mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell viewers about your video"
                    className="w-full flex-1 min-h-[100px] bg-[#1f1f1f] border border-border rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-full font-medium text-white hover:bg-[#272727] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" /> Publish Video
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadVideoModal;
