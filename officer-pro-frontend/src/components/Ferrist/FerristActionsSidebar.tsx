// -------------------------------------------------------------
// FerristActionsSidebar.tsx — actions + scroll, fixed title+status
// -------------------------------------------------------------

import React from "react";
import {
  Box,
  Button,
  Divider,
  Typography,
  Chip,
  Stack,
} from "@mui/material";

interface Props {
  ferristExists: boolean;
  isFinalized: boolean;
  chargesheetId: string | null;
  isCreatingChargesheet: boolean;
  isSubmittingChargesheet: boolean;

  onCreateFerrist: () => void;
  onFinalize: () => void;
  onCreateVersion: () => void;

  onViewChargesheet: () => void;
  onCreateChargesheet: () => void;
  onSubmitChargesheet: () => void;
  onPreviewChargesheet: () => void;

  expandedPanel: "ferrist" | "available" | null;
  setExpandedPanel: (p: "ferrist" | "available" | null) => void;
}

const FerristActionsSidebar: React.FC<Props> = ({
  ferristExists,
  isFinalized,
  chargesheetId,
  isCreatingChargesheet,
  isSubmittingChargesheet,
  onCreateFerrist,
  onFinalize,
  onCreateVersion,
  onViewChargesheet,
  onCreateChargesheet,
  onSubmitChargesheet,
  onPreviewChargesheet,
  expandedPanel,
  setExpandedPanel,
}) => {
  const toggleFerrist = () =>
    setExpandedPanel(expandedPanel === "ferrist" ? null : "ferrist");
  const toggleAvailable = () =>
    setExpandedPanel(expandedPanel === "available" ? null : "available");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Sticky header: title + status only */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          bgcolor: "background.paper",
          pt: 1,
          pb: 1.5,
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 1, fontWeight: 600, fontSize: 18 }}
        >
          Ferrist Actions
        </Typography>

        <Box>
          <Typography sx={{ fontSize: 13, mb: 0.5 }}>
            Ferrist Status:
          </Typography>
          {!ferristExists ? (
            <Chip label="No Ferrist" color="warning" size="small" />
          ) : isFinalized ? (
            <Chip label="Finalized" color="success" size="small" />
          ) : (
            <Chip label="Draft" color="info" size="small" />
          )}
        </Box>

        <Divider sx={{ mt: 1.5 }} />
      </Box>

      {/* Everything below can scroll */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          pt: 1.5,
        }}
      >
        {/* Focus buttons */}
        {ferristExists && (
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <Button
              fullWidth
              size="small"
              variant={expandedPanel === "ferrist" ? "contained" : "outlined"}
              onClick={toggleFerrist}
            >
              Ferrist Focus
            </Button>
            <Button
              fullWidth
              size="small"
              variant={
                expandedPanel === "available" ? "contained" : "outlined"
              }
              onClick={toggleAvailable}
            >
              Available Focus
            </Button>
          </Stack>
        )}

        {/* Create Ferrist CTA */}
        {!ferristExists && (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ py: 1, mb: 1.5 }}
            onClick={onCreateFerrist}
          >
            Create Ferrist
          </Button>
        )}

        {ferristExists && (
          <Stack spacing={1.5}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              sx={{ py: 1 }}
              disabled={isFinalized}
              onClick={onFinalize}
            >
              Finalize Ferrist
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="info"
              sx={{ py: 1 }}
              disabled={!isFinalized}
              onClick={onCreateVersion}
            >
              Create New Version
            </Button>

            {!isFinalized && (
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                sx={{ py: 1 }}
                onClick={onPreviewChargesheet}
              >
                Preview Chargesheet
              </Button>
            )}

            <Divider sx={{ my: 1.5 }} />

            {chargesheetId ? (
              <>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  sx={{ py: 1 }}
                  onClick={onViewChargesheet}
                >
                  View Chargesheet
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="success"
                  sx={{ py: 1 }}
                  disabled={isSubmittingChargesheet}
                  onClick={onSubmitChargesheet}
                >
                  {isSubmittingChargesheet
                    ? "Submitting..."
                    : "Submit to Court"}
                </Button>
              </>
            ) : (
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                sx={{ py: 1 }}
                disabled={!isFinalized || isCreatingChargesheet}
                onClick={onCreateChargesheet}
              >
                {isCreatingChargesheet ? "Creating..." : "Create Chargesheet"}
              </Button>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default FerristActionsSidebar;
