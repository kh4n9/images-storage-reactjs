import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';

const FileList = ({ files }) => (
  <List>
    {files.map((file) => (
      <ListItem key={file.id}>
        <ListItemText primary={file.name} />
      </ListItem>
    ))}
  </List>
);

export default FileList;
