import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ThumbsUp, MessageSquare, Share2, PlusSquare, Play, Trash2, Send, Check, Pencil } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import SaveToPlaylistModal from '../components/SaveToPlaylistModal';
import toast from 'react-hot-toast';

const VideoDetail = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [subscribing, setSubscribing] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [liking, setLiking] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [updatingComment, setUpdatingComment] = useState(false);
  
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const hasViewedRef = useRef(false);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handlePlay = async () => {
    setIsPlaying(true);
    if (!hasViewedRef.current) {
      hasViewedRef.current = true;
      try {
        const res = await api.post(`/videos/views/${videoId}`);
        if (res.data?.data?.views !== undefined) {
          setVideo(prev => prev ? ({ ...prev, views: res.data.data.views }) : prev);
        }
      } catch (error) {
      }
    }
  };

  const saveToHistory = (currentVideo) => {
    if (!currentVideo || !currentVideo._id) return;
    try {
      const historyKey = user ? `watch_history_${user._id}` : 'watch_history_guest';
      const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const filtered = existing.filter(item => item._id !== currentVideo._id);
      const updated = [
        {
          _id: currentVideo._id,
          title: currentVideo.title,
          description: currentVideo.description,
          thumbnail: currentVideo.thumbnail,
          duration: currentVideo.duration || 0,
          views: currentVideo.views || 0,
          owner: currentVideo.owner,
          watchedAt: new Date().toISOString(),
          createdAt: currentVideo.createdAt
        },
        ...filtered
      ];
      localStorage.setItem(historyKey, JSON.stringify(updated.slice(0, 100)));
    } catch (e) {
    }
  };

  useEffect(() => {
    hasViewedRef.current = false;
  }, [videoId]);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      setLoading(true);
      try {
        const videoRes = await api.get(`/videos/${videoId}`);
        const videoData = videoRes.data.data;
        setVideo(videoData);
        saveToHistory(videoData);

        if (user) {
          try {
            const likedRes = await api.get('/likes/videos');
            const list = likedRes.data.data || [];
            const alreadyLiked = list.some(item => (item._id === videoId || item.video?._id === videoId));
            setIsLiked(alreadyLiked);
          } catch (err) {
          }
        }

        if (videoData?.owner?.username) {
          try {
            const channelRes = await api.get(`/users/c/${videoData.owner.username}`);
            if (channelRes.data.data) {
              setIsSubscribed(channelRes.data.data.isSubscribed || false);
              setSubscribersCount(channelRes.data.data.subscribersCount || 0);
            }
          } catch (err) {
          }
        }
      } catch (error) {
        setLoading(false);
        return;
      }

      try {
        const commentsRes = await api.get(`/comments/${videoId}`);
        setComments(commentsRes.data.data.docs || []);
      } catch (error) {
      }
      
      try {
        const suggestedRes = await api.get('/videos?limit=10');
        setSuggestedVideos(suggestedRes.data.data.docs?.filter(v => v._id !== videoId) || []);
      } catch (error) {
      }
      
      setLoading(false);
    };
    if (videoId) {
      fetchVideoDetails();
    }
  }, [videoId, user]);

  const handleToggleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like this video!');
      navigate('/login');
      return;
    }
    if (liking) return;
    setLiking(true);
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount(prev => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await api.post(`/likes/toggle/v/${videoId}`);
      if (res.data?.data?.isLiked !== undefined) {
        setIsLiked(res.data.data.isLiked);
      }
      if (res.data?.data?.likesCount !== undefined) {
        setLikesCount(res.data.data.likesCount);
      }
      toast.success(nextLiked ? 'Added to Liked Videos' : 'Removed from Liked Videos');
    } catch (error) {
      setIsLiked(!nextLiked);
      setLikesCount(prev => (nextLiked ? Math.max(0, prev - 1) : prev + 1));
      toast.error(error.response?.data?.message || 'Failed to update like');
    } finally {
      setLiking(false);
    }
  };

  const handleToggleSubscribe = async () => {
    if (!user) {
      toast.error('Please sign in to subscribe!');
      navigate('/login');
      return;
    }
    if (user?._id === video?.owner?._id) {
      toast.error("You cannot subscribe to your own channel");
      return;
    }
    setSubscribing(true);
    try {
      await api.post(`/subscriptions/c/${video.owner._id}`);
      setIsSubscribed(!isSubscribed);
      setSubscribersCount(prev => (isSubscribed ? Math.max(0, prev - 1) : prev + 1));
      toast.success(isSubscribed ? 'Unsubscribed' : 'Subscribed to channel!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update subscription');
    } finally {
      setSubscribing(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to comment!');
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/comments/${videoId}`, { content: newComment.trim() });
      const addedComment = {
        ...res.data.data,
        owner: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar
        },
        createdAt: new Date().toISOString()
      };
      setComments([addedComment, ...comments]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentContent(comment.content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  const handleUpdateComment = async (commentId) => {
    if (!editCommentContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    setUpdatingComment(true);
    try {
      await api.patch(`/comments/c/${commentId}`, { content: editCommentContent.trim() });
      setComments(comments.map(c => c._id === commentId ? { 
        ...c, 
        content: editCommentContent.trim(),
        isEdited: true,
        updatedAt: new Date().toISOString()
      } : c));
      toast.success('Comment updated!');
      setEditingCommentId(null);
      setEditCommentContent('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update comment');
    } finally {
      setUpdatingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/c/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!video) return <div className="text-center mt-10">Video not found.</div>;

  const isOwner = user && video?.owner && (user._id === video.owner._id || user.username === video.owner.username);

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1320px] mx-auto w-full px-2 sm:px-4 pt-4 sm:pt-6 pb-12">
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div 
          className="relative w-full aspect-[16/9] bg-black rounded-xl overflow-hidden shadow-lg border border-border flex items-center justify-center group select-none"
        >
          <video 
            ref={videoRef}
            src={video.videoFile?.replace('http://', 'https://')} 
            poster={video.thumbnail?.replace('http://', 'https://')}
            controls 
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            onPlay={handlePlay}
            onPause={() => setIsPlaying(false)}
          />

          {!isPlaying && video.thumbnail && (
            <img 
              src={video.thumbnail?.replace('http://', 'https://')} 
              alt={video.title}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          )}

          <div 
            className="absolute inset-0 bottom-14 cursor-pointer z-10"
            onClick={togglePlayPause}
          />

          {!isPlaying && (
            <div 
              className="absolute inset-0 bottom-14 flex items-center justify-center bg-black/20 backdrop-blur-[1px] transition-all cursor-pointer z-20"
              onClick={togglePlayPause}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                type="button"
                aria-label="Play video"
                className="w-16 h-16 bg-black/75 hover:bg-black/90 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-110 shadow-2xl border border-white/20"
              >
                <Play className="w-8 h-8 text-white translate-x-0.5" fill="white" />
              </button>
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-white mt-2">{video.title}</h1>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link to={`/profile/${video.owner?.username}`}>
              <img 
                src={video.owner?.avatar || 'https://via.placeholder.com/50'} 
                alt={video.owner?.username} 
                className="w-12 h-12 rounded-full border border-border object-cover hover:opacity-90 transition-opacity"
              />
            </Link>
            <div>
              <Link to={`/profile/${video.owner?.username}`} className="font-semibold text-white hover:text-primary transition-colors">
                {video.owner?.username}
              </Link>
              <p className="text-sm text-text-muted">
                {subscribersCount} {subscribersCount === 1 ? 'subscriber' : 'subscribers'}
              </p>
            </div>
            
            {!isOwner && (
              <button 
                onClick={handleToggleSubscribe}
                disabled={subscribing}
                className={`ml-4 px-5 py-2 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 ${
                  isSubscribed 
                    ? 'bg-[#272727] text-white hover:bg-[#3f3f3f] border border-border' 
                    : 'bg-white text-black hover:bg-gray-200 shadow-md'
                }`}
              >
                {isSubscribed ? (
                  <>
                    <Check className="w-4 h-4 text-primary" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 bg-bg-panel rounded-full overflow-hidden border border-border">
            <button 
              onClick={handleToggleLike}
              disabled={liking}
              className={`flex items-center gap-2 px-4 py-2 hover:bg-bg-hover transition-colors border-r border-border ${
                isLiked ? 'text-primary font-semibold' : 'text-white'
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${isLiked ? 'text-primary fill-primary' : ''}`} /> 
              <span>{likesCount > 0 ? likesCount : 'Like'}</span>
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
              }}
              className="flex items-center gap-2 px-4 py-2 hover:bg-bg-hover transition-colors border-r border-border"
            >
              <Share2 className="w-5 h-5" /> 
              <span>Share</span>
            </button>
            <button 
              onClick={() => setIsPlaylistModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-bg-hover transition-colors"
            >
              <PlusSquare className="w-5 h-5" /> 
              <span>Save</span>
            </button>
          </div>
        </div>
        
        <div className="bg-bg-panel p-4 rounded-xl mt-4 border border-border">
          <div className="font-semibold text-sm mb-2 text-white">
            {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
          </div>
          <p className="text-sm whitespace-pre-wrap">{video.description}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <MessageSquare className="w-6 h-6 text-primary" /> 
            Comments ({comments.length})
          </h2>

          {user ? (
            <form onSubmit={handleAddComment} className="flex gap-4 mb-8">
              <img src={user.avatar || 'https://via.placeholder.com/40'} alt={user.username} className="w-10 h-10 rounded-full object-cover border border-border" />
              <div className="flex-1 flex gap-2">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..." 
                  className="flex-1 bg-transparent border-b border-border focus:border-primary outline-none py-2 transition-colors text-white placeholder-text-muted"
                />
                {newComment.trim() && (
                  <button 
                    type="submit" 
                    disabled={submittingComment}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-full font-medium transition-all text-sm flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Comment</span>
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="p-4 bg-bg-panel rounded-xl mb-8 border border-border flex items-center justify-between">
              <span className="text-text-muted text-sm">Want to join the discussion?</span>
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-1.5 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Sign In to Comment
              </button>
            </div>
          )}
          
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-text-muted">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map(comment => {
                const isCommentOwner = user && (comment.owner?._id === user._id || comment.owner?.username === user.username);
                const isEditing = editingCommentId === comment._id;
                const isEdited = Boolean(comment.isEdited || (comment.updatedAt && comment.createdAt && (new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 1500)));

                return (
                  <div key={comment._id} className="flex gap-4 group justify-between items-start">
                    <div className="flex gap-4 flex-1">
                      <Link to={`/profile/${comment.owner?.username}`}>
                        <img src={comment.owner?.avatar || 'https://via.placeholder.com/40'} alt={comment.owner?.username} className="w-10 h-10 rounded-full object-cover border border-border" />
                      </Link>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2 flex-wrap">
                          <Link to={`/profile/${comment.owner?.username}`} className="hover:text-primary transition-colors">
                            {comment.owner?.username}
                          </Link>
                          <span className="text-xs font-normal text-text-muted flex items-center gap-1.5">
                            <span>{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}</span>
                            {isEdited && (
                              <span className="text-[11px] text-text-muted font-normal italic">(edited)</span>
                            )}
                          </span>
                        </h4>

                        {isEditing ? (
                          <div className="mt-2 flex flex-col gap-2">
                            <input 
                              type="text" 
                              value={editCommentContent}
                              onChange={(e) => setEditCommentContent(e.target.value)}
                              autoFocus
                              className="w-full bg-transparent border-b border-primary focus:outline-none py-1 text-sm text-white transition-colors"
                            />
                            <div className="flex gap-2 justify-end">
                              <button 
                                type="button" 
                                onClick={handleCancelEditComment}
                                className="px-3 py-1 text-xs text-text-muted hover:text-white rounded-full hover:bg-white/10 transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleUpdateComment(comment._id)}
                                disabled={updatingComment || !editCommentContent.trim()}
                                className="px-4 py-1 text-xs bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm mt-1 text-gray-200 whitespace-pre-wrap">{comment.content}</p>
                        )}
                      </div>
                    </div>

                    {isCommentOwner && !isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleStartEditComment(comment)}
                          className="p-1.5 text-text-muted hover:text-white hover:bg-white/10 rounded-full transition-all"
                          title="Edit comment"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteComment(comment._id)}
                          className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                          title="Delete comment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[350px] xl:w-[380px] flex-shrink-0 flex flex-col gap-4">
        <h3 className="font-bold text-lg text-white">Up Next</h3>
        {suggestedVideos.length > 0 ? (
          suggestedVideos.slice(0, 10).map((suggestedVideo) => (
            <Link to={`/video/${suggestedVideo._id}`} key={suggestedVideo._id} className="flex gap-3 group cursor-pointer">
              <div className="w-40 aspect-video bg-bg-panel rounded-lg flex-shrink-0 relative overflow-hidden border border-border">
                <img src={suggestedVideo.thumbnail} alt={suggestedVideo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[10px] font-bold text-white tracking-wide">
                    {Math.floor(suggestedVideo.duration / 60)}:{(Math.floor(suggestedVideo.duration % 60)).toString().padStart(2, '0')}
                </div>
              </div>
              <div className="flex flex-col">
                <h4 className="font-semibold text-sm text-white line-clamp-2 group-hover:text-primary transition-colors">{suggestedVideo.title}</h4>
                <p className="text-xs text-text-muted mt-1">{suggestedVideo.owner?.username}</p>
                <p className="text-xs text-text-muted">{suggestedVideo.views} views</p>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-text-muted text-sm">No suggestions available.</div>
        )}
      </div>

      <SaveToPlaylistModal
        videoId={video._id}
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
      />
    </div>
  );
};

export default VideoDetail;
