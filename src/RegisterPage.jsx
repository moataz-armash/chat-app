import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Avatar,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    image: null, // For storing the uploaded image
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("username", formData.username);
      form.append("email", formData.email);
      form.append("password", formData.password);
      if (formData.image) {
        form.append("image", formData.image);
      }

      const response = await axios.post(
        "http://localhost:5000/api/register",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Registration successful:", response.data);
      navigate("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: "50px" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "30px",
          backgroundColor: "#fff",
          boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
        }}
      >
        <Avatar
          sx={{
            width: "100px",
            height: "100px",
            marginBottom: "20px",
            backgroundColor: "#5F54FD",
          }}
        >
          {formData.image ? (
            <img
              src={URL.createObjectURL(formData.image)}
              alt="Uploaded"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          ) : (
            <Typography variant="h5" sx={{ color: "#fff" }}>
              R
            </Typography>
          )}
        </Avatar>
        <IconButton
          component="label"
          sx={{
            backgroundColor: "#5F54FD",
            color: "#fff",
            "&:hover": { backgroundColor: "#4b46db" },
            marginBottom: "20px",
          }}
        >
          <PhotoCamera />
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
        </IconButton>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#333" }}
        >
          Register
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
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
            fullWidth
            sx={{
              backgroundColor: "#5F54FD",
              color: "#fff",
              marginTop: "20px",
              padding: "10px 0",
              fontSize: "16px",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#4b46db" },
            }}
          >
            Register
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default RegisterPage;
