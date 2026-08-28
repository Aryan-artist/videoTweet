import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullname: '',
    password: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'avatar') {
      setAvatar(e.target.files[0]);
    } else if (e.target.name === 'coverImage') {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!avatar) {
      toast.error('Avatar is required!');
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('fullname', formData.fullname);
      data.append('password', formData.password);
      data.append('avatar', avatar);
      if (coverImage) {
        data.append('coverImage', coverImage);
      }

      await api.post('/users/register', data);
      
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4 font-sans py-12">
      <div className="w-full max-w-md bg-bg-panel border border-[#303030] rounded-xl p-8 sm:p-10">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.jpg" alt="VideoTweet Logo" className="w-14 h-14 rounded-full object-cover mb-4" />
          <h2 className="text-2xl font-medium text-white mb-2 tracking-wide">Create your account</h2>
          <p className="text-text-main">to continue to VideoTweet</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative group">
              <input 
                type="text" 
                name="fullname"
                required
                value={formData.fullname}
                onChange={handleChange}
                className="w-full bg-transparent border border-[#555] rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#3ea6ff] focus:ring-1 focus:ring-[#3ea6ff] transition-colors peer"
                placeholder=" "
              />
              <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-all duration-200 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-bg-panel peer-focus:px-1 peer-focus:text-[#3ea6ff] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-bg-panel peer-[:not(:placeholder-shown)]:px-1 pointer-events-none">
                First & Last name
              </label>
            </div>
            
            <div className="relative group">
              <input 
                type="text" 
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-transparent border border-[#555] rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#3ea6ff] focus:ring-1 focus:ring-[#3ea6ff] transition-colors peer"
                placeholder=" "
              />
              <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-all duration-200 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-bg-panel peer-focus:px-1 peer-focus:text-[#3ea6ff] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-bg-panel peer-[:not(:placeholder-shown)]:px-1 pointer-events-none">
                Username
              </label>
            </div>
          </div>

          <div>
            <div className="relative group">
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-transparent border border-[#555] rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#3ea6ff] focus:ring-1 focus:ring-[#3ea6ff] transition-colors peer"
                placeholder=" "
              />
              <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-all duration-200 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-bg-panel peer-focus:px-1 peer-focus:text-[#3ea6ff] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-bg-panel peer-[:not(:placeholder-shown)]:px-1 pointer-events-none">
                Email address
              </label>
            </div>
          </div>
          
          <div>
            <div className="relative group">
              <input 
                type="password" 
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-transparent border border-[#555] rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#3ea6ff] focus:ring-1 focus:ring-[#3ea6ff] transition-colors peer"
                placeholder=" "
              />
              <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-all duration-200 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-bg-panel peer-focus:px-1 peer-focus:text-[#3ea6ff] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-bg-panel peer-[:not(:placeholder-shown)]:px-1 pointer-events-none">
                Password
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="relative flex items-center justify-center w-full h-14 bg-transparent border border-[#555] rounded-lg hover:border-[#3ea6ff] transition-colors overflow-hidden group cursor-pointer">
                <input 
                  type="file" 
                  name="avatar"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center gap-1 text-text-muted group-hover:text-[#3ea6ff] transition-colors">
                  <Upload className="w-5 h-5" />
                  <span className="text-[10px] font-medium tracking-wide truncate max-w-[120px] px-2">
                    {avatar ? avatar.name : 'Upload Avatar *'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="relative flex items-center justify-center w-full h-14 bg-transparent border border-[#555] rounded-lg hover:border-[#3ea6ff] transition-colors overflow-hidden group cursor-pointer">
                <input 
                  type="file" 
                  name="coverImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center gap-1 text-text-muted group-hover:text-[#3ea6ff] transition-colors">
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-[10px] font-medium tracking-wide truncate max-w-[120px] px-2">
                    {coverImage ? coverImage.name : 'Cover (Optional)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-8 pt-4">
            <Link to="/login" className="text-[#3ea6ff] hover:text-[#5eb1ff] font-medium transition-colors text-sm">
              Sign in instead
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

export default Signup;
