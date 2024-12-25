import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
// import PrivateRoute from "./components/PrivateRoute"; // Import the PrivateRoute component
import HomePage from "./Pages/HomePage";
import ChatPage from "./Pages/ChatPage";
import LoginPage from "./Pages/LoginPage";
import ChatProvider from "./Context/ChatProvider";
const App = () => {
  return (
    <Router>
      <ChatProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chats" element={<ChatPage />} />
          {/* <Route
            path="/chats"
            element={<PrivateRoute element={<ChatPage />} />}
            /> */}
        </Routes>
      </ChatProvider>
    </Router>
  );
};

export default App;
