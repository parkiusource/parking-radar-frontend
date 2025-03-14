import PropTypes from 'prop-types';
import { createContext, useState, useMemo } from 'react';
import { useInitAuth0Client } from '@/hooks/useInitAuth0Client';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const auth0 = useInitAuth0Client();
  const [user, setUser] = useState({
    name: '',
    location: null,
  });

  const updateUser = (newUserInfo) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...newUserInfo,
      location: {
        ...prevUser.location,
        ...newUserInfo.location,
      },
    }));
  };

  const value = useMemo(
    () => ({ user, updateUser, auth0 }),
    [user, auth0]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
