import { useState } from 'react';

const HomeVM = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return {
    isSidebarOpen,
    toggleSidebar
  };
};

export default HomeVM;