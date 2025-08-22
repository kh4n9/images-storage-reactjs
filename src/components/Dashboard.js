import React, { useEffect, useState, useMemo } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Grid, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { foldersAPI, filesAPI } from '../services/api';
import FileUpload from './FileUpload';
import FileGrid from './FileGrid';
import FolderList from './FolderList';
import Cookies from 'js-cookie';

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const currentUser = useMemo(() => {
    if (user) return user;
    const stored = Cookies.get('user_data');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, [user]);

  const userId = useMemo(() => {
    if (!currentUser) return null;
    const id = currentUser.id || currentUser._id;
    if (typeof id === 'object') {
      return id?.$oid || id?.toString();
    }
    return id;
  }, [currentUser]);

  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadRoot();
    }
  }, [isAuthenticated, userId]);

  const loadRoot = async () => {
    try {
      setLoading(true);
      const rootFolders = await foldersAPI.getUserRootFoldersWithCount(userId);
      const rootFiles = await filesAPI.getUserFiles(userId);
      setFolders(rootFolders);
      setFiles(rootFiles.filter((f) => !f.folder));
      setCurrentFolder(null);
      setFolderPath([]);
    } finally {
      setLoading(false);
    }
  };

  const openFolder = async (folder) => {
    try {
      setLoading(true);
      const childFolders = await foldersAPI.getChildrenFoldersWithCount(folder._id);
      const folderFiles = await filesAPI.getFolderFiles(folder._id);
      setFolders(childFolders);
      setFiles(folderFiles);
      setCurrentFolder(folder);
      setFolderPath((prev) => [...prev, folder]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRoot = () => {
    loadRoot();
  };

  const handleBackOneLevel = () => {
    if (folderPath.length > 1) {
      const parent = folderPath[folderPath.length - 2];
      navigateToFolder(folderPath.length - 2, parent);
    } else {
      loadRoot();
    }
  };

  const navigateToFolder = async (index, folder = folderPath[index]) => {
    try {
      setLoading(true);
      if (!folder) {
        await loadRoot();
        return;
      }
      const newPath = folderPath.slice(0, index + 1);
      const childFolders = await foldersAPI.getChildrenFoldersWithCount(folder._id);
      const folderFiles = await filesAPI.getFolderFiles(folder._id);
      setFolders(childFolders);
      setFiles(folderFiles);
      setCurrentFolder(folder);
      setFolderPath(newPath);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDelete = async (fileId) => {
    await filesAPI.deleteFile(fileId);
    reloadCurrent();
  };

  const handleUploadSuccess = () => {
    reloadCurrent();
  };

  const reloadCurrent = () => {
    if (currentFolder) {
      openFolder(currentFolder);
    } else {
      loadRoot();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Button color="inherit" onClick={() => setUploadOpen(true)}>
            Upload
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ flexGrow: 1, mt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FolderList
              folders={folders}
              onFolderClick={openFolder}
              currentFolder={currentFolder}
              folderPath={folderPath}
              onBackToRoot={handleBackToRoot}
              onBackOneLevel={handleBackOneLevel}
              onNavigateToFolder={(index) => navigateToFolder(index)}
              onFoldersChange={reloadCurrent}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <FileGrid files={files} loading={loading} onFileDelete={handleFileDelete} />
          </Grid>
        </Grid>
      </Container>
      <FileUpload
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        currentFolder={currentFolder}
        userId={userId}
      />
    </Box>
  );
};

export default Dashboard;
