import React, { useEffect, useState } from "react";
import { usersAPI } from "../services/users";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Checkbox,
  ListItemText,
} from "@mui/material";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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

  const handleRolesChange = (userId, roles) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, roles } : u))
    );
  };

  const handleUpdate = async (userId) => {
    const user = users.find((u) => u._id === userId);
    try {
      await usersAPI.updateUser(userId, { roles: user.roles });
      setMessage("User updated successfully");
    } catch (error) {
      console.error("Failed to update user:", error);
      setMessage("Failed to update user");
    }
  };

  if (loading) {
    return <Box p={2}>Loading...</Box>;
  }

  return (
    <Box sx={{ minHeight: "100vh", p: 2, backgroundColor: "#f8fafc" }}>
      <Card sx={{ maxWidth: 800, mx: "auto" }}>
        <CardHeader title="User Management" />
        <CardContent>
          {message && (
            <Alert
              severity={
                message === "User updated successfully" ? "success" : "error"
              }
              sx={{ mb: 2 }}
            >
              {message}
            </Alert>
          )}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>
                    <Typography fontWeight={500}>{u.name}</Typography>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Select
                      multiple
                      value={u.roles || []}
                      onChange={(e) => handleRolesChange(u._id, e.target.value)}
                      size="small"
                      renderValue={(selected) => selected.join(", ")}
                    >
                      {['user', 'admin'].map((role) => (
                        <MenuItem key={role} value={role}>
                          <Checkbox checked={u.roles?.includes(role)} />
                          <ListItemText primary={role} />
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleUpdate(u._id)}
                    >
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;

