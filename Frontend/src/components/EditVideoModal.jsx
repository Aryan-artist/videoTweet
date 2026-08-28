import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EditVideoModal = ({ video, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.description || '',
      });
      setThumbnail(null);
    }
  }, [video]);

  if (!isOpen || !video) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'thumbnail') {
      setThumbnail(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required!');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    if (thumbnail) {
      const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;
      if (thumbnail.size > MAX_THUMBNAIL_SIZE) {
        toast.error('Thumbnail size must be less than 5MB');
        return;
      }
      data.append('thumbnail', thumbnail);
    }

    setUploading(true);
    try {
      await api.patch(`/videos/${video._id}`, data);
      toast.success('Video updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update video');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-bg-dark border border-border w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-white">Edit Video Details</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[#272727] rounded-full text-text-muted hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 scrollbar-thin">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Thumbnail</label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center hover:border-primary/50 transition-colors bg-[#1f1f1f] h-48 relative overflow-hidden">
                  {thumbnail ? (
                    <img 
                      src={URL.createObjectURL(thumbnail)} 
                      alt="Thumbnail preview" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : video.thumbnail ? (
                    <img 
                      src={video.thumbnail} 
                      alt="Current thumbnail" 
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
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
                    id="edit-thumbnail-upload"
                  />
                  <label 
                    htmlFor="edit-thumbnail-upload"
                    className="bg-[#272727] hover:bg-[#3f3f3f] text-white px-4 py-2 rounded-full cursor-pointer font-medium transition-colors relative z-10 shadow-lg"
                  >
                    Change Image
                  </label>
                </div>
                <p className="text-xs text-text-muted mt-2">Leave empty to keep your current thumbnail.</p>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-[#1f1f1f] border border-border rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-medium text-white mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" /> Save Changes
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

export default EditVideoModal;
