import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { X, Plus, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SaveToPlaylistModal = ({ videoId, isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreate, setShowCreate] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchPlaylists();
      setShowCreate(false);
      setNewPlaylistName('');
      setNewPlaylistDescription('');
    }
  }, [isOpen, user]);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/playlist/user/${user._id}`);
      setPlaylists(res.data.data);
    } catch (error) {
      toast.error("Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVideo = async (playlistId, isAlreadyInPlaylist) => {
    try {
      if (isAlreadyInPlaylist) {
        await api.patch(`/playlist/remove/${videoId}/${playlistId}`);
        toast.success("Removed from playlist");
      } else {
        await api.patch(`/playlist/add/${videoId}/${playlistId}`);
        toast.success("Added to playlist");
      }
      setPlaylists(playlists.map(pl => {
        if (pl._id === playlistId) {
          if (isAlreadyInPlaylist) {
             return { ...pl, videos: pl.videos.filter(v => v._id !== videoId && v !== videoId) };
          } else {
             return { ...pl, videos: [...pl.videos, { _id: videoId }] };
          }
        }
        return pl;
      }));
    } catch (error) {
      toast.error("Failed to update playlist");
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      toast.error("Playlist name is required");
      return;
    }
    setCreating(true);
    try {
      const res = await api.post('/playlist', {
        name: newPlaylistName.trim(),
        description: newPlaylistDescription.trim() || `My Playlist`,
      });
      const newPlaylist = res.data.data;
      await api.patch(`/playlist/add/${videoId}/${newPlaylist._id}`);
      toast.success("Created and added to playlist!");
      
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setShowCreate(false);
      fetchPlaylists();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create playlist");
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-bg-panel border border-border w-full max-w-sm rounded-xl shadow-2xl p-6 text-center">
          <h3 className="text-lg font-bold text-white mb-2">Want to save this video?</h3>
          <p className="text-sm text-text-muted mb-6">Sign in to add this video to a playlist.</p>
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose} 
              className="px-4 py-2 text-sm text-text-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onClose();
                navigate('/login');
              }} 
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-full text-sm font-semibold transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-bg-panel border border-border w-full max-w-sm rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-medium text-white">Save to playlist</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[#272727] rounded-full text-text-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 scrollbar-thin flex-1 min-h-[150px]">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : playlists.length === 0 ? (
            <p className="text-center text-text-muted py-4 text-sm">No playlists yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {playlists.map(playlist => {
                const isChecked = playlist.videos?.some(v => v._id === videoId || v === videoId);
                
                return (
                  <label key={playlist._id} className="flex items-center gap-3 cursor-pointer group py-1">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => handleToggleVideo(playlist._id, isChecked)}
                        className="peer appearance-none w-5 h-5 border-2 border-text-muted rounded-[3px] checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                      />
                      <Check className="absolute w-4 h-4 text-bg-dark pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity left-[2px] top-[2px]" strokeWidth={3} />
                    </div>
                    <span className="text-white text-sm group-hover:text-primary transition-colors select-none line-clamp-1">{playlist.name}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border p-4">
          {!showCreate ? (
            <button 
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 text-white font-medium hover:text-primary transition-colors w-full"
            >
              <Plus className="w-5 h-5" />
              <span>Create new playlist</span>
            </button>
          ) : (
            <form onSubmit={handleCreatePlaylist} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-muted">Name *</label>
                <input 
                  type="text" 
                  autoFocus
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none text-white pb-1 text-sm transition-colors"
                  placeholder="Enter playlist name..."
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-muted">Description (optional)</label>
                <textarea 
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none text-white pb-1 text-sm transition-colors resize-none"
                  placeholder="Add description..."
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button 
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-3 py-1 text-sm font-medium text-white hover:bg-[#272727] rounded transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={creating || !newPlaylistName.trim()}
                  className="px-3 py-1 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded transition-colors disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveToPlaylistModal;
