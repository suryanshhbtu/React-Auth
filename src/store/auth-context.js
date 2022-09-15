import React, { useCallback, useEffect, useState } from "react";

// creating context
const AuthContext = React.createContext({
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});
let logoutTimer;
// lifetime calculator
const calculateReaminingTime = (expirationTime) => {
  const currentTime = new Date().getTime();
  const adjExpirationTime = new Date(expirationTime).getTime();

  const remainingTime = adjExpirationTime - currentTime;
  return remainingTime;
};
// retrive if valid token & expiry time
const retreiveStoredToken = () => {
  const storedToken = localStorage.getItem("token");
  const storedExpirationDate = localStorage.getItem("expirationTime");

  const remainingTime = calculateReaminingTime(storedExpirationDate);
  if (remainingTime <= 4000) {
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");
    return null;
  }
  return { token: storedToken, duration: remainingTime };
};

// Context Provider
export const AuthContextProvider = (props) => {
  const tokenData = retreiveStoredToken();  // retriving localStoreage token
  
  let initialToken;
  if(tokenData){  // checking null
     initialToken = tokenData.token;
  }

  const [token, setToken] = useState(initialToken);  // initiating token useState

  const userIsLoggedIn = !!token;  // js trick to check token is null or not -> true if not null

  const loginHandler = (token, expirationTime) => {
    localStorage.setItem("token", token);
    setToken(token);
    console.log(token+" -- ye wala");
    // storing token and expirey time to localStorage for a specific time period
   
    localStorage.setItem("expirationTime", expirationTime);
   
    const remainingTime = calculateReaminingTime(expirationTime);

    logoutTimer = setTimeout(logoutHandler, remainingTime); // setting logoutTimer
  };

  const logoutHandler = useCallback(() => {
    setToken(null);
    // localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");
    if (logoutTimer) {
      clearTimeout(logoutTimer);  // clearing earlier logoutTimer
    }
  },[]);

  useEffect(()=>{
    // time change -> reexecute -> real-time security
    if(tokenData){
      console.log(tokenData.duration);
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  },[tokenData, logoutHandler]);

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  // wrapping provider
  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
