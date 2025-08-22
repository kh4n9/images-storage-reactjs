import React, { useEffect, useState } from 'react';
import { List, ListItemButton, ListItemText } from '@mui/material';
import { fetchFolders } from '../services/api';

const FolderTree = ({ userId, onSelectFolder }) => {
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    if (userId) {
      fetchFolders(userId).then((data) =>
        setFolders(data.filter((folder) => !folder.parentId))
      );
    }
  }, [userId]);

  return (
    <List>
      {folders.map((folder) => (
        <ListItemButton key={folder.id} onClick={() => onSelectFolder(folder)}>
          <ListItemText primary={folder.name} />
        </ListItemButton>
      ))}
    </List>
  );
};

export default FolderTree;
