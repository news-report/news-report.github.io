"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminToken } from "@/lib/api";
import AuthPanel from "@/components/admin/AuthPanel";
import SourceManager from "@/components/admin/SourceManager";
import BackfillPanel from "@/components/admin/BackfillPanel";
import ItemsTable from "@/components/admin/ItemsTable";
import adminStyles from "@/styles/admin.module.css";

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setUnlocked(!!getAdminToken());
  }, []);

  const handleUnlock = useCallback(() => setUnlocked(true), []);

  return (
    <main className={adminStyles.shell}>
      <header className={adminStyles.header}>
        <div>
          <p className={adminStyles.eyebrow}>Dark Mode Admin</p>
          <h1 className={adminStyles.heading1}>RSS Sources</h1>
        </div>
        <a href="/" className={adminStyles.backLink}>
          Back to Feed
        </a>
      </header>

      <AuthPanel onUnlock={handleUnlock} />

      {unlocked && (
        <>
          <SourceManager />
          <BackfillPanel onBackfillDone={() => { }} />
          <ItemsTable />
        </>
      )}
    </main>
  );
}
