import { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: '',
    location: null,
  });

  const updateUser = (newUserInfo) => {
    console.log('updateUser', { newUserInfo });
    setUser((prevUser) => ({
      ...prevUser,
      ...newUserInfo,
      location: {
        ...prevUser.location,
        ...newUserInfo.location,
      },
    }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
