import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let loginData = { password };

    if (identifier.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier)) {
        toast.error('Please enter a valid email address');
        return;
      }
      loginData.email = identifier;
    } else {
      if (identifier.trim().length < 3) {
        toast.error('Username must be at least 3 characters');
        return;
      }
      loginData.username = identifier;
    }

    setLoading(true);
    const success = await login(loginData);
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-bg-panel border border-[#303030] rounded-xl p-8 sm:p-10">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.jpg" alt="VideoTweet Logo" className="w-14 h-14 rounded-full object-cover mb-4" />
          <h2 className="text-2xl font-medium text-white mb-2 tracking-wide">Sign in</h2>
          <p className="text-text-main">to continue to VideoTweet</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="relative group">
              <input 
                type="text" 
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-transparent border border-[#555] rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#3ea6ff] focus:ring-1 focus:ring-[#3ea6ff] transition-colors peer"
                placeholder=" "
              />
              <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-all duration-200 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-bg-panel peer-focus:px-1 peer-focus:text-[#3ea6ff] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-bg-panel peer-[:not(:placeholder-shown)]:px-1 pointer-events-none">
                Email or Username
              </label>
            </div>
          </div>
          <div>
            <div className="relative group">
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-[#555] rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#3ea6ff] focus:ring-1 focus:ring-[#3ea6ff] transition-colors peer"
                placeholder=" "
              />
              <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-all duration-200 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-bg-panel peer-focus:px-1 peer-focus:text-[#3ea6ff] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-bg-panel peer-[:not(:placeholder-shown)]:px-1 pointer-events-none">
                Password
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-8 pt-4">
            <Link to="/signup" className="text-[#3ea6ff] hover:text-[#5eb1ff] font-medium transition-colors text-sm">
              Create account
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#3ea6ff] hover:bg-[#5eb1ff] text-[#0f0f0f] font-medium py-2 px-6 rounded-md transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#0f0f0f] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Next'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
