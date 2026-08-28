import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, PlusSquare, PlaySquare, ListVideo } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const links = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: MessageSquare, label: 'Tweets', path: '/tweets' },
    { icon: PlusSquare, label: 'Upload', path: '/dashboard', special: true },
    { icon: PlaySquare, label: 'Subscriptions', path: '/subscriptions' },
    { icon: ListVideo, label: 'Playlists', path: '/playlists' },
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-bg-dark border-t border-[#3f3f3f] h-14 z-50 flex items-center justify-around px-2">
      {links.map((item) => {
        const isActive = location.pathname === item.path;
        
        if (item.special) {
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className="flex flex-col items-center justify-center -mt-4"
            >
              <div className="bg-primary text-white p-3 rounded-full shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                <item.icon className="w-6 h-6" />
              </div>
            </Link>
          );
        }
        
        return (
          <Link 
            key={item.path} 
            to={item.path}
            className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${isActive ? 'text-white' : 'text-text-muted hover:text-white'}`}
          >
            <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-white/20' : ''}`} strokeWidth={isActive ? 2 : 1.5} />
            <span className="text-[10px] truncate w-full text-center">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNav;
