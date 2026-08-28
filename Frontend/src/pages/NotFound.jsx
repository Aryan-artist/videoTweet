import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] bg-bg-dark text-text-main text-center px-4">
      <img 
        src="https://www.gstatic.com/youtube/src/web/htdocs/img/monkey.png" 
        alt="Monkey" 
        className="w-48 h-auto mb-6 opacity-90 grayscale"
      />
      <p className="text-base text-text-main mb-6">
        This page isn't available. Sorry about that.<br />
        Try searching for something else.
      </p>
      
      <div className="flex items-center bg-bg-dark border border-[#303030] rounded-full overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 max-w-md w-full mb-8">
        <input 
          type="text" 
          placeholder="Search VideoTweet" 
          className="flex-1 bg-transparent px-4 py-2 outline-none text-text-main text-base"
        />
        <button className="px-5 py-2 bg-[#222222] border-l border-[#303030] hover:bg-[#303030] transition-colors">
          <Search className="w-5 h-5 text-text-main" />
        </button>
      </div>

      <Link to="/">
        <button className="border border-[#3ea6ff] text-[#3ea6ff] px-4 py-2 rounded-full font-medium hover:bg-[#263850] transition-colors">
          Go to Home
        </button>
      </Link>
    </div>
  );
};

export default NotFound;
