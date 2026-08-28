import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, PlaySquare, Clock, ThumbsUp, Compass, Play, MonitorPlay, History, Users, ListVideo } from 'lucide-react';

const mainLinks = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: MessageSquare, label: 'Tweets', path: '/tweets' },
  { icon: PlaySquare, label: 'Subscriptions', path: '/subscriptions' },
  { icon: ListVideo, label: 'Playlists', path: '/playlists' },
];

const secondaryLinks = [
  { icon: History, label: 'History', path: '/history' },
  { icon: MonitorPlay, label: 'Your videos', path: '/dashboard' },
  { icon: ThumbsUp, label: 'Liked videos', path: '/liked-videos' },
];

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  const renderLinks = (links) => (
    links.map((item) => {
      const isActive = location.pathname === item.path;
      return (
        <Link 
          key={item.path} 
          to={item.path}
          className={`flex items-center ${isOpen ? 'flex-row gap-5 px-3 py-2.5 rounded-lg' : 'flex-col gap-1 py-4 px-1 rounded-lg justify-center'} transition-colors ${isActive ? 'bg-bg-panel font-medium' : 'hover:bg-bg-panel'}`}
        >
          <item.icon className={`${isOpen ? 'w-6 h-6' : 'w-6 h-6'} flex-shrink-0 ${isActive ? 'text-white fill-white/20' : 'text-text-main'}`} strokeWidth={isActive ? 2 : 1.5} />
          <span className={`${isOpen ? 'text-sm' : 'text-[10px]'} text-text-main truncate`}>
            {item.label}
          </span>
        </Link>
      );
    })
  );

  return (
    <aside 
      className={`fixed left-0 top-14 bottom-0 bg-bg-dark border-r border-transparent overflow-y-auto hidden sm:block z-40 transition-all duration-200 ${isOpen ? 'w-60 px-3' : 'w-[72px] px-1'} scrollbar-thin`}
    >
      <div className="flex flex-col py-3">
        {renderLinks(mainLinks)}
        
        {isOpen && (
          <>
            <hr className="border-[#3f3f3f] my-3 mx-2" />
            {renderLinks(secondaryLinks)}
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
