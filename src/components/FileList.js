import React from 'react';
import { List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteFile } from '../services/api';

const FileList = ({ files, onDelete }) => {
  const handleDelete = async (id) => {
    await deleteFile(id);
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <List>
      {files.map((file) => (
        <ListItem
          key={file.id}
          secondaryAction={
            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(file.id)}>
              <DeleteIcon />
            </IconButton>
          }
        >
          <ListItemText primary={file.name} />
        </ListItem>
      ))}
    </List>
  );
};

export default FileList;
