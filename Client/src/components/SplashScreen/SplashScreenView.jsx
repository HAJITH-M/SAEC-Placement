  import images from '../../assets/assets';
  import SplashScreenVM from './SplashScreenVM';

  const SplashScreenView = () => {
    const { isVisible } = SplashScreenVM();

    if (!isVisible) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <img 
          src={images.SplashIcon} 
          alt="Logo"
          className="w-64 h-64 animate-pulse" 
        />
      </div>
    );
  };

  export default SplashScreenView;