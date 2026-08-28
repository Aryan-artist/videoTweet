import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlaySquare } from 'lucide-react';

const Subscriptions = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }
      
      try {
        setError(null);
        const response = await api.get(`/subscriptions/u/${user._id}`);
        const allChannels = response.data?.data?.channels || [];
        // Filter out any invalid / deleted channels to prevent crashes
        const validChannels = allChannels.filter((sub) => sub && sub.channel);
        setChannels(validChannels);
      } catch (err) {
        console.error("Failed to fetch subscriptions", err);
        setError(err.response?.data?.message || "Failed to load subscriptions.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, [user?._id]);

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
        <h2 className="text-2xl font-bold text-white mb-4">You need to sign in to see your subscriptions!</h2>
        <Link to="/login" className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full font-bold transition-colors inline-block">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-12 bg-bg-dark min-h-screen pt-6 max-w-5xl mx-auto px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-bg-panel rounded-full">
          <PlaySquare className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
          <p className="text-text-muted text-sm">Channels you follow</p>
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-center">
          {error}
        </div>
      ) : channels.length === 0 ? (
        <div className="py-20 text-center border border-border rounded-xl bg-bg-panel">
          <h3 className="text-xl font-bold text-white mb-2">No subscriptions yet</h3>
          <p className="text-text-muted">Channels you subscribe to will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {channels.map((sub) => {
            const channel = sub.channel;
            if (!channel) return null;
            return (
              <Link 
                to={`/profile/${channel.username}`} 
                key={sub._id || channel._id} 
                className="group bg-bg-panel border border-border rounded-xl p-6 flex flex-col items-center hover:bg-bg-hover transition-colors"
              >
                <img 
                  src={channel.avatar?.replace('http://', 'https://') || 'https://via.placeholder.com/100'} 
                  alt={channel.username || 'Channel'} 
                  className="w-24 h-24 rounded-full object-cover mb-4 group-hover:scale-105 transition-transform"
                />
                <h3 className="text-lg font-bold text-white truncate w-full text-center">{channel.username}</h3>
                <p className="text-text-muted text-sm">{channel.fullname || 'View Channel'}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
