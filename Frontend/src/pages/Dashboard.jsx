import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Eye, Users, PlaySquare, Heart, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import UploadVideoModal from '../components/UploadVideoModal';
import EditVideoModal from '../components/EditVideoModal';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/dashboard/stats');
      setStats(statsRes.data.data);

      const videosRes = await api.get('/dashboard/videos');
      setVideos(videosRes.data.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTogglePublish = async (videoId) => {
    try {
      await api.patch(`/videos/toggle/publish/${videoId}`);
      toast.success("Publish status updated");
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if(!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await api.delete(`/videos/${videoId}`);
      toast.success("Video deleted");
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to delete video");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <div className="w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Channel Dashboard</h1>
          <p className="text-text-muted text-sm">Welcome back, here are your latest stats.</p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md font-medium transition-colors shadow-lg"
        >
          Upload Video
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-bg-panel border border-border p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full">
            <Eye className="w-8 h-8" />
          </div>
          <div>
            <p className="text-text-muted text-sm">Total Views</p>
            <h3 className="text-2xl font-bold text-white">{stats?.totalViews || 0}</h3>
          </div>
        </div>
        
        <div className="bg-bg-panel border border-border p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-full">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-text-muted text-sm">Total Subscribers</p>
            <h3 className="text-2xl font-bold text-white">{stats?.totalSubscribers || 0}</h3>
          </div>
        </div>
        
        <div className="bg-bg-panel border border-border p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-full">
            <PlaySquare className="w-8 h-8" />
          </div>
          <div>
            <p className="text-text-muted text-sm">Total Videos</p>
            <h3 className="text-2xl font-bold text-white">{stats?.totalVideos || 0}</h3>
          </div>
        </div>
        
        <div className="bg-bg-panel border border-border p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-pink-500/10 text-pink-500 rounded-full">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <p className="text-text-muted text-sm">Total Likes</p>
            <h3 className="text-2xl font-bold text-white">{stats?.totalLikes || 0}</h3>
          </div>
        </div>
      </div>

      <div className="bg-bg-panel border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Your Videos</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-text-muted text-sm">
                <th className="px-6 py-4 font-medium">Video</th>
                <th className="px-6 py-4 font-medium">Visibility</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-center">Views</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {videos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-text-muted">
                    No videos uploaded yet.
                  </td>
                </tr>
              ) : (
                videos.map((video) => (
                  <tr key={video._id} className="border-b border-border hover:bg-[#272727] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={video.thumbnail} alt="thumbnail" className="w-24 h-14 object-cover rounded" />
                        <div>
                          <p className="text-white font-medium line-clamp-1 max-w-[200px] sm:max-w-[300px]">{video.title}</p>
                          <p className="text-text-muted line-clamp-1 max-w-[200px] sm:max-w-[300px]">{video.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleTogglePublish(video._id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          video.ispublished 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}
                      >
                        {video.ispublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-text-main">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center text-text-main">
                      {video.views}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => setVideoToEdit(video)}
                          className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteVideo(video._id)} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UploadVideoModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
      
      <EditVideoModal
        video={videoToEdit}
        isOpen={!!videoToEdit}
        onClose={() => setVideoToEdit(null)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};

export default Dashboard;
