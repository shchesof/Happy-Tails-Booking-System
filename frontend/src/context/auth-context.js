import React from 'react';

// central storage
export default React.createContext({
    token: null,
    userId: null,
    login: (token, userId, tokenExpiration) => {},
    logout: () => {}
});