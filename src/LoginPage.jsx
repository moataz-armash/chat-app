import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null); // To display errors in the UI
  const navigate = useNavigate();
  const { login } = useAuth(); // Access the login function from AuthContext

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state before a new attempt
    try {
      // Make the login API call
      const response = await axios.post(
        "http://localhost:5000/api/login",
        formData
      );

      const { image, userId, username, token } = response.data; // Extract user data from the response
      // Save user data to localStorage
      const userData = { userId, username, image, token };
      localStorage.setItem("user", JSON.stringify(userData));
      console.log(userData);

      // Update the AuthContext state
      login(userData);

      // Navigate to the chat page
      navigate("/chat");
    } catch (error) {
      console.error("Error during login:", error);

      // Handle different error scenarios
      if (error.response && error.response.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}{" "}
        {/* Display error messages */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ backgroundColor: "#5F54FD", marginTop: "16px" }}
            fullWidth
          >
            Login
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default LoginPage;
