import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Tab,
  Tabs,
  CircularProgress,
  Card,
  CardContent,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  CloudUpload as CloudIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError("");
    setFormData({
      email: "",
      password: "",
      name: "",
      confirmPassword: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (tab === 0) {
        // Login
        const result = await login(formData.email, formData.password);
        if (result.success) {
          navigate("/dashboard");
        } else {
          setError(result.error);
        }
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters");
          return;
        }

        const result = await register(
          formData.email,
          formData.name,
          formData.password
        );
        if (result.success) {
          navigate("/dashboard");
        } else {
          setError(result.error);
        }
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: 4,
            boxShadow: "0 32px 64px rgba(0, 0, 0, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <CardContent sx={{ p: 6 }}>
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <CloudIcon
                sx={{
                  fontSize: 60,
                  color: "primary.main",
                  mb: 2,
                  filter: "drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))",
                }}
              />
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                }}
              >
                Images Storage
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontSize: "1.1rem" }}
              >
                Secure cloud storage powered by Discord
              </Typography>
            </Box>

            {/* Tabs */}
            <Tabs
              value={tab}
              onChange={handleTabChange}
              centered
              sx={{
                mb: 4,
                "& .MuiTab-root": {
                  fontWeight: 600,
                  fontSize: "1rem",
                  textTransform: "none",
                  minWidth: 120,
                },
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                },
              }}
            >
              <Tab icon={<LoginIcon />} iconPosition="start" label="Login" />
              <Tab
                icon={<RegisterIcon />}
                iconPosition="start"
                label="Register"
              />
            </Tabs>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Form Content */}
            <Box component="form" onSubmit={handleSubmit}>
              {/* Login Form */}
              {tab === 0 && (
                <Box>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      borderRadius: 2,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 40px rgba(102, 126, 234, 0.4)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </Box>
              )}

              {/* Register Form */}
              {tab === 1 && (
                <Box>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      borderRadius: 2,
                      background:
                        "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                      boxShadow: "0 8px 32px rgba(118, 75, 162, 0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #6b46c1 0%, #5a67d8 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 40px rgba(118, 75, 162, 0.4)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </Box>
              )}
            </Box>

            {/* Footer */}
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 4, opacity: 0.8 }}
            >
              🔒 Secure cloud storage powered by Discord servers
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;
