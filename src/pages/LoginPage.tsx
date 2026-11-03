import { useState, type FormEvent } from "react";
import { supabase } from "../api/supabase";
import { useAuth } from "../auth/AuthProvider";
import { Field } from "../components/ui";

type Mode = "signin" | "signup" | "reset";

const redirectTo = () => window.location.origin + window.location.pathname;

export function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : mode === "signup"
          ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo() } })
          : await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectTo() });
    setBusy(false);
    if (res.error) return setMsg({ kind: "err", text: res.error.message });
    if (mode === "signup" && !("session" in res.data && res.data.session))
      setMsg({ kind: "ok", text: "Hesap oluşturuldu. E-postana gelen linke tıklayıp doğrula, sonra giriş yap." });
    if (mode === "reset") setMsg({ kind: "ok", text: "Şifre sıfırlama linki e-postana gönderildi." });
  };

  return (
    <div className="auth">
      <div className="card">
        <h1 className="brand">English Tracker</h1>
        <div className="muted">
          {mode === "signin" ? "Giriş yap" : mode === "signup" ? "Hesap oluştur" : "Şifreni sıfırla"}
        </div>
        <form onSubmit={submit}>
          <Field label="E-posta">
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          {mode !== "reset" && (
            <Field label="Şifre">
              <input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Field>
          )}
          {msg && <div className={msg.kind === "err" ? "error" : "success"}>{msg.text}</div>}
          <div className="actions">
            <button className="btn pri" disabled={busy}>
              {mode === "signin" ? "Giriş yap" : mode === "signup" ? "Kayıt ol" : "Link gönder"}
            </button>
          </div>
        </form>
        <div className="auth-links">
          {mode !== "signin" && <button className="btn ghost sm" onClick={() => setMode("signin")}>Giriş yap</button>}
          {mode !== "signup" && <button className="btn ghost sm" onClick={() => setMode("signup")}>Hesap oluştur</button>}
          {mode !== "reset" && <button className="btn ghost sm" onClick={() => setMode("reset")}>Şifremi unuttum</button>}
        </div>
      </div>
    </div>
  );
}

export function NewPasswordPage() {
  const { clearRecovering } = useAuth();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setErr(error.message);
    else clearRecovering();
  };
  return (
    <div className="auth">
      <div className="card">
        <h1 className="brand">Yeni şifre</h1>
        <form onSubmit={submit}>
          <Field label="Yeni şifre">
            <input type="password" autoComplete="new-password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          {err && <div className="error">{err}</div>}
          <div className="actions"><button className="btn pri">Kaydet</button></div>
        </form>
      </div>
    </div>
  );
}

export function ConfigMissingPage() {
  return (
    <div className="auth">
      <div className="card">
        <h1 className="brand">Supabase ayarı eksik</h1>
        <p className="muted">
          <code>VITE_SUPABASE_URL</code> ve <code>VITE_SUPABASE_ANON_KEY</code> tanımlı değil. Lokal geliştirmede <code>.env</code> dosyasına,
          GitHub Pages için repo Secrets kısmına ekle. Ayrıntılar README'de.
        </p>
      </div>
    </div>
  );
}
