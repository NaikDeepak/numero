import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import the global CSS
import App from './App.jsx'; // <--- Update import to use .jsx

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
