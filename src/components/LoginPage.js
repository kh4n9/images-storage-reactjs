import React, { useState } from "react";
import CloudIcon from "@mui/icons-material/Cloud";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("login");

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (type === "login") {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          navigate("/dashboard");
        } else {
          setError(result.error);
        }
      } else {
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
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        p: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 400 }}>
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
              <CloudIcon />
              <Typography variant="h6">Image Storage</Typography>
            </Box>
          }
        />
        <CardContent>
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            <Tab label="Login" value="login" />
            <Tab label="Register" value="register" />
          </Tabs>

          {tab === "login" && (
            <Box
              component="form"
              onSubmit={(e) => handleSubmit(e, "login")}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <TextField
                id="password"
                name="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button type="submit" variant="contained" fullWidth disabled={loading}>
                {loading ? "Loading..." : "Sign In"}
              </Button>
            </Box>
          )}

          {tab === "register" && (
            <Box
              component="form"
              onSubmit={(e) => handleSubmit(e, "register")}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                id="name"
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <TextField
                id="email-register"
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <TextField
                id="password-register"
                name="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <TextField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button type="submit" variant="contained" fullWidth disabled={loading}>
                {loading ? "Loading..." : "Create Account"}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;

