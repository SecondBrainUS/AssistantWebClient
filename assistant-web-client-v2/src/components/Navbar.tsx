import React, { useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCachedImage } from '../hooks/useCachedImage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const profileImg = useCachedImage(user?.picture ?? '', `profile-img-${user?.user_id}`);
  // 
  return (
    <nav className="sticky top-0 z-50 flex p-2 text-white bg-gray-800 justify-between items-center">
        <div className="flex items-center">
          <img src="./mush-v2-logo.png" alt="Logo" className="h-7 mr-3 ml-2" />
          <h1 className="text-lg">Second Brain</h1>
        </div>
        <div className="flex items-center">
          <FontAwesomeIcon icon={faUser} />
        </div>
    </nav>
  )
}

export default Navbar;