import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "./RegisterPage";
import LoginPage from "./LoginPage";
import ChatApp from "./ChatApp";
import { UsersProvider } from "./contexts/UsersContext";
import { ContactsProvider } from "./contexts/ContactsContext";
import { AuthProvider } from "./contexts/AuthContext"; // Ensure the path is correct
import PrivateRoute from "./components/PrivateRoute"; // Import the PrivateRoute component

const App = () => {
  return (
    <UsersProvider>
      <ContactsProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/chat"
                element={<PrivateRoute element={<ChatApp />} />}
              />
            </Routes>
          </Router>
        </AuthProvider>
      </ContactsProvider>
    </UsersProvider>
  );
};

export default App;
