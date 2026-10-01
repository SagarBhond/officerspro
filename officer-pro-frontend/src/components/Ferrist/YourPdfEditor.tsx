import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  docId: number | string | null;
  onClose: () => void;
}

const YourPdfEditor: React.FC<Props> = ({ docId, onClose }) => {
  if (!docId) return null;

  // PDF endpoint served from backend/gateway
  const pdfUrl = `/api/document/viewpdf/${docId}`;

  return (
    <Dialog open={Boolean(docId)} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle sx={{ position: "relative", pr: 5 }}>
        PDF Viewer

        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ height: "80vh", p: 0, backgroundColor: "#f5f5f5" }}
      >
        <iframe
          title="pdf-viewer"
          src={pdfUrl}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default YourPdfEditor;
