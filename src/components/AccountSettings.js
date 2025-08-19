import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const AccountSettings = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const result = await updateProfile(formData);
    if (result.success) {
      setMessage("Profile updated successfully");
    } else {
      setMessage(result.error);
    }
    setLoading(false);
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
          title="Account Settings"
          action={
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          }
        />
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              id="name"
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              id="email"
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {message && (
              <Alert
                severity={
                  message === "Profile updated successfully" ? "success" : "error"
                }
              >
                {message}
              </Alert>
            )}
            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AccountSettings;

