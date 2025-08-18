import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import { CloudUpload, Delete, CheckCircle } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import { filesAPI } from "../services/api";

const FileUpload = ({
  open,
  onClose,
  onUploadSuccess,
  currentFolder,
  userId,
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError("");

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(
        (file) =>
          `${file.file.name}: ${file.errors.map((e) => e.message).join(", ")}`
      );
      setError(`Some files were rejected: ${errors.join("; ")}`);
    }

    // Add accepted files
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
      uploaded: false,
      uploading: false,
      error: null,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  const removeFile = (fileId) => {
    setFiles(files.filter((f) => f.id !== fileId));
  };

  const uploadFile = async (fileItem) => {
    try {
      // Update file status
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, uploading: true, error: null } : f
        )
      );

      const options = {};
      if (currentFolder) {
        options.folderId = currentFolder._id;
      }

      const result = await filesAPI.uploadFile(fileItem.file, options);

      // Update file status to uploaded
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, uploading: false, uploaded: true } : f
        )
      );

      setUploadedFiles((prev) => [...prev, result]);
      return true;
    } catch (error) {
      console.error("Upload failed:", error);

      // Update file status with error
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                uploading: false,
                error: error.response?.data?.message || "Upload failed",
              }
            : f
        )
      );
      return false;
    }
  };

  const uploadAllFiles = async () => {
    setUploading(true);
    setError("");
    setUploadProgress(0);

    const filesToUpload = files.filter((f) => !f.uploaded && !f.error);

    if (filesToUpload.length === 0) {
      setError("No files to upload");
      setUploading(false);
      return;
    }

    let successCount = 0;

    for (let i = 0; i < filesToUpload.length; i++) {
      const success = await uploadFile(filesToUpload[i]);
      if (success) successCount++;
      setUploadProgress(((i + 1) / filesToUpload.length) * 100);
    }

    setUploading(false);

    // If all uploads successful, close dialog
    if (successCount === filesToUpload.length && filesToUpload.length > 0) {
      setTimeout(() => {
        handleClose();
        onUploadSuccess();
      }, 1000);
    }
  };

  const handleClose = () => {
    setFiles([]);
    setUploadedFiles([]);
    setUploading(false);
    setUploadProgress(0);
    setError("");
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <CloudUpload sx={{ mr: 1 }} />
          Upload Files
          {currentFolder && (
            <Chip
              label={`to ${currentFolder.name}`}
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Dropzone */}
        <Paper
          {...getRootProps()}
          sx={{
            border: "2px dashed",
            borderColor: isDragActive ? "primary.main" : "grey.300",
            p: 4,
            textAlign: "center",
            cursor: "pointer",
            mb: 2,
            bgcolor: isDragActive ? "action.hover" : "background.paper",
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? "Drop files here" : "Drag & drop files here"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to select files
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Supported: Images, PDF, Text files (max 10MB each)
          </Typography>
        </Paper>

        {/* File List */}
        {files.length > 0 && (
          <Paper sx={{ maxHeight: 300, overflow: "auto" }}>
            <List>
              {files.map((file) => (
                <ListItem key={file.id}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    {file.preview && (
                      <img
                        src={file.preview}
                        alt={file.name}
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: "cover",
                          marginRight: 16,
                          borderRadius: 4,
                        }}
                      />
                    )}

                    <ListItemText
                      primary={file.name}
                      secondary={
                        <Box>
                          <Typography variant="caption">
                            {formatFileSize(file.size)}
                          </Typography>
                          {file.error && (
                            <Typography
                              variant="caption"
                              color="error"
                              display="block"
                            >
                              {file.error}
                            </Typography>
                          )}
                        </Box>
                      }
                    />

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {file.uploading && (
                        <LinearProgress sx={{ width: 100, mr: 1 }} />
                      )}
                      {file.uploaded && (
                        <CheckCircle color="success" sx={{ mr: 1 }} />
                      )}
                      {!file.uploading && !file.uploaded && (
                        <IconButton
                          size="small"
                          onClick={() => removeFile(file.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Upload Progress */}
        {uploading && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Upload Progress: {Math.round(uploadProgress)}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        {/* Success Message */}
        {uploadedFiles.length > 0 && !uploading && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Successfully uploaded {uploadedFiles.length} file(s) to Discord
            storage!
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          onClick={uploadAllFiles}
          variant="contained"
          disabled={
            files.length === 0 ||
            uploading ||
            files.every((f) => f.uploaded || f.error)
          }
          startIcon={<CloudUpload />}
        >
          {uploading
            ? "Uploading..."
            : `Upload ${
                files.filter((f) => !f.uploaded && !f.error).length
              } Files`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileUpload;
