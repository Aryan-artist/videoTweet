import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, UserCircle, LogOut, Mic, Bell, Video as VideoPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-bg-dark flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="yt-icon-button">
          <Menu className="w-6 h-6" />
        </button>
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.jpg" alt="VideoTweet Logo" className="w-8 h-8 rounded-full object-cover" />
          <span className="text-xl font-bold tracking-tighter text-white">
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

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="md:hidden yt-icon-button">
          <Search className="w-6 h-6" />
        </button>
        
        {user ? (
          <>
            <Link to="/dashboard" className="hidden sm:block yt-icon-button" title="Dashboard">
              <VideoPlus className="w-6 h-6" />
            </Link>
            <button className="hidden sm:block yt-icon-button">
              <Bell className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4 ml-2">
              <Link to={`/profile/${user.username}`}>
                <img 
                  src={user.avatar || 'https://via.placeholder.com/150'} 
                  alt="avatar" 
                  className="w-8 h-8 rounded-full object-cover border border-[#3f3f3f]"
                  title="Your Profile"
                />
              </Link>
              <Link to="/settings" className="yt-icon-button" title="Settings">
                <UserCircle className="w-6 h-6" />
              </Link>
              <button 
                onClick={logout} 
                className="yt-icon-button"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <Link to="/login">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-[#3ea6ff] text-[#3ea6ff] hover:bg-[#263850] rounded-full font-medium transition-colors text-sm">
              <UserCircle className="w-5 h-5" />
              Sign in
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
