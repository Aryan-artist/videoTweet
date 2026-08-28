import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 pt-14">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`flex-1 w-full px-4 sm:px-6 lg:px-8 pb-16 sm:pb-0 transition-all duration-200 ${isSidebarOpen ? 'sm:ml-60' : 'sm:ml-[72px]'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default Layout;
