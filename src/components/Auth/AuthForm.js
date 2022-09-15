import { useContext, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import AuthContext from "../../store/auth-context";

import classes from "./AuthForm.module.css";

const AuthForm = () => {
  const history = useHistory(); // isse replace laga kr back uption disable kr rhe hain
  const emailInputRef = useRef();  // .current.value -> ease to access data
  const passwordInputRef = useRef();

  const authCtx = useContext(AuthContext);  // using auth context (global)

  const [isLogin, setIsLogin] = useState(true); // to render logout , various entity
  const [isLoading, setIsLoading] = useState(false); // for showing submitted request

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);  // toggling login
  };
  const submitHandler = (event) => {
    event.preventDefault();
    const enteredEmail = emailInputRef.current.value;  // ref accessed
    const enteredPassword = passwordInputRef.current.value;

    // add validation

    setIsLoading(true);
    let url;
    if (isLogin) {
      url =  // signin rest api url
        "http://localhost:3000/user/login";
    } else {
      url = // signup rest api url
        "http://localhost:3000/user/login";
    }
    fetch(url, {
      method: "POST",
      body: JSON.stringify({      // seen in post payload -> {email, password, returnSecureToken}
        email: enteredEmail,
        password: enteredPassword,
        returnSecureToken: true,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        setIsLoading(false);
        if (res.ok) {
          return res.json();  // returning json
        } else {
          return res.json().then((data) => {
            console.log(data);
            let errorMessage = "Authentication failed!";
            // if (data && data.error && data.error.message) {
            //   errorMessage = data.error.message;
            // }

            throw new Error(errorMessage);
          });
        }
      })
      .then((data) => {
        console.log(data.expiresIn);
        const expirationTime = new Date(new Date().getTime()+(+10000));  // expires in is in sec -> msec -> date + expire => expireTime
        authCtx.login(data.token, expirationTime.toISOString());  // executing login
        history.replace('/');          // back disabled
      })
      .catch((err) => {
        alert(err.message);  // failed alert
      });
  };
  return (
    <section className={classes.auth}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor="email">Your Email</label>
          <input type="email" id="email" required ref={emailInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="password">Your Password</label>
          <input
            type="password"
            id="password"
            required
            ref={passwordInputRef} // ref ayse use krte hain
          />
        </div>
        <div className={classes.actions}>
          {!isLoading && (
            <button>{isLogin ? "Login" : "Create Account"}</button>
          )}
          {isLoading && <p> Sending Request </p>}

          <button
            type="button"
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? "Create new account" : "Login with existing account"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
