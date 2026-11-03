import { useState } from "react";
import { exportAll } from "../api/hooks";
import { supabase } from "../api/supabase";
import { useAuth } from "../auth/AuthProvider";
import { toast } from "../components/Toast";
import { Card } from "../components/ui";
import { ymd } from "../lib/dates";
import { downloadText } from "../lib/util";

export function SettingsPage() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const backup = async () => {
    setBusy(true);
    try {
      const data = await exportAll();
      downloadText(`english-tracker-backup-${ymd(new Date())}.json`, JSON.stringify(data, null, 2), "application/json");
    } catch (e) {
      toast(`Yedek alınamadı: ${e instanceof Error ? e.message : "hata"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Card title="Hesap" sub={user?.email}>
        <div className="actions">
          <button className="btn" onClick={() => supabase.auth.signOut()}>Çıkış yap</button>
        </div>
      </Card>
      <Card title="Yedek" sub="Tüm verilerini JSON olarak indir.">
        <div className="actions">
          <button className="btn pri" onClick={backup} disabled={busy}>{busy ? "Hazırlanıyor..." : "Yedek indir"}</button>
        </div>
      </Card>
      <Card title="Telefona yükle" sub="iPhone: Safari'de Paylaş → Ana Ekrana Ekle. Android: Chrome menüsü → Uygulamayı yükle." />
    </>
  );
}
