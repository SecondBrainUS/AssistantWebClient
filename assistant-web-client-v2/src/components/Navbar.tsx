import React, { useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCachedImage } from '../hooks/useCachedImage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const profileImg = useCachedImage(user?.picture ?? '', `profile-img-${user?.user_id}`);
  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center p-2 bg-gray-800 text-white">
      <div>
      <FontAwesomeIcon icon={faUser} />
      </div>
    </nav>
  )
}

export default Navbar;