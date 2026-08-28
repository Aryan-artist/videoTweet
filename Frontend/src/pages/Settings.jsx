import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Lock, Image as ImageIcon, Camera } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  
  const [accountData, setAccountData] = useState({
    fullname: user?.fullname || '',
    email: user?.email || '',
  });
  const [accountLoading, setAccountLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [imagesLoading, setImagesLoading] = useState(false);

  const handleAccountChange = (e) => {
    setAccountData({ ...accountData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (accountData.email && !emailRegex.test(accountData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setAccountLoading(true);
    try {
      await api.patch('/users/update-account', accountData);
      toast.success("Account details updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update account");
    } finally {
      setAccountLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setPasswordLoading(true);
    try {
      await api.post('/users/change-password', passwordData);
      toast.success("Password changed successfully!");
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!avatar) return;
    setImagesLoading(true);
    const data = new FormData();
    data.append('avatar', avatar);
    try {
      await api.patch('/users/avatar', data);
      toast.success("Avatar updated successfully!");
      setAvatar(null);
    } catch (error) {
      toast.error("Failed to update avatar");
    } finally {
      setImagesLoading(false);
    }
  };

  const handleUpdateCoverImage = async () => {
    if (!coverImage) return;
    setImagesLoading(true);
    const data = new FormData();
    data.append('coverImg', coverImage);
    try {
      await api.patch('/users/cover-image', data);
      toast.success("Cover image updated successfully!");
      setCoverImage(null);
    } catch (error) {
      toast.error("Failed to update cover image");
    } finally {
      setImagesLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="flex flex-col gap-8">
        <div className="bg-bg-panel border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" /> Profile Images
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="flex-1 flex flex-col items-center gap-4">
              <label className="text-sm font-medium text-text-muted">Avatar</label>
              <div className="relative group">
                <img 
                  src={avatar ? URL.createObjectURL(avatar) : (user?.avatar || 'https://via.placeholder.com/150')} 
                  alt="Avatar" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#272727]"
                />
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                >
                  <Camera className="w-8 h-8 text-white" />
                </label>
                <input 
                  type="file" 
                  id="avatar-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => setAvatar(e.target.files[0])}
                />
              </div>
              {avatar && (
                <button 
                  onClick={handleUpdateAvatar}
                  disabled={imagesLoading}
                  className="text-sm bg-primary hover:bg-primary-hover text-white px-4 py-1.5 rounded-full transition-colors disabled:opacity-50"
                >
                  {imagesLoading ? 'Uploading...' : 'Save Avatar'}
                </button>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center gap-4">
              <label className="text-sm font-medium text-text-muted">Cover Image</label>
              <div className="relative w-full h-32 bg-[#272727] rounded-xl overflow-hidden group">
                <img 
                  src={coverImage ? URL.createObjectURL(coverImage) : (user?.coverImg || 'https://via.placeholder.com/600x200')} 
                  alt="Cover" 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity"
                />
                <label 
                  htmlFor="cover-upload" 
                  className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-8 h-8 text-white" />
                </label>
                <input 
                  type="file" 
                  id="cover-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => setCoverImage(e.target.files[0])}
                />
              </div>
              {coverImage && (
                <button 
                  onClick={handleUpdateCoverImage}
                  disabled={imagesLoading}
                  className="text-sm bg-primary hover:bg-primary-hover text-white px-4 py-1.5 rounded-full transition-colors disabled:opacity-50"
                >
                  {imagesLoading ? 'Uploading...' : 'Save Cover'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-bg-panel border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Account Details
          </h2>
          <form onSubmit={handleUpdateAccount} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="fullname"
                  value={accountData.fullname}
                  onChange={handleAccountChange}
                  className="w-full bg-[#1f1f1f] border border-border rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={accountData.email}
                  onChange={handleAccountChange}
                  className="w-full bg-[#1f1f1f] border border-border rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button 
                type="submit"
                disabled={accountLoading}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-50"
              >
                {accountLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-bg-panel border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" /> Security
          </h2>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Current Password</label>
                <input 
                  type="password" 
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-[#1f1f1f] border border-border rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">New Password</label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-[#1f1f1f] border border-border rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Confirm Password</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-[#1f1f1f] border border-border rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button 
                type="submit"
                disabled={passwordLoading || !passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="bg-[#272727] hover:bg-[#3f3f3f] text-white px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-50"
              >
                {passwordLoading ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Settings;
