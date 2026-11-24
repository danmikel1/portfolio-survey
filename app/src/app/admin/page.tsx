import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin Analytics — Portfolio Survey",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return <AdminDashboardClient username={session.sub} />;
}
