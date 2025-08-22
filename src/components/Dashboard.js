import React, { useContext, useEffect, useState } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import Header from './Header';
import FolderTree from './FolderTree';
import FileList from './FileList';
import { AuthContext } from '../contexts/AuthContext';
import { fetchFolderFiles } from '../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (currentFolder) {
      fetchFolderFiles(currentFolder.id).then(setFiles);
    }
  }, [currentFolder]);

  return (
    <Box>
      <Header />
      <Grid container>
        <Grid item xs={3}>
          <FolderTree userId={user?.id} onSelectFolder={setCurrentFolder} />
        </Grid>
        <Grid item xs={9}>
          <Box p={2}>
            <Typography variant="h6">{currentFolder ? currentFolder.name : 'Select a folder'}</Typography>
            <FileList files={files} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
