import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Fab,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha,
  Container,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  CloudUpload,
  Folder,
  Image,
  ExitToApp,
  AccountCircle,
  Add,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Storage,
  FolderOpen,
  Home,
  NavigateNext,
  Refresh,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { foldersAPI, filesAPI } from "../services/api";
import FileUpload from "./FileUpload";
import FileGrid from "./FileGrid";
import FolderList from "./FolderList";

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // Ensure we always work with a string user id
  const userId =
    typeof user?._id === "object" ? user?._id?.$oid : user?._id || user?.id;

  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]); // Breadcrumb path
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Load user data when authentication status or user id changes
  useEffect(() => {
    if (isAuthenticated && userId) {
      loadUserData();
    }
  }, [isAuthenticated, userId]);

  const loadUserData = async () => {
    if (!userId) return;
    try {
      setLoading(true);

      // Load user root folders with file count
      const rootFolders = await foldersAPI.getUserRootFoldersWithCount(userId);
      setFolders(rootFolders);

      // Load user files (root level)
      const userFiles = await filesAPI.getUserFiles(userId);
      setFiles(userFiles.filter((file) => !file.folder)); // Only root files
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleFolderClick = async (folder) => {
    try {
      setCurrentFolder(folder);
      // Add folder to path
      setFolderPath((prev) => [...prev, folder]);

      // Load folder files
      const folderFiles = await filesAPI.getFolderFiles(folder._id);
      setFiles(folderFiles);

      // Load subfolders with file count
      const subfolders = await foldersAPI.getChildrenFoldersWithCount(
        folder._id
      );
      setFolders(subfolders);
    } catch (error) {
      console.error("Failed to load folder:", error);
    }
  };

  const handleBackToRoot = async () => {
    setCurrentFolder(null);
    setFolderPath([]); // Reset path
    await loadUserData();
  };

  const handleNavigateToFolder = async (targetFolder, index) => {
    try {
      // Update path to only include folders up to the clicked one
      setFolderPath((prev) => prev.slice(0, index + 1));
      setCurrentFolder(targetFolder);

      // Load folder content
      const folderFiles = await filesAPI.getFolderFiles(targetFolder._id);
      setFiles(folderFiles);

      const subfolders = await foldersAPI.getChildrenFoldersWithCount(
        targetFolder._id
      );
      setFolders(subfolders);
    } catch (error) {
      console.error("Failed to navigate to folder:", error);
    }
  };

  const handleBackOneLevel = async () => {
    if (folderPath.length <= 1) {
      // If at root or only one level deep, go to root
      return handleBackToRoot();
    }

    // Go back to parent folder
    const parentFolder = folderPath[folderPath.length - 2];
    await handleNavigateToFolder(parentFolder, folderPath.length - 2);
  };

  const reloadCurrentFolders = async () => {
    if (currentFolder) {
      // Reload subfolders with file count
      const subfolders = await foldersAPI.getChildrenFoldersWithCount(
        currentFolder._id
      );
      setFolders(subfolders);
    } else {
      // Reload root folders
      if (userId) {
        const rootFolders = await foldersAPI.getUserRootFoldersWithCount(userId);
        setFolders(rootFolders);
      }
    }
  };

  const reloadCurrentFiles = async () => {
    try {
      if (currentFolder) {
        // Reload current folder files
        const folderFiles = await filesAPI.getFolderFiles(currentFolder._id);
        setFiles(folderFiles);
      } else {
        // Reload root files
        if (userId) {
          const userFiles = await filesAPI.getUserFiles(userId);
          setFiles(userFiles.filter((file) => !file.folder)); // Only root files
        }
      }
    } catch (error) {
      console.error("Failed to reload files:", error);
    }
  };

  const reloadCurrentView = async () => {
    await Promise.all([reloadCurrentFiles(), reloadCurrentFolders()]);
  };

  const handleUploadSuccess = async () => {
    setUploadDialogOpen(false);
    // Reload current view (both files and folders)
    await reloadCurrentView();
  };

  const handleFileDelete = async (fileId) => {
    try {
      await filesAPI.deleteFile(fileId);

      // Reload both files and folders to update file count
      await reloadCurrentView();

      console.log("File deleted successfully");
    } catch (error) {
      console.error("Failed to delete file:", error);
      // Still remove from UI if it's a 404 (file already deleted) or soft delete success
      if (error.response?.status === 404 || error.response?.status === 200) {
        setFiles(files.filter((file) => file._id !== fileId));
        // Also reload folders to update count
        await reloadCurrentFolders();
        console.log(
          "File removed from display (already deleted or soft deleted)"
        );
      } else {
        alert(
          "Failed to delete file: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Modern App Bar with Gradient */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{
              mr: 2,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            <MenuIcon />
          </IconButton>

          <DashboardIcon sx={{ mr: 2, fontSize: 28 }} />
          <Typography
            variant="h5"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            Images Storage
            {currentFolder && (
              <Chip
                label={`📁 ${currentFolder.name}`}
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "& .MuiChip-label": {
                    fontSize: "0.8rem",
                  },
                }}
              />
            )}
          </Typography>

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: "linear-gradient(135deg, #ff7b7b 0%, #667eea 100%)",
                border: "2px solid rgba(255,255,255,0.3)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <AccountCircle sx={{ mr: 1 }} />
              {user?.name}
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/account");
              }}
            >
              <AccountCircle sx={{ mr: 1 }} />
              Account Settings
            </MenuItem>
            {user?.roles?.includes("admin") && (
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate("/admin");
                }}
              >
                <DashboardIcon sx={{ mr: 1 }} />
                Admin Panel
              </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Modern Side Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            "& .MuiListItemIcon-root": {
              color: "white",
            },
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, textAlign: "center" }}
          >
            📁 File Manager
          </Typography>
          <Typography
            variant="body2"
            sx={{ textAlign: "center", opacity: 0.8, mt: 1 }}
          >
            Welcome, {user?.name}
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          <List>
            <ListItem
              button
              onClick={() => setUploadDialogOpen(true)}
              sx={{
                borderRadius: 2,
                mb: 1,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                  transform: "translateX(8px)",
                },
                transition: "all 0.3s ease-in-out",
              }}
            >
              <ListItemIcon>
                <CloudUpload />
              </ListItemIcon>
              <ListItemText
                primary="Upload Files"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItem>

            <ListItem
              button
              onClick={handleBackToRoot}
              sx={{
                borderRadius: 2,
                mb: 1,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                  transform: "translateX(8px)",
                },
                transition: "all 0.3s ease-in-out",
              }}
            >
              <ListItemIcon>
                <FolderOpen />
              </ListItemIcon>
              <ListItemText
                primary="My Files"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItem>

            <Divider sx={{ my: 2, backgroundColor: "rgba(255,255,255,0.2)" }} />

            <ListItem>
              <Box sx={{ textAlign: "center", width: "100%" }}>
                <Storage sx={{ fontSize: 40, mb: 1, opacity: 0.7 }} />
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ opacity: 0.8 }}
                >
                  Discord Storage
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ opacity: 0.6 }}
                >
                  Secure & Reliable
                </Typography>
              </Box>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Modern Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Folders Section */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card
              sx={{
                height: "500px",
                overflow: "hidden",
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Box
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "12px 12px 0 0",
                }}
              >
                <Folder sx={{ mr: 2, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
                  📁 Folders
                </Typography>
                <IconButton
                  onClick={reloadCurrentFolders}
                  sx={{
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                  }}
                  title="Refresh Folders"
                >
                  <Refresh />
                </IconButton>
              </Box>
              <CardContent
                sx={{ p: 0, height: "calc(100% - 80px)", overflow: "auto" }}
              >
                <FolderList
                  folders={folders}
                  onFolderClick={handleFolderClick}
                  currentFolder={currentFolder}
                  folderPath={folderPath}
                  onBackToRoot={handleBackToRoot}
                  onBackOneLevel={handleBackOneLevel}
                  onNavigateToFolder={handleNavigateToFolder}
                  onFoldersChange={reloadCurrentFolders}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Files Section */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card
              sx={{
                minHeight: "500px",
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Box
                sx={{
                  background:
                    "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                  color: "white",
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "12px 12px 0 0",
                }}
              >
                <Image sx={{ mr: 2, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
                  🖼️ Files{" "}
                  {currentFolder && (
                    <Chip
                      label={currentFolder.name}
                      size="small"
                      sx={{
                        ml: 2,
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: "white",
                      }}
                    />
                  )}
                </Typography>
                <IconButton
                  onClick={reloadCurrentView}
                  sx={{
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                  }}
                  title="Refresh"
                >
                  <Refresh />
                </IconButton>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <FileGrid
                  files={files}
                  loading={loading}
                  onFileDelete={handleFileDelete}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Modern Upload FAB */}
      <Fab
        aria-label="upload"
        onClick={() => setUploadDialogOpen(true)}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          width: 64,
          height: 64,
          boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
          "&:hover": {
            background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
            transform: "scale(1.1) rotate(10deg)",
            boxShadow: "0 12px 48px rgba(102, 126, 234, 0.6)",
          },
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:active": {
            transform: "scale(0.95)",
          },
        }}
      >
        <Add sx={{ fontSize: 32 }} />
      </Fab>

      {/* Upload Dialog */}
      <FileUpload
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        currentFolder={currentFolder}
        userId={userId}
      />
    </Box>
  );
};

export default Dashboard;
