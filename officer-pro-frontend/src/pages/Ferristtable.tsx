// -----------------------------------------------------------------------------
// Ferristtable.tsx — Ferrist + Chargesheet integration (grid layout)
// -----------------------------------------------------------------------------

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import {
  Box,
  Paper,
  Snackbar,
  Alert,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from '@mui/material';

import InvestigationSidebar from '../components/Ferrist/InvestigationSidebar';
import FerristDocsTable from '../components/Ferrist/FerristDocsTable';
import FerristActionsSidebar from '../components/Ferrist/FerristActionsSidebar';
import AvailableDocsPanel from '../components/Ferrist/AvailableDocsPanel';
import YourPdfViewer from '../components/Ferrist/YourPdfViewer';

import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import request from '../Service/axios_helper';

import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';

const Ferristtable = ({ handleLogout }) => {
  const { firNo } = useParams();
  const navigate = useNavigate();

  const [investigationData, setInvestigationData] = useState<any>(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);

  const [ferristId, setFerristId] = useState<number | null>(null);
  const [ferristExists, setFerristExists] = useState(false);

  const [allDocs, setAllDocs] = useState<any[]>([]);
  const [ferristDocs, setFerristDocs] = useState<any[]>([]);
  const [availableDocs, setAvailableDocs] = useState<any[]>([]);

  const [isFinalized, setIsFinalized] = useState(false);
  const [chargesheetId, setChargesheetId] = useState<string | null>(null);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState<{ url: string | null; type: string | null }>(
    { url: null, type: null }
  );

  const [isCreatingChargesheet, setIsCreatingChargesheet] = useState(false);
  const [isSubmittingChargesheet, setIsSubmittingChargesheet] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    msg: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    msg: '',
    severity: 'success',
  });

  const [showPopup, setShowPopup] = useState(false);

  // right panel focus: null = split, "ferrist" or "available"
  const [expandedPanel, setExpandedPanel] = useState<"ferrist" | "available" | null>(null);

  const noInvestigation =
    !investigationData || investigationData.status !== 'IN_PROGRESS';

  const toast = (
    msg: string,
    severity: 'success' | 'error' | 'info' | 'warning' = 'success',
  ) => setSnackbar({ open: true, msg, severity });

  const wrap =
    (fn: (...args: any[]) => Promise<void>, ok: string, err: string) =>
    async (...args: any[]) => {
      try {
        await fn(...args);
        toast(ok, 'success');
      } catch {
        toast(err, 'error');
      }
    };

  // LOAD INVESTIGATION
  const loadInvestigation = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request(
        'investigation',
        'GET',
        `/investigation/investigation/active/${firNo}`,
      );
      if (res?.exists) setInvestigationData(res);
      else setInvestigationData(null);
    } catch {
      setInvestigationData(null);
    } finally {
      setChecked(true);
      setLoading(false);
    }
  }, [firNo]);

  useEffect(() => {
    loadInvestigation();
  }, [loadInvestigation]);

  // POPUP — NO INVESTIGATION
  useEffect(() => {
    if (checked && !loading && investigationData == null) {
      setShowPopup(true);
    }
  }, [checked, loading, investigationData]);

  // LOAD ALL DOCS
  const loadAllDocs = useCallback(async () => {
    const invId = investigationData?.investigationId;
    if (!invId) return;

    try {
      const res = await request(
        'investigation',
        'GET',
        `/investigation/investigation/available?investigationId=${invId}`,
      );
      setAllDocs(res || []);
    } catch {
      setAllDocs([]);
    }
  }, [investigationData?.investigationId]);

  useEffect(() => {
    loadAllDocs();
  }, [loadAllDocs]);

  // LOAD ONE FERRIST + MERGE
  const loadFerristFull = useCallback(
    async (id: number | null) => {
      if (!id) return;
      try {
        const res = await request('ferrist', 'GET', `/${id}`);

        const ferristMeta = res.ferrist;
        const rows: any[] = Array.isArray(res.documents) ? res.documents : [];

        setFerristExists(true);
        setIsFinalized(Boolean(ferristMeta.isFinalized));

        if (ferristMeta.chargesheetId) {
          setChargesheetId(ferristMeta.chargesheetId);
        }

        const merged = rows
          .map((item) => {
            const meta = allDocs.find((x) => x.documentId === item.documentId);
            if (!meta) return null;

            return {
              documentId: meta.documentId,
              seq: item.sequenceNumber,
              fileName: meta.fileName,
              docDescription: meta.description || meta.evidenceName,
              date: meta.uploadedOn,
              fileUrl: meta.documentUrl,
              fileType: meta.fileType,
              pageCount: 1,
            };
          })
          .filter(Boolean)
          .sort((a: any, b: any) => a.seq - b.seq);

        setFerristDocs(merged);
      } catch {
        setFerristDocs([]);
      }
    },
    [allDocs],
  );

  // LOAD FERRIST LIST → PICK LATEST
  const loadFerristList = useCallback(async () => {
    const invId = investigationData?.investigationId;
    if (!invId) return;

    try {
      const res = await request(
        'ferrist',
        'GET',
        `/all?investigationId=${invId}`,
      );

      const list: any[] = Array.isArray(res) ? res : [];

      if (!list.length) {
        setFerristExists(false);
        setFerristId(null);
        setFerristDocs([]);
        setAvailableDocs([]);
        setIsFinalized(false);
        setChargesheetId(null);
        return;
      }

      const latest = list[0];
      const latestId = latest.ferristId as number;
      setFerristId(latestId);
      await loadFerristFull(latestId);
    } catch {
      setFerristExists(false);
    }
  }, [investigationData?.investigationId, loadFerristFull]);

  // CHARGESHEET — CREATE
  const handleCreateChargesheet = async () => {
    if (isCreatingChargesheet) return;
    if (!ferristId || !investigationData?.firId) {
      toast("Ferrist or FIR not available", "error");
      return;
    }

    setIsCreatingChargesheet(true);
    try {
      const res = await request("chargesheet", "POST", "/create", {
        ferristId,
        firId: investigationData.firId,
        courtName: 'Court of Session',
        remarks: 'Generated from Ferrist',
        createdBy: 201,
      });

      const data = res.data;
      if (data?.chargesheetId) {
        setChargesheetId(data.chargesheetId);
      }

      await loadFerristFull(ferristId);
      toast("Chargesheet created", "success");
    } catch {
      toast("Failed to create chargesheet", "error");
    } finally {
      setIsCreatingChargesheet(false);
    }
  };

  // CHARGESHEET — VIEW
  // CHARGESHEET — VIEW
