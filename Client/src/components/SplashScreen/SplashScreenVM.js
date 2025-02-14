import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreenVM = () => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      navigate('/home');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return { isVisible };
};

export default SplashScreenVM;
