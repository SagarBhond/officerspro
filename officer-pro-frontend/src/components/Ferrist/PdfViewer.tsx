// ---------------------------------------------------------
// PdfViewer.tsx — Supports Images + PDFs (S3 URLs)
// ---------------------------------------------------------
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

interface Props {
  open: boolean;
  onClose: () => void;
  fileUrl: string | null;
  fileType: string | null;
}

const PdfViewer: React.FC<Props> = ({ open, onClose, fileUrl, fileType }) => {
  if (!fileUrl) return null;

  const isImage =
    fileType?.includes("image") ||
    fileUrl.endsWith(".jpg") ||
    fileUrl.endsWith(".jpeg") ||
    fileUrl.endsWith(".png");

  const isPdf =
    fileType?.includes("pdf") || fileUrl.endsWith(".pdf");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          height: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pr: 2,
        }}
      >
        Document Viewer
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, height: "100%" }}>
        {/* IMAGE */}
        {isImage && (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              background: "#000",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={fileUrl}
              alt="document"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
        )}

        {/* PDF */}
        {isPdf && (
          <iframe
            src={fileUrl}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        )}

        {/* Unsupported */}
        {!isImage && !isPdf && (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <h3>Preview not supported</h3>
            <p>File type: {fileType}</p>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewer;
