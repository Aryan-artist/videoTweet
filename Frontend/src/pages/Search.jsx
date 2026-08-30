import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MoreVertical } from 'lucide-react';
import VideoGridSkeleton from '../components/VideoGridSkeleton';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/videos?query=${encodeURIComponent(query)}`);
        const allVideos = response.data?.data?.docs || [];
        const validVideos = allVideos.filter(v => v && v.owner && v.owner.username);
        setVideos(validVideos);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    } else {
      setVideos([]);
      setLoading(false);
    }
  }, [query]);

  if (loading) {
    return (
      <div className="pb-12 bg-bg-dark min-h-screen pt-4 px-6">
        <h2 className="text-xl font-bold text-white mb-6">Search results for "{query}"</h2>
        <VideoGridSkeleton count={8} />
      </div>
    );
  }

  return (
    <div className="pb-12 bg-bg-dark min-h-screen pt-4 px-4 sm:px-6">
      <h2 className="text-xl font-bold text-white mb-6">Search results for "{query}"</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-10">
        {videos.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <h3 className="text-xl font-bold text-white mb-2">No videos found</h3>
            <p className="text-text-muted">Try searching with different keywords.</p>
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
                  <div 
                    onClick={(e) => { e.preventDefault(); navigate(`/profile/${video.owner?.username}`); }}
                    className="cursor-pointer"
                  >
                    <img 
                      src={video.owner?.avatar || 'https://via.placeholder.com/40'} 
                      alt={video.owner?.username} 
                      className="w-9 h-9 rounded-full object-cover bg-bg-panel"
                    />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <h3 className="font-semibold text-text-main text-base line-clamp-2 leading-tight pr-4">
                      {video.title}
                    </h3>
                    <div className="mt-1">
                      <div 
                        onClick={(e) => { e.preventDefault(); navigate(`/profile/${video.owner?.username}`); }}
                        className="text-sm text-text-muted hover:text-white transition-colors cursor-pointer"
                      >
                        {video.owner?.username}
                      </div>
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
  );
};

export default Search;
