import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, UserCircle, LogOut, Mic, Bell, Video as VideoPlus, ArrowLeft, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-bg-dark flex items-center justify-between px-3 sm:px-4 z-50 border-b border-border/40">
      {isMobileSearchOpen ? (
        <div className="flex items-center w-full gap-2">
          <button 
            type="button"
            onClick={() => setIsMobileSearchOpen(false)} 
            className="yt-icon-button flex-shrink-0"
            title="Back"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>

          <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center bg-[#181818] border border-[#383838] rounded-full overflow-hidden focus-within:border-blue-500">
            <input 
              type="text" 
              placeholder="Search VideoTweet" 
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent px-4 py-2 outline-none text-text-main text-sm"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="p-1.5 text-text-muted hover:text-white"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button type="submit" className="px-4 py-2 bg-[#222222] border-l border-[#383838] hover:bg-[#303030] transition-colors" title="Search">
              <Search className="w-4 h-4 text-text-main" />
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={toggleSidebar} className="hidden sm:flex yt-icon-button" title="Menu">
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/logo.jpg" alt="VideoTweet Logo" className="w-8 h-8 rounded-full object-cover" />
              <span className="text-lg sm:text-xl font-bold tracking-tighter text-white">
                VideoTweet<sup className="text-[10px] text-text-muted font-normal ml-1">IN</sup>
              </span>
            </Link>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl px-8 hidden md:flex items-center gap-4">
            <div className="flex flex-1 items-center bg-bg-dark border border-[#303030] rounded-full overflow-hidden focus-within:border-blue-500 focus-within:ml-0 transition-all ml-8">
              <div className="hidden focus-within:block pl-4">
                <Search className="w-4 h-4 text-text-muted" />
              </div>
              <input 
                type="text" 
                placeholder="Search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent px-4 py-2 outline-none text-text-main text-base"
              />
              <button type="submit" className="px-5 py-2 bg-[#222222] border-l border-[#303030] hover:bg-[#303030] transition-colors">
                <Search className="w-5 h-5 text-text-main" />
              </button>
            </div>
            <button type="button" className="p-2.5 bg-[#181818] hover:bg-[#303030] rounded-full transition-colors flex-shrink-0">
              <Mic className="w-5 h-5 text-text-main" />
            </button>
          </form>

          <div className="flex items-center gap-1 sm:gap-4">
            <button 
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden yt-icon-button"
              title="Search"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            {user ? (
              <>
                <Link to="/dashboard" className="hidden sm:block yt-icon-button" title="Dashboard">
                  <VideoPlus className="w-6 h-6" />
                </Link>
                <button className="hidden sm:block yt-icon-button">
                  <Bell className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2 sm:gap-4 ml-1 sm:ml-2">
                  <Link to={`/profile/${user.username}`}>
                    <img 
                      src={user.avatar || 'https://via.placeholder.com/150'} 
                      alt="avatar" 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#3f3f3f]"
                      title="Your Profile"
                    />
                  </Link>
                  <Link to="/settings" className="yt-icon-button" title="Settings">
                    <UserCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Link>
                  <button 
                    onClick={logout} 
                    className="yt-icon-button"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 border border-[#3ea6ff] text-[#3ea6ff] hover:bg-[#263850] rounded-full font-medium transition-colors text-xs sm:text-sm">
                  <UserCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Sign in
                </div>
              </Link>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
