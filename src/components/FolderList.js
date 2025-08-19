import React, { useState, memo } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Folder,
  FolderOpen,
  ArrowBack,
  MoreVert,
  Add,
  Edit,
  Delete,
  Home,
  NavigateNext,
} from "@mui/icons-material";
import { foldersAPI } from "../services/api";

const FolderListComponent = ({
  folders,
  onFolderClick,
  currentFolder,
  folderPath,
  onBackToRoot,
  onBackOneLevel,
  onNavigateToFolder,
  onFoldersChange,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  const handleMenuClick = (event, folder) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedFolder(folder);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFolder(null);
  };

  const handleCreateFolder = async () => {
    try {
      console.log("Creating folder with data:", {
        name: folderName,
        parentId: currentFolder?._id || null,
      });

      const result = await foldersAPI.createFolder({
        name: folderName,
        parentId: currentFolder?._id || null,
      });

      console.log("Folder created successfully:", result);
      setCreateDialogOpen(false);
      setFolderName("");
      onFoldersChange();
    } catch (error) {
      console.error("Failed to create folder:", error);
      alert(
        "Failed to create folder: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleEditFolder = async () => {
    try {
      await foldersAPI.updateFolder(selectedFolder._id, { name: folderName });
      setEditDialogOpen(false);
      setFolderName("");
      handleMenuClose();
      onFoldersChange();
    } catch (error) {
      console.error("Failed to update folder:", error);
    }
  };

  const handleDeleteFolder = async () => {
    try {
      await foldersAPI.deleteFolder(selectedFolder._id);
      handleMenuClose();
      onFoldersChange();
    } catch (error) {
      console.error("Failed to delete folder:", error);
    }
  };

  const openCreateDialog = () => {
    setCreateDialogOpen(true);
    setFolderName("");
  };

  const openEditDialog = () => {
    setFolderName(selectedFolder.name);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  return (
    <Box>
      {/* Breadcrumb Navigation */}
      {folderPath && folderPath.length > 0 && (
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #e0e0e0",
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            borderRadius: "8px 8px 0 0",
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mb: 1, display: "block" }}
          >
            Current Path:
          </Typography>
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            sx={{ fontSize: "0.875rem" }}
          >
            <Link
              component="button"
              variant="body2"
              onClick={onBackToRoot}
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "primary.main",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              <Home sx={{ mr: 0.5, fontSize: "1rem" }} />
              Home
            </Link>
            {folderPath.map((folder, index) => (
              <Link
                key={folder._id}
                component="button"
                variant="body2"
                onClick={() => onNavigateToFolder(folder, index)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                  color:
                    index === folderPath.length - 1
                      ? "text.primary"
                      : "primary.main",
                  fontWeight: index === folderPath.length - 1 ? 600 : 400,
                  "&:hover": {
                    textDecoration:
                      index === folderPath.length - 1 ? "none" : "underline",
                  },
                }}
              >
                <Folder sx={{ mr: 0.5, fontSize: "1rem" }} />
                {folder.name}
              </Link>
            ))}
          </Breadcrumbs>
        </Box>
      )}

      {/* Back Button */}
      {currentFolder && (
        <Box sx={{ p: 1 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={onBackOneLevel}
            variant="text"
            sx={{ mb: 1 }}
          >
            {folderPath.length > 1
              ? `Back to ${folderPath[folderPath.length - 2].name}`
              : "Back to Home"}
          </Button>
        </Box>
      )}

      {/* Add Folder Button */}
      <Box sx={{ p: 1 }}>
        <Button
          startIcon={<Add />}
          onClick={openCreateDialog}
          variant="outlined"
          fullWidth
          sx={{ mb: 1 }}
        >
          Create Folder
        </Button>
      </Box>

      {/* Folders List */}
      <List dense>
        {folders.length === 0 ? (
          <ListItem>
            <ListItemText
              primary="No folders"
              secondary="Create a folder to organize your files"
            />
          </ListItem>
        ) : (
          folders.map((folder) => (
            <ListItem key={folder._id} disablePadding>
              <ListItemButton onClick={() => onFolderClick(folder)}>
                <ListItemIcon>
                  {currentFolder?._id === folder._id ? (
                    <FolderOpen color="primary" />
                  ) : (
                    <Folder />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={folder.name}
                  secondary={`${folder.fileCount || 0} files`}
                />
              </ListItemButton>
              <IconButton
                edge="end"
                onClick={(e) => handleMenuClick(e, folder)}
                size="small"
              >
                <MoreVert />
              </IconButton>
            </ListItem>
          ))
        )}
      </List>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={openEditDialog}>
          <Edit sx={{ mr: 1 }} />
          Rename
        </MenuItem>
        <MenuItem onClick={handleDeleteFolder} sx={{ color: "error.main" }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Folder Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      >
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleCreateFolder();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Rename Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleEditFolder();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditFolder} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default memo(FolderListComponent);
