import React, { useState } from "react";
import {
  Button,
  TextField,
  FormControl,
  InputAdornment,
  IconButton,
  Stack,
  Typography,
  Snackbar,
  Alert,
  Container,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import { ChatState } from "../../Context/ChatProvider";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();
  // const { setUser } = ChatState();

  const handleShowPassword = () => setShowPassword(!showPassword);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      setSnackbar({
        open: true,
        message: "Please fill all the fields",
        severity: "warning",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      setSnackbar({
        open: true,
        message: "Login Successfully",
        severity: "success",
      });
      // setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error: ${error.response?.data?.message || error.message}`,
        severity: "error",
      });
      setLoading(false);
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
        <Stack
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{ width: "100%", maxWidth: 400, margin: "auto", mt: 5 }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Login
          </Typography>
          <FormControl fullWidth>
            <TextField
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              required
            />
          </FormControl>

          <FormControl fullWidth>
            <TextField
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={submitHandler}
            disabled={loading}
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
            {loading ? "Logging in..." : "Login"}
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={() => {
              setEmail("guest@example.com");
              setPassword("123456");
            }}
          >
            Get Guest User Credentials
          </Button>
        </Stack>
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

export default Login;
