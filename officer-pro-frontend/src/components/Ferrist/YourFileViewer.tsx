import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  open: boolean;
  onClose: () => void;

  fileUrl: string | null;   // S3 URL
  fileName?: string | null; // optional
  mimeType?: string | null; // optional, but fallback auto-detect
}

/** Auto-detect MIME from URL */
const detectMimeType = (url?: string | null): string => {
  if (!url) return "unknown";

  const u = url.toLowerCase();

  if (u.endsWith(".pdf")) return "application/pdf";
  if (u.endsWith(".jpg") || u.endsWith(".jpeg")) return "image/jpeg";
  if (u.endsWith(".png")) return "image/png";
  if (u.endsWith(".webp")) return "image/webp";
  if (u.endsWith(".mp4")) return "video/mp4";
  if (u.endsWith(".mov")) return "video/quicktime";
  if (u.endsWith(".avi")) return "video/x-msvideo";
  if (u.endsWith(".mp3")) return "audio/mpeg";
  if (u.endsWith(".wav")) return "audio/wav";

  return "unknown";
};

const YourFileViewer: React.FC<Props> = ({ open, onClose, fileUrl, fileName, mimeType }) => {
  if (!open || !fileUrl) return null;

  const type = mimeType || detectMimeType(fileUrl);

  const isPdf = type.includes("pdf");
  const isImage = type.includes("image");
  const isVideo = type.includes("video");
  const isAudio = type.includes("audio");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          borderRadius: "14px",
          overflow: "hidden",
        },
      }}
    >
      {/* ================= Header ================= */}
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: "18px",
          pr: 6,
          background: "#fafafa",
        }}
      >
        {fileName || "Document Viewer"}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 16, top: 10 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* ================= Content ================= */}
      <DialogContent
        dividers
        sx={{
          height: "80vh",
          p: 0,
          bgcolor: "#f5f5f5",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >

        {/* ---------- PDF ---------- */}
        {isPdf && (
          <iframe
            src={fileUrl}
            title="pdf-viewer"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        )}

        {/* ---------- IMAGE ---------- */}
        {isImage && (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              overflow: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "#111",
            }}
          >
            <img
              src={fileUrl}
              alt="document"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
        )}

        {/* ---------- VIDEO ---------- */}
        {isVideo && (
          <video
            src={fileUrl}
            controls
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "#000",
            }}
          />
        )}

        {/* ---------- AUDIO ---------- */}
        {isAudio && (
          <audio
            src={fileUrl}
            controls
            style={{ width: "100%" }}
          />
        )}

        {/* ---------- UNSUPPORTED ---------- */}
        {!isPdf && !isImage && !isVideo && !isAudio && (
          <Typography
            sx={{
              textAlign: "center",
              width: "100%",
              fontSize: "18px",
              color: "text.secondary",
            }}
          >
            Unsupported file type
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default YourFileViewer;
