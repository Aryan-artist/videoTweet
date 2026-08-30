import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { MoreVertical, History as HistoryIcon, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const History = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    let combined = [];

    try {
      const historyKey = user ? `watch_history_${user._id}` : 'watch_history_guest';
      const localData = JSON.parse(localStorage.getItem(historyKey) || '[]');
      if (Array.isArray(localData)) {
        combined = [...localData];
      }
    } catch (e) {
    }

    if (user) {
      try {
        const response = await api.get('/users/history');
        const raw = response.data.data;
        const serverHistory = Array.isArray(raw) 
          ? raw 
          : (raw?.watchHistory || raw?.[0]?.watchHistory || []);
        
        if (Array.isArray(serverHistory)) {
          const seen = new Set(combined.map(v => v._id));
          for (const item of serverHistory) {
            if (item && item._id && !seen.has(item._id)) {
              seen.add(item._id);
              combined.push(item);
            }
          }
        }
      } catch (error) {
      }
    }

    setHistory(combined.filter(v => v && v._id && v.owner && v.owner.username));
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const [activeMenuId, setActiveMenuId] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleRemoveItem = (e, videoId) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(null);
    try {
      const historyKey = user ? `watch_history_${user._id}` : 'watch_history_guest';
      const updated = history.filter(v => v._id !== videoId);
      localStorage.setItem(historyKey, JSON.stringify(updated));
      setHistory(updated);
      toast.success("Removed from watch history");
    } catch (err) {
      toast.error("Failed to remove from history");
    }
  };

  const handleClearHistory = () => {
    if (!window.confirm("Are you sure you want to clear all watch history?")) return;
    try {
      const historyKey = user ? `watch_history_${user._id}` : 'watch_history_guest';
      localStorage.removeItem(historyKey);
      setHistory([]);
      toast.success("Watch history cleared");
    } catch (e) {
      toast.error("Failed to clear history");
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
    <div className="pb-12 bg-bg-dark min-h-screen pt-6 max-w-5xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <HistoryIcon className="w-8 h-8" /> Watch history
        </h1>
        {history.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear history</span>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {history.length === 0 ? (
          <div className="py-20 text-center">
            <h3 className="text-xl font-bold text-white mb-2">No watch history</h3>
            <p className="text-text-muted">Videos you watch will show up here</p>
          </div>
        ) : (
          history.map((video) => (
            <div 
              key={video._id} 
              className="group relative flex flex-col sm:flex-row gap-4 hover:bg-[#272727] p-2 rounded-xl transition-colors"
            >
              <Link to={`/video/${video._id}`} className="relative w-full sm:w-64 flex-shrink-0 aspect-video rounded-xl overflow-hidden bg-bg-panel cursor-pointer">
                <img 
                  src={video.thumbnail?.replace('http://', 'https://')} 
                  alt={video.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs font-bold text-white tracking-wide">
                  {Math.floor(video.duration / 60)}:{(Math.floor(video.duration % 60)).toString().padStart(2, '0')}
                </div>
              </Link>

              <div className="flex flex-col flex-1 py-1 pr-10 relative">
                <Link to={`/video/${video._id}`} className="font-medium text-text-main text-lg line-clamp-2 leading-tight hover:text-primary transition-colors cursor-pointer">
                  {video.title}
                </Link>
                <div className="mt-1 flex items-center text-sm text-text-muted">
                  <span className="hover:text-white transition-colors">{video.owner?.username || 'User'}</span>
                  <span className="mx-1">•</span>
                  <span>{video.views} views</span>
                </div>
                <p className="mt-2 text-sm text-text-muted line-clamp-2 hidden sm:block">
                  {video.description}
                </p>

                <div className="absolute right-0 top-1">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === video._id ? null : video._id);
                    }}
                    className="p-1.5 rounded-full hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                    title="Options"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {activeMenuId === video._id && (
                    <div 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      className="absolute right-0 top-8 z-30 w-60 bg-[#282828] border border-border rounded-xl shadow-2xl py-1.5 backdrop-blur-md"
                    >
                      <button
                        onClick={(e) => handleRemoveItem(e, video._id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-[#3f3f3f] transition-colors text-left"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                        <span>Remove from watch history</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
