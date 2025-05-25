import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

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
root.render(<App />);