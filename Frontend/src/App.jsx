import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VideoDetail from './pages/VideoDetail';
import Tweets from './pages/Tweets';
import NotFound from './pages/NotFound';
import LikedVideos from './pages/LikedVideos';
import History from './pages/History';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import Settings from './pages/Settings';
import Playlists from './pages/Playlists';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="video/:videoId" element={<VideoDetail />} />
          <Route path="tweets" element={<Tweets />} />
          <Route path="profile/:username" element={<Profile />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="history" element={<History />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="liked-videos" element={<LikedVideos />} />
          <Route path="settings" element={<Settings />} />
          <Route path="playlists" element={<Playlists />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
