import Link from "next/link";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";

export default function CompaniesDetailsIndexPage() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={800}>
            Details
          </Typography>
          <Typography sx={{ opacity: 0.8 }}>
            please select a company from the list to view full details.
          </Typography>

          <Link href="/companies/list" style={{ textDecoration: "none" }}>
            <Button variant="contained">go to company list</Button>
          </Link>
        </Stack>
      </CardContent>
    </Card>
  );
}
