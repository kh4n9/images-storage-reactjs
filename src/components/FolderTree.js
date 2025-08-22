import React, { useEffect, useState } from 'react';
import { List, ListItemButton, ListItemText } from '@mui/material';
import { fetchFolders } from '../services/api';

const renderTree = (nodes, onSelect, level = 0) => (
  nodes.map(node => (
    <div key={node.id}>
      <ListItemButton sx={{ pl: level * 2 }} onClick={() => onSelect(node)}>
        <ListItemText primary={node.name} />
      </ListItemButton>
      {node.children && node.children.length > 0 && renderTree(node.children, onSelect, level + 1)}
    </div>
  ))
);

const FolderTree = ({ userId, onSelectFolder }) => {
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    if (userId) {
      fetchFolders(userId).then(setFolders);
    }
  }, [userId]);

  return (
    <List>
      {renderTree(folders, onSelectFolder)}
    </List>
  );
};

export default FolderTree;
