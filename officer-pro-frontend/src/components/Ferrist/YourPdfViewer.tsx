// -----------------------------------------------------------------------------
// YourPdfViewer.tsx — PDF + IMAGE viewer with Zoom + Download (full-screen)
// -----------------------------------------------------------------------------

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Slider,
  Button,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

interface Props {
  open: boolean;
  onClose: () => void;
  fileUrl: string | null;
  fileType: string | null;
}

const YourPdfViewer: React.FC<Props> = ({ open, onClose, fileUrl, fileType }) => {
  if (!open || !fileUrl) return null;

  const isPdf =
    fileType?.includes("pdf") || fileUrl.toLowerCase().endsWith(".pdf");

  const isImage =
    fileType?.includes("image") ||
    /\.(png|jpg|jpeg|webp)$/i.test(fileUrl.toLowerCase());

  const [zoom, setZoom] = useState(1);
  const handleZoom = (_e: any, val: number | number[]) =>
    setZoom(val as number);

  const handleDownload = () => {
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          borderRadius: 0,
          m: 0,
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: "18px",
          pr: 6,
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ddd",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        Document Viewer

        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
          <Button size="small" variant="outlined" onClick={handleDownload}>
            Download
          </Button>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* CONTENT */}
      <DialogContent
        dividers
        sx={{
          p: 0,
          bgcolor: "#000",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          height: "calc(100vh - 56px)", // approx header height
          overflow: "hidden",
        }}
      >
        {/* PDF VIEW */}
        {isPdf && (
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=0`}
            title="pdf"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "#000",
            }}
          />
        )}

        {/* IMAGE VIEW */}
        {isImage && (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              overflow: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "#000",
            }}
          >
            <img
              src={fileUrl}
              alt="document"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center",
                maxWidth: "100%",
                maxHeight: "100%",
                transition: "transform 0.2s ease",
              }}
            />
          </Box>
        )}

        {/* UNSUPPORTED */}
        {!isPdf && !isImage && (
          <Box sx={{ color: "#fff", textAlign: "center", fontSize: 18 }}>
            Unsupported file type: {fileType}
          </Box>
        )}

        {/* ZOOM SLIDER (IMAGE ONLY) */}
        {isImage && (
          <Box
            sx={{
              position: "absolute",
              bottom: 8,
              width: "50%",
              left: "25%",
              bgcolor: "rgba(0,0,0,0.4)",
              p: 1,
              borderRadius: 2,
            }}
          >
            <Slider
              value={zoom}
              min={0.5}
              max={3}
              step={0.1}
              onChange={handleZoom}
              sx={{
                color: "#fff",
                "& .MuiSlider-thumb": { bgcolor: "#fff" },
              }}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default YourPdfViewer;
