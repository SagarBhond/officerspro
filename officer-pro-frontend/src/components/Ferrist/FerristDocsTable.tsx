// -----------------------------------------------------------------------------
// FerristDocsTable.tsx — Ferrist document panel with expand/collapse
// -----------------------------------------------------------------------------

import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";

import { Draggable } from "@hello-pangea/dnd";

export interface FerristDoc {
  documentId: number;
  seq: number;
  fileName: string;
  docDescription: string;
  fileUrl: string;
  fileType: string;
  date: string;
  pageCount: number;
}

interface Props {
  docs: FerristDoc[];
  disabled: boolean;
  isFinalized: boolean;
  dragDrop?: boolean;

  onRemoveDoc: (docId: number) => void;
  onViewDoc: (doc: FerristDoc) => void;

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

const FerristDocsTable: React.FC<Props> = ({
  docs = [],
  disabled,
  isFinalized,
  dragDrop = true,
  onRemoveDoc,
  onViewDoc,
  expanded = false,
  onToggleExpand,
}) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  if (!docs.length) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Ferrist Document Panel
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
          }}
        >
          <Typography color="text.secondary">
            No documents added to Ferrist
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header row */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Ferrist Document Panel
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
          minHeight: 0,
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          overflowX: "auto",
          overflowY: "auto",
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 60 }}>Seq</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>File</TableCell>
              <TableCell
                sx={{ width: 180, display: { xs: "none", sm: "table-cell" } }}
              >
                Uploaded
              </TableCell>

              <TableCell align="center" sx={{ width: 70 }}>
                View
              </TableCell>
              <TableCell align="center" sx={{ width: 80 }}>
                Remove
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {docs.map((doc, index) => (
              <Draggable
                key={doc.documentId}
                draggableId={`doc-${doc.documentId}`}
                index={index}
                isDragDisabled={!dragDrop}
              >
                {(provided) => (
                  <TableRow
                    hover
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    sx={{
                      cursor: dragDrop ? "grab" : "default",
                      userSelect: "none",
                      "&:nth-of-type(odd)": { backgroundColor: "grey.50" },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2">{index + 1}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        noWrap={!isSmall}
                        sx={{ color: "text.primary" }}
                        title={doc.docDescription}
                      >
                        {doc.docDescription}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        noWrap={!isSmall}
                        sx={{ color: "text.primary" }}
                        title={doc.fileName}
                      >
                        {doc.fileName}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                      <Typography variant="body2">
                        {formatDateTime(doc.date)}
                      </Typography>
                    </TableCell>

                    {/* VIEW */}
                    <TableCell align="center">
                      <Tooltip title="View Document">
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

                    {/* REMOVE */}
                    <TableCell align="center">
                      <Tooltip title="Remove Document">
                        <span>
                          <IconButton
                            size="small"
                            sx={{ p: 0.5 }}
                            color="error"
                            disabled={isFinalized || disabled}
                            onClick={() => onRemoveDoc(doc.documentId)}
                          >
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )}
              </Draggable>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FerristDocsTable;
