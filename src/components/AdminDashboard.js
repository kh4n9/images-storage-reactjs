import React, { useEffect, useState } from "react";
import { usersAPI } from "../services/api";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from "@mui/material";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await usersAPI.getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  if (loading) {
    return <Box p={2}>Loading...</Box>;
  }

  return (
    <Box sx={{ minHeight: "100vh", p: 2, backgroundColor: "#f8fafc" }}>
      <Card sx={{ maxWidth: 800, mx: "auto" }}>
        <CardHeader title="User Management" />
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {users.map((u) => (
              <Box
                key={u.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                }}
              >
                <Box>
                  <Typography fontWeight={500}>{u.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {u.email}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                  {u.role}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;

