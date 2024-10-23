import PropTypes from 'prop-types';
import { createContext, useState, useMemo } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
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
    () => ({ user, updateUser }),
    [user]
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
