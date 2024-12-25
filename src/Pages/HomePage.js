import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Avatar,
  IconButton,
  CircularProgress,
  InputAdornment,
  Alert,
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [pic, setPic] = useState();
  const [picLoading, setPicLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) navigate("/chats");
  }, [navigate]);

  const handleClick = () => {
    setShowPassword(!showPassword);
  };

  const submitHandler = async () => {
    setPicLoading(true);
    if (!name || !email || !password || !confirmpassword) {
      setSnackbar({
        open: true,
        message: "Please fill all the fields",
        severity: "warning",
      });
      setPicLoading(false);
      return;
    }

    if (password !== confirmpassword) {
      setSnackbar({
        open: true,
        message: "Passwords do not match",
        severity: "warning",
      });
      setPicLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user",
        { name, email, password, pic },
        config
      );

      setSnackbar({
        open: true,
        message: "Registration successful!",
        severity: "success",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setPicLoading(false);
      navigate("/chats");
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error occurred!",
        severity: "error",
      });
      setPicLoading(false);
    }
  };

  const postDetails = (pics) => {
    setPicLoading(true);

    if (!pics) {
      setSnackbar({
        open: true,
        message: "Please select an image!",
        severity: "warning",
      });
      setPicLoading(false);
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "piyushproj");

      fetch("https://api.cloudinary.com/v1_1/piyushproj/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setPicLoading(false);
          setSnackbar({
            open: true,
            message: "Image uploaded successfully!",
            severity: "success",
          });
        })
        .catch((err) => {
          console.log(err);
          setSnackbar({
            open: true,
            message: "Failed to upload image",
            severity: "error",
          });
          setPicLoading(false);
        });
    } else {
      setSnackbar({
        open: true,
        message: "Please select a valid image (JPEG/PNG)!",
        severity: "warning",
      });
      setPicLoading(false);
    }
  };

  return (
    <>
      <Container
        maxWidth="sm"
        sx={{
          marginTop: "50px",
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)", // Custom shadow
          padding: "20px",
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={2}
          sx={{ width: "100%", maxWidth: 400, mx: "auto" }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Sign Up
          </Typography>
          <TextField
            fullWidth
            label="Name"
            placeholder="Enter Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            placeholder="Enter Your Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    onClick={handleClick}
                    size="small"
                    sx={{ textTransform: "none" }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmpassword}
            onChange={(e) => setConfirmpassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    onClick={handleClick}
                    size="small"
                    sx={{ textTransform: "none" }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </InputAdornment>
              ),
            }}
          />
          <Typography
            variant="subtitle1"
            component="label"
            htmlFor="upload-pic"
          >
            Upload Your Picture
          </Typography>
          <TextField
            id="upload-pic"
            type="file"
            inputProps={{ accept: "image/*" }}
            onChange={(e) => postDetails(e.target.files[0])}
            sx={{ cursor: "pointer" }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={submitHandler}
            disabled={picLoading}
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
            {picLoading ? <CircularProgress size={24} /> : "Sign Up"}
          </Button>
          <Typography>
            I'm Already have an account{" "}
            <Box component="span" sx={{ textDecoration: "underline" }}>
              <Link style={{ color: "#4b46db", cursor: "pointer" }} to="/login">
                Login
              </Link>
            </Box>
          </Typography>
        </Box>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default HomePage;
