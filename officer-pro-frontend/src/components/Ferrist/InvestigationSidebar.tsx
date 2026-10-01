// -------------------------------------------------------------
// InvestigationSidebar.tsx — cleaner investigation card with sticky header
// -------------------------------------------------------------

import React from "react";
import { Box, Typography, Divider, Chip, Stack } from "@mui/material";

interface InvestigationProps {
  investigation: any;
  noInvestigation?: boolean;
}

const InvestigationSidebar: React.FC<InvestigationProps> = ({
  investigation,
  noInvestigation,
}) => {
  if (noInvestigation || !investigation) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Sticky header */}
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
            Investigation
          </Typography>

          <Chip
            label="No Active Investigation"
            color="error"
            variant="outlined"
            size="small"
          />

          <Divider sx={{ mt: 1.5 }} />
        </Box>

        {/* Scrollable content */}
        <Box sx={{ flex: 1, overflowY: "auto", pt: 1.5 }}>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Create an investigation first to proceed with Ferrist generation.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Sticky header: title only */}
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
          Investigation Details
        </Typography>

        <Divider sx={{ mt: 1 }} />
      </Box>

      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflowY: "auto", pt: 1.5 }}>
        {/* Investigation details */}
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.3 }}>
              FIR No
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
              {investigation.firId}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.3 }}>
              Investigation ID
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
              {investigation.investigationId}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.3 }}>
              Case ID
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
              {investigation.caseCode || "—"}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
              Status
            </Typography>
            <Chip
              size="small"
              label={investigation.status}
              color={
                investigation.status === "IN_PROGRESS" ? "success" : "warning"
              }
              variant="filled"
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.3 }}>
              Created On
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
              {investigation.createdAt?.substring(0, 10) || "—"}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        {/* Footer info */}
        <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.6 }}>
          This section shows the active investigation linked with the selected
          FIR. You must have an active investigation to create or manage
          Ferrist.
        </Typography>
      </Box>
    </Box>
  );
};

export default InvestigationSidebar;
