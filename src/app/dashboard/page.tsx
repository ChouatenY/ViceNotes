import { db } from "@/lib/db";
import { $notes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import React from "react";
import DashboardClient from "@/components/DashboardClient";

type Props = {};

const DashboardPage = async (props: Props) => {
  // Fetch initial notes with a default user ID
  // The client component will fetch the actual user's notes once authenticated
  const userId = "default-user";
  const notes = await db
    .select()
    .from($notes)
    .where(eq($notes.userId, userId));

  return <DashboardClient initialNotes={notes} />;
};

export default DashboardPage;
