"use client";

import * as React from "react";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/auth.context";
import { can, type rbac_action, type user_target, type company_target } from "@/auth/rbac";

export default function RequirePermission(props: {
  action: rbac_action;
  target?: user_target | company_target;
  children: React.ReactNode;
}) {
  const { me } = useAuth();
  const router = useRouter();

  const allowed = React.useMemo(() => can(me, props.action, props.target), [me, props.action, props.target]);

  if (allowed) return <>{props.children}</>;

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
      <Card sx={{ borderRadius: 3, background: "rgba(255,255,255,0.03)" }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
            Access denied
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
            You don&apos;t have permission to perform this action.
          </Typography>
          <Button
            variant="contained"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
            onClick={() => router.back()}
          >
            Go back
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
