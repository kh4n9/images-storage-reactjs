import React, { useState, memo } from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Skeleton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Download,
  Delete,
  Visibility,
  InsertDriveFile,
  Image as ImageIcon,
  CloudDownload,
  RemoveRedEye,
} from "@mui/icons-material";
import { filesAPI } from "../services/api";

const FileGridComponent = ({ files, loading, onFileDelete }) => {
  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const theme = useTheme();

  const handleDownload = async (file) => {
    try {
      const response = await filesAPI.downloadFile(file._id);

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: file.mimeType });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = file.originalName || file.name;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handlePreview = (file) => {
    if (file.mimeType.startsWith("image/")) {
      setPreviewFile(file);
      setPreviewOpen(true);
    } else {
      // For non-image files, just download
      handleDownload(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith("image/")) {
      return <ImageIcon />;
    }
    return <InsertDriveFile />;
  };

  const getFileTypeChip = (mimeType) => {
    if (mimeType.startsWith("image/")) {
      return <Chip label="Image" color="primary" size="small" />;
    } else if (mimeType === "application/pdf") {
      return <Chip label="PDF" color="error" size="small" />;
    } else if (mimeType.startsWith("text/")) {
      return <Chip label="Text" color="info" size="small" />;
    }
    return <Chip label="File" color="default" size="small" />;
  };

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[...Array(6)].map((_, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card>
              <Skeleton variant="rectangular" width="100%" height={200} />
              <CardContent>
                <Skeleton variant="text" />
                <Skeleton variant="text" width="60%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (files.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          px: 4,
          background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
          borderRadius: 3,
          border: "2px dashed #cbd5e1",
        }}
      >
        <InsertDriveFile sx={{ fontSize: 80, color: "#64748b", mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No files found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload some files to get started
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {files.map((file) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={file._id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                "&:hover": {
                  transform: "translateY(-8px) scale(1.02)",
                  boxShadow:
                    "0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(102, 126, 234, 0.1)",
                  "& .file-actions": {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                  "& .file-overlay": {
                    opacity: 1,
                  },
                },
              }}
              onClick={() => handlePreview(file)}
            >
              {/* File Preview */}
              <Box sx={{ position: "relative", height: 200 }}>
                {/* Gradient Overlay */}
                <Box
                  className="file-overlay"
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(45deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                    zIndex: 1,
                  }}
                />

                {file.mimeType.startsWith("image/") ? (
                  <CardMedia
                    component="img"
                    sx={{
                      height: "100%",
                      objectFit: "cover",
                    }}
                    image={file.url}
                    alt={file.originalName}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "grey.100",
                    }}
                  >
                    {getFileIcon(file.mimeType)}
                  </Box>
                )}

                {/* File type badge */}
                <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                  {getFileTypeChip(file.mimeType)}
                </Box>

                {/* Fallback for broken images */}
                <Box
                  sx={{
                    height: "100%",
                    display: "none",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "grey.100",
                  }}
                >
                  {getFileIcon(file.mimeType)}
                </Box>
              </Box>

              {/* File Info */}
              <CardContent sx={{ flexGrow: 1 }}>
                <Tooltip title={file.originalName}>
                  <Typography
                    variant="subtitle2"
                    component="div"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      mb: 1,
                    }}
                  >
                    {file.originalName}
                  </Typography>
                </Tooltip>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {formatFileSize(file.size)}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {new Date(file.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>

              {/* Modern Actions Overlay */}
              <Box
                className="file-actions"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background:
                    "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)",
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: 0,
                  transform: "translateY(20px)",
                  transition: "all 0.3s ease",
                  zIndex: 2,
                }}
              >
                <Box>
                  <Tooltip title="Preview">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(file);
                      }}
                      sx={{
                        color: "white",
                        backgroundColor: "rgba(255,255,255,0.2)",
                        mr: 1,
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.3)",
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <RemoveRedEye />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Download">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                      sx={{
                        color: "white",
                        backgroundColor: "rgba(255,255,255,0.2)",
                        mr: 1,
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.3)",
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <CloudDownload />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          "Are you sure you want to delete this file?"
                        )
                      ) {
                        onFileDelete(file._id);
                      }
                    }}
                    sx={{
                      color: "white",
                      backgroundColor: "rgba(244, 63, 94, 0.8)",
                      "&:hover": {
                        backgroundColor: "rgba(244, 63, 94, 1)",
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {previewFile && (
            <img
              src={previewFile.url}
              alt={previewFile.originalName}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          {previewFile && (
            <Button
              onClick={() => handleDownload(previewFile)}
              startIcon={<Download />}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default memo(FileGridComponent);
