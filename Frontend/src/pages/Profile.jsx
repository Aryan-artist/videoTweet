import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { MoreVertical, Bell, Pencil } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverImageInputRef = useRef(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const channelRes = await api.get(`/users/c/${username}`);
        const channelData = channelRes.data.data;
        setProfile(channelData);
        setIsSubscribed(channelData.isSubscribed);

        if (channelData._id) {
          const videosRes = await api.get(`/videos?userId=${channelData._id}`);
          setVideos(videosRes.data.data.docs || []);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    
    if (username) {
      fetchProfileData();
    }
  }, [username]);

  const handleSubscribeToggle = async () => {
    if (!currentUser) return;
    try {
      await api.post(`/subscriptions/c/${profile._id}`);
      setIsSubscribed(!isSubscribed);
      setProfile(prev => ({
        ...prev,
        subscribersCount: isSubscribed ? prev.subscribersCount - 1 : prev.subscribersCount + 1
      }));
    } catch (error) {
    }
  };

  const handleCoverImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      const formData = new FormData();
      formData.append('coverImg', file);

      const response = await api.patch('/users/cover-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile(prev => ({
        ...prev,
        coverImg: response.data.data.coverImg
      }));
    } catch (error) {
      alert("Failed to update cover image. Please try again.");
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <div className="w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <h2 className="text-xl text-white">Channel not found</h2>
      </div>
    );
  }

  return (
    <div className="bg-bg-dark min-h-screen">
      <div className="w-full h-40 sm:h-52 md:h-64 lg:h-80 bg-bg-panel relative overflow-hidden group">
        {profile.coverImg ? (
          <img src={profile.coverImg} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-700"></div>
        )}
        
        {uploadingCover && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
             <div className="w-8 h-8 border-4 border-gray-400 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {currentUser?.username === profile.username && (
          <>
            <input 
              type="file" 
              ref={coverImageInputRef} 
              onChange={handleCoverImageChange} 
              className="hidden" 
              accept="image/*" 
            />
            <button 
              onClick={() => coverImageInputRef.current.click()}
              disabled={uploadingCover}
              className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 p-2.5 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 z-20"
              title="Edit cover image"
            >
              <Pencil className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img 
            src={profile.avatar || 'https://via.placeholder.com/150'} 
            alt={profile.username}
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-bg-dark -mt-16 sm:-mt-20 relative z-10"
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-white mb-2">{profile.fullname}</h1>
            <div className="text-text-muted flex items-center justify-center sm:justify-start gap-2 mb-4">
              <span className="font-medium text-white">@{profile.username}</span>
              <span>•</span>
              <span>{profile.subscribersCount} subscribers</span>
              <span>•</span>
              <span>{videos.length} videos</span>
            </div>
            
            {currentUser?.username !== profile.username && (
              <button 
                onClick={handleSubscribeToggle}
                className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 mx-auto sm:mx-0 ${
                  isSubscribed 
                    ? 'bg-[#272727] hover:bg-[#3f3f3f] text-white' 
                    : 'bg-white hover:bg-gray-200 text-black'
                }`}
              >
                {isSubscribed ? (
                  <>
                    <Bell className="w-5 h-5" /> Subscribed
                  </>
                ) : 'Subscribe'}
              </button>
            )}
            {currentUser?.username === profile.username && (
              <Link to="/dashboard">
                <button className="bg-[#272727] hover:bg-[#3f3f3f] text-white px-4 py-2 rounded-full font-medium transition-colors">
                  Customize channel
                </button>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-6">Videos</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-10">
            {videos.length === 0 ? (
              <div className="col-span-full py-10 text-center">
                <p className="text-text-muted">This channel has no videos.</p>
              </div>
            ) : (
              videos.map((video) => (
                <Link to={`/video/${video._id}`} key={video._id} className="group block cursor-pointer">
                  <div className="flex flex-col gap-3">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-bg-panel group-hover:rounded-none transition-all duration-300">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs font-bold text-white tracking-wide">
                        {Math.floor(video.duration / 60)}:{(Math.floor(video.duration % 60)).toString().padStart(2, '0')}
                      </div>
                    </div>

                    <div className="flex gap-3 pr-6 relative">
                      <div className="flex flex-col overflow-hidden">
                        <h3 className="font-semibold text-text-main text-base line-clamp-2 leading-tight pr-4">
                          {video.title}
                        </h3>
                        <div className="mt-1">
                          <p className="text-sm text-text-muted flex items-center">
                            <span>{video.views} views</span>
                            <span className="mx-1">•</span>
                            <span>{new Date(video.createdAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                          </p>
                        </div>
                      </div>
                      <button className="absolute right-0 top-0 text-text-main opacity-0 group-hover:opacity-100 p-1">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