const handleViewChargesheet = wrap(
  async () => {
    if (!chargesheetId) {
      toast('No chargesheet found', 'error');
      return;
    }

    // 1) Get document-id
    const docIdRes = await request(
      'chargesheet',
      'GET',
      `/${chargesheetId}/document-id`,
      null, // data (no body for GET)
    );
    console.log('📄 document-id res:', docIdRes);
    const documentId = docIdRes?.documentId;
    if (!documentId) {
      toast('No merged document found for this chargesheet', 'error');
      return;
    }

    // 2) Get signed URL
    const signedRes = await request(
      'document',
      'GET',
      `/${documentId}/signed-url`,
      null, // data (no body for GET)
    );
    console.log('🔗 signed-url res:', signedRes);
    const signedUrl = signedRes?.signedUrl;
    if (!signedUrl) {
      toast('Unable to generate signed URL', 'error');
      return;
    }

    // 3) Open viewer
    setViewerFile({ url: signedUrl, type: 'application/pdf' });
    setViewerOpen(true);
  },
  'Opened chargesheet',
  'Failed to open chargesheet'
);


  // CHARGESHEET — PREVIEW
  // CHARGESHEET — PREVIEW
const handlePreviewChargesheet = async () => {
  if (!ferristId || !investigationData?.firId) {
    toast("Ferrist or FIR not available", "error");
    return;
  }
  try {
    console.log("Calling preview with:", ferristId, investigationData.firId);

    const res = await request(
      "chargesheet",
      "GET",
      `/preview?ferristId=${ferristId}&firId=${investigationData.firId}`,
      null,
      { responseType: "blob" }
    );

    console.log("Response received:", res.status, res.data.size);

    // Create blob URL directly from res.data
    const url = URL.createObjectURL(res.data);

    console.log("Blob URL created:", url);

    setViewerFile({ url, type: "application/pdf" });
    setViewerOpen(true);
  } catch (error) {
    console.error("Preview error details:", error);
    console.error("Error message:", error?.message);
    console.error("Error response:", error?.response?.data);
    toast("Failed to preview chargesheet", "error");
  }
};


  // CHARGESHEET — SUBMIT
  const handleSubmitChargesheet = async () => {
    if (isSubmittingChargesheet) return;
    if (!chargesheetId) {
      toast("No chargesheet to submit", "error");
      return;
    }

    setIsSubmittingChargesheet(true);
    try {
      await request("chargesheet", "POST", `/submit`, {
        chargesheetId: chargesheetId,
        submittedBy: 201,
        courtName: investigationData?.courtName || "Court of Session",
        hearingDate: null,
        remarks: "Submitted to court",
      });

      toast("Chargesheet submitted", "success");
      await loadFerristFull(ferristId);
    } catch {
      toast("Failed to submit chargesheet", "error");
    } finally {
      setIsSubmittingChargesheet(false);
    }
  };

  // LOAD AVAILABLE DOCS
  const loadAvailableDocs = useCallback(async () => {
    const invId = investigationData?.investigationId;
    if (!invId || !ferristId) return;

    try {
      const res = await request(
        'investigation',
        'GET',
        `/investigation/investigation/available?investigationId=${invId}&ferristid=${ferristId}`,
      );
      setAvailableDocs(res || []);
    } catch {
      setAvailableDocs([]);
    }
  }, [investigationData?.investigationId, ferristId]);

  // INITIAL FERRIST LOAD
  useEffect(() => {
    if (investigationData?.investigationId) {
      loadFerristList();
    }
  }, [investigationData?.investigationId, loadFerristList]);

  // AVAILABLE DOCS WHEN FERRIST ID CHANGES
  useEffect(() => {
    loadAvailableDocs();
  }, [ferristId, loadAvailableDocs]);

  // DnD REORDER
  const handleReorder = async (result: DropResult) => {
    if (!result.destination) return;

    const newOrder = Array.from(ferristDocs);
    const [moved] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, moved);

    setFerristDocs(newOrder);

    try {
      await request('ferrist', 'PUT', `/${ferristId}/reorder`, {
        updatedBy: 201,
        remarks: 'Sequence update',
        newOrder: newOrder.map((x: any) => ({ documentId: x.documentId })),
      });
      toast('Sequence updated');
    } catch {
      toast('Failed to save order', 'error');
      await loadFerristFull(ferristId);
    }
  };

  // CRUD helpers
  const handleCreateFerrist = wrap(
    async () => {
      const res = await request('ferrist', 'POST', '/create', {
        firId: investigationData.firId,
        investigationId: investigationData.investigationId,
        caseId: investigationData.caseCode,
        createdBy: 201,
      });

      const id = res.ferristId as number;
      setFerristId(id);

      await loadAllDocs();
      await loadFerristFull(id);
      await loadAvailableDocs();
      await loadInvestigation();
    },
    'Ferrist created',
    'Failed to create',
  );

  const handleAdd = async (doc: any) => {
    try {
      await request("ferrist", "POST", `/${ferristId}/document/add`, {
        documentId: doc.documentId,
        description: doc.description || doc.evidenceName,
        addedBy: 201,
      });

      await loadFerristFull(ferristId);
      await loadAvailableDocs();
      toast("Document added", "success");
    } catch {
      toast("Failed", "error");
    }
  };

  const handleRemove = wrap(
    async (docId: number) => {
      await request(
        'ferrist',
        'PUT',
        `/${ferristId}/document/${docId}/remove`,
        { removedBy: 201 },
      );
      await loadFerristFull(ferristId);
      await loadAvailableDocs();
    },
    'Document removed',
    'Failed',
  );

  const handleFinalize = wrap(
    async () => {
      await request('ferrist', 'PUT', `/${ferristId}/finalize`, {
        finalizedBy: 201,
      });

      await loadFerristFull(ferristId);
      await loadInvestigation();
    },
    'Ferrist finalized',
    'Failed',
  );

  const handleCreateVersion = wrap(
    async () => {
      const res = await request('ferrist', 'POST', '/version/create', {
        previousFerristId: ferristId,
        createdBy: 201,
        remarks: 'Revised version',
      });

      const newId = res.ferristId as number;

      setFerristExists(false);
      setFerristDocs([]);
      setAvailableDocs([]);
      setIsFinalized(false);
      setChargesheetId(null);

      setFerristId(newId);

      await loadInvestigation();
      await loadAllDocs();
      await loadFerristFull(newId);
      await loadAvailableDocs();
    },
    'New version created',
    'Failed',
  );

  const handleViewDoc = async (doc: any) => {
    try {
      const res = await request(
        'document',
        'GET',
        `/${doc.documentId}/signed-url`,
      );

      const signedUrl = res?.signedUrl;

      if (!signedUrl) {
        toast('Unable to generate signed URL', 'error');
        return;
      }

      setViewerFile({ url: signedUrl, type: doc.fileType });
      setViewerOpen(true);
    } catch {
      toast('Failed to open document', 'error');
    }
  };

  if (loading) {
    return (
      <DefaultLayout handleLogout={handleLogout}>
        <Breadcrumb pageName="Ferrist Generation" />
        <Typography sx={{ p: 4 }}>Loading...</Typography>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout handleLogout={handleLogout}  hideSidebar={viewerOpen}>
      <Breadcrumb pageName="Ferrist Generation" />
 
      <Box
        sx={{
          height: "calc(100vh - 70px)",
          p: 1,
          boxSizing: "border-box",
        }}
      >
        {/* 2x2 grid:
            Row 1: Investigation | Ferrist Docs
            Row 2: Ferrist Actions | Available Docs */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "minmax(260px, 22%) 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: 1,
            height: "100%",
            overflow: "hidden",
          }}
        >
          {/* Row 1, Col 1: Investigation */}
          <Paper
            sx={{
              gridColumn: "1 / 2",
              gridRow: "1 / 2",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 2 }}>
              <InvestigationSidebar
                investigation={investigationData}
                noInvestigation={noInvestigation}
              />
            </Box>
          </Paper>

          {/* Row 2, Col 1: Ferrist Actions */}
          <Paper
            sx={{
              gridColumn: "1 / 2",
              gridRow: "2 / 3",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 2 }}>
              <FerristActionsSidebar
                ferristExists={ferristExists}
                isFinalized={isFinalized}
                chargesheetId={chargesheetId}
                onCreateFerrist={handleCreateFerrist}
                onFinalize={handleFinalize}
                onCreateVersion={handleCreateVersion}
                onViewChargesheet={handleViewChargesheet}
                onCreateChargesheet={handleCreateChargesheet}
                onSubmitChargesheet={handleSubmitChargesheet}
                onPreviewChargesheet={handlePreviewChargesheet}
                isCreatingChargesheet={isCreatingChargesheet}
                isSubmittingChargesheet={isSubmittingChargesheet}
                expandedPanel={expandedPanel}
                setExpandedPanel={setExpandedPanel}
              />
            </Box>
          </Paper>

          {/* Row 1–2, Col 2: Ferrist Docs when expanded, else row 1 */}
          <Paper
            sx={{
              gridColumn: "2 / 3",
              gridRow: expandedPanel === "ferrist" ? "1 / 3" : "1 / 2",
              display: expandedPanel === "available" ? "none" : "flex",
              flexDirection: "column",
              overflow: "hidden",
              p: 2,
            }}
          >
            {!ferristExists ? (
              <Typography
                sx={{ mt: 5, textAlign: 'center', color: 'text.secondary' }}
              >
                No Ferrist found — click "Create Ferrist"
              </Typography>
            ) : (
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <DragDropContext onDragEnd={handleReorder}>
                  <Droppable droppableId="ferrist-docs">
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{ height: "100%" }}
                      >
                        <FerristDocsTable
                          docs={ferristDocs}
                          onRemoveDoc={handleRemove}
                          onViewDoc={handleViewDoc}
                          isFinalized={isFinalized}
                          dragDrop={!isFinalized}
                          disabled={isFinalized}
                          expanded={expandedPanel === "ferrist"}
                          onToggleExpand={() =>
                            setExpandedPanel((prev) =>
                              prev === "ferrist" ? null : "ferrist"
                            )
                          }
                        />
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </DragDropContext>
              </Box>
            )}
          </Paper>

          {/* Row 1–2, Col 2: Available Docs when expanded, else row 2 */}
          <Paper
            sx={{
              gridColumn: "2 / 3",
              gridRow: expandedPanel === "available" ? "1 / 3" : "2 / 3",
              display: expandedPanel === "ferrist" ? "none" : "flex",
              flexDirection: "column",
              overflow: "hidden",
              p: 2,
            }}
          >
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <AvailableDocsPanel
                docs={availableDocs}
                ferristDocIds={ferristDocs.map((d: any) => d.documentId)}
                onAddToFerrist={handleAdd}
                onViewDoc={handleViewDoc}
                disabled={isFinalized}
                expanded={expandedPanel === "available"}
                onToggleExpand={() =>
                  setExpandedPanel((prev) =>
                    prev === "available" ? null : "available"
                  )
                }
              />
            </Box>
          </Paper>
        </Box>
      </Box>

      <YourPdfViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        fileUrl={viewerFile.url}
        fileType={viewerFile.type}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.msg}</Alert>
      </Snackbar>

      <Dialog open={showPopup}>
        <DialogTitle>No Investigation Found</DialogTitle>
        <DialogContent>Create investigation first for this FIR.</DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/ferrist')} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </DefaultLayout>
  );
};

export default Ferristtable;
