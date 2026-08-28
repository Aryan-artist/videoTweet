import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ListVideo, Plus, Trash2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const Playlists = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  const fetchPlaylists = async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/playlist/user/${user._id}`);
      setPlaylists(res.data?.data || []);
    } catch (error) {
      if (user?._id) {
        toast.error(error.response?.data?.message || "Failed to load playlists");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [user?._id]);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylist.name?.trim()) {
      toast.error("Playlist name is required");
      return;
    }
    setCreating(true);
    try {
      await api.post('/playlist', {
        name: newPlaylist.name.trim(),
        description: newPlaylist.description?.trim() || "My Playlist"
      });
      toast.success("Playlist created!");
      setIsCreateOpen(false);
      setNewPlaylist({ name: '', description: '' });
      fetchPlaylists();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create playlist");
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm("Are you sure you want to delete this playlist?")) return;
    try {
      await api.delete(`/playlist/${playlistId}`);
      toast.success("Playlist deleted");
      fetchPlaylists();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete playlist");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <div className="w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center mt-20 px-4">
        <h2 className="text-2xl font-bold text-white mb-4">You need to sign in to see your playlists!</h2>
        <Link to="/login" className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full font-bold transition-colors inline-block">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-12 bg-bg-dark min-h-screen pt-6 max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-bg-panel rounded-full">
            <ListVideo className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Your Playlists</h1>
            <p className="text-text-muted text-sm">Organize your favorite videos</p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" /> New Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="py-20 text-center border border-border rounded-xl bg-bg-panel">
          <ListVideo className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No playlists created yet</h3>
          <p className="text-text-muted">Click the button above to create your first playlist</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {playlists.map((playlist) => {
            const firstVideo = playlist.videos && playlist.videos.length > 0 && typeof playlist.videos[0] === 'object' ? playlist.videos[0] : null;
            const targetUrl = firstVideo?._id ? `/video/${firstVideo._id}` : '#';

            return (
              <div key={playlist._id} className="bg-bg-panel border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors group flex flex-col">
                <Link to={targetUrl} className="relative aspect-video bg-[#272727] flex items-center justify-center overflow-hidden cursor-pointer">
                  {firstVideo?.thumbnail ? (
                    <img 
                      src={firstVideo.thumbnail?.replace('http://', 'https://')} 
                      alt={playlist.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5 text-text-muted">
                      <ListVideo className="w-10 h-10" />
                      <span className="text-xs">No Videos</span>
                    </div>
                  )}
                  {firstVideo && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/85 px-2 py-1 rounded text-xs text-white font-medium flex items-center gap-1">
                    <ListVideo className="w-3 h-3" />
                    {playlist.videos?.length || 0} videos
                  </div>
                </Link>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white line-clamp-1 flex-1">{playlist.name}</h3>
                    <button 
                      onClick={() => handleDeletePlaylist(playlist._id)}
                      className="text-text-muted hover:text-red-500 transition-colors ml-2"
                      title="Delete playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-text-muted line-clamp-2 mb-4">{playlist.description}</p>
                  <div className="mt-auto text-xs text-text-muted">
                    Updated {new Date(playlist.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-bg-dark border border-border w-full max-w-md rounded-xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Create New Playlist</h2>
            <form onSubmit={handleCreatePlaylist} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Name</label>
                <input 
                  type="text" 
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({...newPlaylist, name: e.target.value})}
                  className="w-full bg-[#1f1f1f] border border-border rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                  placeholder="E.g., Favorite Music"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Description (Optional)</label>
                <textarea 
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})}
                  className="w-full min-h-[100px] bg-[#1f1f1f] border border-border rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors resize-none"
                  placeholder="What is this playlist about? (optional)"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-full font-medium text-white hover:bg-[#272727] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={creating || !newPlaylist.name?.trim()}
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists;
