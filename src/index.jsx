import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Import the global CSS
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter
import App from "./App.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      {" "}
      {/* Wrap App with BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
