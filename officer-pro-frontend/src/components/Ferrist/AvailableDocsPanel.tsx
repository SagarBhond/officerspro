// -----------------------------------------------------------------------------
// AvailableDocsPanel.tsx — Available documents with expand/collapse
// -----------------------------------------------------------------------------

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  Tooltip,
  IconButton,
  Button,
} from "@mui/material";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import InfoIcon from "@mui/icons-material/Info";
import VisibilityIcon from "@mui/icons-material/Visibility";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";

export interface AvailableDoc {
  documentId: number;
  evidenceId: number;
  investigationId: string;

  evidenceName: string;
  description: string;
  evidenceType: string;

  fileName: string;
  fileType: string;
  documentUrl: string;

  uploadedOn: string;
  pageCount?: number;
}

interface Props {
  docs: AvailableDoc[];
  ferristDocIds: number[];
  disabled: boolean;

  onAddToFerrist: (doc: any) => void;
  onViewDoc: (doc: AvailableDoc) => void;

  expanded?: boolean;
  onToggleExpand?: () => void;
}

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
const AvailableDocsPanel: React.FC<Props> = ({
  docs = [],
  ferristDocIds = [],
  disabled,
  onAddToFerrist,
  onViewDoc,
  expanded = false,
  onToggleExpand,
}) => {
  const safeDocs = Array.isArray(docs) ? docs : [];
  const availableDocs = safeDocs.filter(
    (d) => !ferristDocIds.includes(d.documentId)
  );

  if (availableDocs.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Available Documents
          </Typography>
          {onToggleExpand && (
            <Button
              size="small"
              variant="text"
              sx={{ minWidth: "auto", px: 1 }}
              startIcon={expanded ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
              onClick={onToggleExpand}
            >
              {expanded ? "Collapse" : "Expand"}
            </Button>
          )}
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 120,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 1,
            border: "1px dashed",
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <Typography color="text.secondary">
            <InfoIcon sx={{ mr: 1, fontSize: 18 }} />
            No available documents
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Available Documents
        </Typography>
        {onToggleExpand && (
          <Button
            size="small"
            variant="text"
            sx={{ minWidth: "auto", px: 1 }}
            startIcon={expanded ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
            onClick={onToggleExpand}
          >
            {expanded ? "Collapse" : "Expand"}
          </Button>
        )}
      </Box>

      <TableContainer
        sx={{
          flex: 1,
          minHeight: expanded ? 0 : 320,
          maxHeight: expanded ? "100%" : 320,
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          overflowY: "auto",
          overflowX: "auto",
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 60 }}>#</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>File</TableCell>
              <TableCell sx={{ width: 180 }}>Uploaded</TableCell>
              <TableCell sx={{ width: 90 }} align="center">
                View
              </TableCell>
              <TableCell sx={{ width: 90 }} align="center">
                Add
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {availableDocs.map((doc, idx) => (
              <TableRow key={doc.documentId} hover>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{doc.description || doc.evidenceName}</TableCell>
                <TableCell>{doc.fileName}</TableCell>
                <TableCell>{formatDateTime(doc.uploadedOn)}</TableCell>

                {/* VIEW */}
                <TableCell align="center">
                  <Tooltip title="View File">
                    <span>
                      <IconButton
                        size="small"
                        sx={{ p: 0.5 }}
                        color="info"
                        onClick={() => onViewDoc(doc)}
                      >
                        <VisibilityIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>

                {/* ADD */}
                <TableCell align="center">
                  <Tooltip title="Add to Ferrist">
                    <span>
                      <IconButton
                        size="small"
                        sx={{ p: 0.5 }}
                        color="primary"
                        disabled={disabled}
                        onClick={() => onAddToFerrist(doc)}
                      >
                        <AddCircleIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AvailableDocsPanel;
