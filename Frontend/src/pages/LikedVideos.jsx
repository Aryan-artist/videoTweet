import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { MoreVertical, ThumbsUp, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VideoGridSkeleton from '../components/VideoGridSkeleton';
import { toast } from 'react-hot-toast';

const LikedVideos = () => {
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchLikedVideos = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.get('/likes/videos');
      const data = response.data?.data || [];
      const videos = data
        .map(item => item.video || item)
        .filter(v => v && v._id && v.owner && v.owner.username);
      setLikedVideos(videos);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedVideos();
  }, [user]);

  const handleRemoveLikedVideo = async (e, videoId) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(null);
    try {
      await api.post(`/likes/toggle/v/${videoId}`);
      setLikedVideos(prev => prev.filter(v => v._id !== videoId));
      toast.success("Removed from liked videos");
    } catch (error) {
      toast.error("Failed to remove from liked videos");
    }
  };

  if (loading) {
    return (
      <div className="pb-12 bg-bg-dark min-h-screen pt-6 max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-bg-panel rounded-full">
            <ThumbsUp className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Liked Videos</h1>
            <p className="text-text-muted text-sm">Videos you have liked</p>
          </div>
        </div>
        <VideoGridSkeleton count={8} />
      </div>
    );
  }

  return (
    <div className="pb-12 bg-bg-dark min-h-screen pt-6">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="p-3 bg-bg-panel rounded-full">
          <ThumbsUp className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Liked videos</h1>
          <p className="text-text-muted text-sm">{likedVideos.length} videos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-10">
        {likedVideos.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <h3 className="text-xl font-bold text-white mb-2">No liked videos yet</h3>
            <p className="text-text-muted">Videos you like will show up here</p>
          </div>
        ) : (
          likedVideos.map((video) => (
            <div key={video._id} className="group relative block">
              <div className="flex flex-col gap-3">
                <Link to={`/video/${video._id}`} className="relative aspect-video rounded-xl overflow-hidden bg-bg-panel group-hover:rounded-none transition-all duration-300 cursor-pointer">
                  <img 
                    src={video.thumbnail?.replace('http://', 'https://')} 
                    alt={video.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs font-bold text-white tracking-wide">
                    {Math.floor((video.duration || 0) / 60)}:{(Math.floor((video.duration || 0) % 60)).toString().padStart(2, '0')}
                  </div>
                </Link>

                <div className="flex gap-3 pr-6 relative">
                  <Link to={`/profile/${video.owner?.username}`}>
                    <img 
                      src={video.owner?.avatar || 'https://via.placeholder.com/40'} 
                      alt={video.owner?.username} 
                      className="w-9 h-9 rounded-full object-cover bg-bg-panel"
                    />
                  </Link>
                  <div className="flex flex-col overflow-hidden flex-1">
                    <Link to={`/video/${video._id}`} className="font-semibold text-text-main text-base line-clamp-2 leading-tight pr-4 hover:text-primary transition-colors cursor-pointer">
                      {video.title}
                    </Link>
                    <div className="mt-1">
                      <Link to={`/profile/${video.owner?.username}`} className="text-sm text-text-muted hover:text-white transition-colors">
                        {video.owner?.username}
                      </Link>
                      <p className="text-sm text-text-muted flex items-center">
                        <span>{video.views || 0} views</span>
                        <span className="mx-1">•</span>
                        <span>{new Date(video.createdAt || Date.now()).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                      </p>
                    </div>
                  </div>

                  <div className="absolute right-0 top-0">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === video._id ? null : video._id);
                      }}
                      className="text-text-muted hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                      title="Options"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {activeMenuId === video._id && (
                      <div 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        className="absolute right-0 top-8 z-30 w-56 bg-[#282828] border border-border rounded-xl shadow-2xl py-1.5 backdrop-blur-md"
                      >
                        <button
                          onClick={(e) => handleRemoveLikedVideo(e, video._id)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-[#3f3f3f] transition-colors text-left"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                          <span>Remove from Liked videos</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LikedVideos;
