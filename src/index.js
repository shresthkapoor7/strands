import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

(function () {
  const redirect = sessionStorage.getItem('redirect');
  if (redirect) {
    sessionStorage.removeItem('redirect');
    window.history.replaceState(null, null, redirect);
  } else if (window.location.search.startsWith('/')) {
    const path = window.location.search.slice(1).split('&').map(s => s.replace(/~and~/g, '&')).join('?');
    sessionStorage.setItem('redirect', path);
    window.location.replace(path);
  }
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();