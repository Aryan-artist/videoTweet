import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Heart, Trash2, Pencil, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Tweets = () => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTweet, setNewTweet] = useState('');
  
  const [comments, setComments] = useState({});
  const [activeCommentTweet, setActiveCommentTweet] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  
  const [editingTweetId, setEditingTweetId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const { user } = useAuth();

  const fetchTweets = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get('/tweets');
      setTweets(response.data.data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, [user]);

  const handleCreateTweet = async (e) => {
    e.preventDefault();
    if (!newTweet.trim()) return;
    
    try {
      await api.post('/tweets', { content: newTweet });
      toast.success('Tweet posted!');
      setNewTweet('');
      fetchTweets();
    } catch (error) {
      toast.error('Failed to post tweet');
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    if (!window.confirm("Delete this tweet?")) return;
    try {
      await api.delete(`/tweets/${tweetId}`);
      toast.success('Tweet deleted!');
      fetchTweets();
    } catch (error) {
      toast.error('Failed to delete tweet');
    }
  };

  const handleEditSubmit = async (e, tweetId) => {
    e.preventDefault();
    if (!editingContent.trim()) return;
    try {
      await api.patch(`/tweets/${tweetId}`, { content: editingContent });
      toast.success('Tweet updated!');
      setEditingTweetId(null);
      fetchTweets();
    } catch (error) {
      toast.error('Failed to update tweet');
    }
  };

  const handleToggleLike = async (tweetId) => {
    if (!user) {
      toast.error("Please login to like tweets!");
      return;
    }
    try {
      await api.post(`/likes/toggle/t/${tweetId}`);
      setTweets(tweets.map(t => {
        if (t._id === tweetId) {
          return {
            ...t,
            isLiked: !t.isLiked,
            likesCount: t.isLiked ? (t.likesCount || 1) - 1 : (t.likesCount || 0) + 1
          };
        }
        return t;
      }));
    } catch (error) {
      toast.error('Failed to toggle like');
    }
  };

  const handleToggleComments = async (tweetId) => {
    if (activeCommentTweet === tweetId) {
      setActiveCommentTweet(null);
      return;
    }
    
    setActiveCommentTweet(tweetId);
    if (!comments[tweetId]) {
      setCommentsLoading(true);
      try {
        const res = await api.get(`/comments/t/${tweetId}`);
        setComments(prev => ({ ...prev, [tweetId]: res.data.data.docs || [] }));
      } catch (error) {
        toast.error('Failed to load comments');
      } finally {
        setCommentsLoading(false);
      }
    }
  };

  const handleAddComment = async (e, tweetId) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to comment!");
      return;
    }
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/comments/t/${tweetId}`, { content: newComment.trim() });
      const addedComment = {
        ...res.data?.data,
        owner: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          fullname: user.fullname
        },
        createdAt: res.data?.data?.createdAt || new Date().toISOString()
      };
      setComments(prev => ({
        ...prev,
        [tweetId]: [addedComment, ...(prev[tweetId] || [])]
      }));
      setNewComment('');
      setTweets(tweets.map(t => {
        if (t._id === tweetId) {
          return { ...t, commentsCount: (t.commentsCount || 0) + 1 };
        }
        return t;
      }));
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center mt-20 px-4">
        <h2 className="text-2xl font-bold text-white mb-4">You need to sign in to see tweets!</h2>
        <Link to="/login" className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full font-bold transition-colors inline-block">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white px-2">Global Tweets</h1>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-panel border border-border rounded-xl p-3 sm:p-4 mb-6 sm:mb-8 shadow-sm"
      >
        <div className="flex gap-2.5 sm:gap-4">
          <img 
            src={user.avatar || 'https://via.placeholder.com/50'} 
            alt="Avatar" 
            className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-border object-cover flex-shrink-0"
          />
          <form onSubmit={handleCreateTweet} className="flex-1 min-w-0 flex flex-col gap-3">
            <textarea 
              value={newTweet}
              onChange={(e) => setNewTweet(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-transparent resize-none outline-none text-white placeholder-text-muted text-base sm:text-lg min-h-[70px] sm:min-h-[80px]"
            />
            <div className="flex justify-end pt-2 border-t border-border">
              <button 
                type="submit" 
                disabled={!newTweet.trim()}
                className="bg-primary hover:bg-primary-hover text-white px-5 sm:px-6 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tweet
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      <div className="space-y-3 sm:space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tweets.length === 0 ? (
          <div className="text-center text-text-muted py-10 border border-border rounded-xl bg-bg-panel">
            No tweets found! Be the first to tweet.
          </div>
        ) : (
          tweets.map((tweet, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={tweet._id} 
              className="bg-bg-panel border border-border rounded-xl p-3 sm:p-4 hover:bg-bg-hover transition-colors overflow-hidden"
            >
              <div className="flex gap-2.5 sm:gap-4">
                <img 
                  src={tweet.ownerDetails?.avatar || 'https://via.placeholder.com/50'} 
                  alt={tweet.ownerDetails?.username || 'User'} 
                  className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-border object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
                      <h3 className="font-bold text-white text-sm sm:text-base truncate">{tweet.ownerDetails?.username || 'Unknown'}</h3>
                      <span className="text-text-muted text-xs sm:text-sm truncate">
                        @{tweet.ownerDetails?.username || 'user'} • {new Date(tweet.createdAt).toLocaleDateString()}
                        {tweet.createdAt !== tweet.updatedAt && (
                          <span className="ml-1 italic text-[11px] text-text-muted">(edited)</span>
                        )}
                      </span>
                    </div>
                    
                    {user && tweet.ownerDetails?._id === user._id && (
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <button 
                          onClick={() => {
                            setEditingTweetId(tweet._id);
                            setEditingContent(tweet.content);
                          }}
                          className="text-text-muted hover:text-blue-500 p-1 transition-colors rounded-full hover:bg-blue-500/10"
                          title="Edit Tweet"
                        >
                          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTweet(tweet._id)}
                          className="text-text-muted hover:text-red-500 p-1 transition-colors rounded-full hover:bg-red-500/10"
                          title="Delete Tweet"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {editingTweetId === tweet._id ? (
                    <form onSubmit={(e) => handleEditSubmit(e, tweet._id)} className="mt-2">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full bg-bg-dark border border-border rounded-lg p-2.5 sm:p-3 text-sm sm:text-base text-white focus:border-primary outline-none resize-none"
                        rows="3"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button 
                          type="button" 
                          onClick={() => setEditingTweetId(null)}
                          className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-text-muted hover:bg-bg-dark transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          disabled={!editingContent.trim() || editingContent === tweet.content}
                          className="bg-primary hover:bg-primary-hover text-white px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-white mt-2 text-sm sm:text-base whitespace-pre-wrap break-words">{tweet.content}</p>
                  )}
                  
                  <div className="flex items-center gap-6 mt-3 sm:mt-4 text-text-muted">
                    <button 
                      onClick={() => handleToggleComments(tweet._id)}
                      className="flex items-center gap-1.5 sm:gap-2 hover:text-primary transition-colors group"
                    >
                      <div className={`p-1.5 sm:p-2 rounded-full transition-colors ${activeCommentTweet === tweet._id ? 'bg-primary/20 text-primary' : 'group-hover:bg-primary/10'}`}>
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm">{tweet.commentsCount || 0}</span>
                    </button>
                    
                    <button 
                      onClick={() => handleToggleLike(tweet._id)}
                      className={`flex items-center gap-1.5 sm:gap-2 transition-colors group ${tweet.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                    >
                      <div className={`p-1.5 sm:p-2 rounded-full transition-colors ${tweet.isLiked ? 'bg-red-500/20' : 'group-hover:bg-red-500/10'}`}>
                        <Heart className={`w-4 h-4 ${tweet.isLiked ? 'fill-current' : ''}`} />
                      </div>
                      <span className="text-xs sm:text-sm">{tweet.likesCount || 0}</span>
                    </button>
                  </div>

                  <AnimatePresence>
                    {activeCommentTweet === tweet._id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border overflow-hidden"
                      >
                        <form onSubmit={(e) => handleAddComment(e, tweet._id)} className="flex items-center gap-2 mb-3 sm:mb-4 w-full">
                          <img 
                            src={user?.avatar || 'https://via.placeholder.com/32'} 
                            alt="Avatar" 
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0 flex items-center gap-1.5 bg-bg-dark border border-border rounded-full px-3 py-1 focus-within:border-primary transition-colors">
                            <input
                              type="text"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder={user ? "Add a comment..." : "Log in to comment..."}
                              disabled={!user}
                              className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-white placeholder-text-muted focus:outline-none disabled:opacity-50 py-1"
                            />
                            {newComment.trim() && (
                              <button 
                                type="submit"
                                disabled={!user || !newComment.trim()}
                                className="bg-primary hover:bg-primary-hover text-white px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50 flex-shrink-0 flex items-center gap-1"
                              >
                                <span>Reply</span>
                                <Send className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </form>

                        {commentsLoading ? (
                          <div className="flex justify-center py-4">
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {comments[tweet._id]?.length === 0 ? (
                              <p className="text-center text-xs sm:text-sm text-text-muted py-2">No comments yet. Be the first!</p>
                            ) : (
                              comments[tweet._id]?.map(comment => (
                                <div key={comment._id} className="flex gap-2 sm:gap-3">
                                  <img 
                                    src={comment.owner?.avatar || 'https://via.placeholder.com/32'} 
                                    alt="Avatar" 
                                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-border object-cover flex-shrink-0 mt-1"
                                  />
                                  <div className="flex-1 min-w-0 bg-bg-dark/50 rounded-xl p-2 sm:p-2.5">
                                    <div className="flex items-baseline gap-2">
                                      <span className="font-bold text-white text-xs sm:text-sm truncate">
                                        {comment.owner?.username || 'Unknown'}
                                      </span>
                                      <span className="text-[10px] sm:text-xs text-text-muted flex-shrink-0">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-300 mt-0.5 break-words">{comment.content}</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tweets;
