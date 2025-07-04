import React, { useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import './LoginPage.css';

const LoginPage = () => {
  const [clientId, setClientId] = useState('');

  return (
    <div className="login-page-container">
      <div className="login-box">
        <h1 className="login-title">Sign In</h1>
        <p className="login-subtitle">to continue to Strands</p>

        <div className="client-id-input-container">
          <input
            type="text"
            placeholder="Enter Google Client ID to Test"
            value={clientId}
            onChange={(e) => setClientId(e.target.value.trim())}
            className="client-id-input"
          />
        </div>

        {clientId && (
          <div className="google-login-container">
            <GoogleOAuthProvider clientId={clientId}>
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  console.log('ID Token:', credentialResponse.credential);
                  // Send this to backend
                  // fetch("https://your-backend.com/api/auth/google", {
                  //   method: "POST",
                  //   headers: { "Content-Type": "application/json" },
                  //   credentials: "include", // to receive httpOnly cookies
                  //   body: JSON.stringify({ credential: credentialResponse.credential }),
                  // });
                }}
                onError={() => {
                  console.error('Login Failed');
                }}
              />
            </GoogleOAuthProvider>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;