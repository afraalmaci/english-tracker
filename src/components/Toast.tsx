import { useEffect, useState } from "react";

const EVENT = "app:toast";

/** Show a short message at the bottom of the screen from anywhere in the app. */
export const toast = (message: string) => window.dispatchEvent(new CustomEvent(EVENT, { detail: message }));

export function Toaster() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onToast = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setMsg(null), 2400);
    };
    window.addEventListener(EVENT, onToast);
    return () => {
      window.removeEventListener(EVENT, onToast);
      clearTimeout(timer);
    };
  }, []);
  return (
    <div className={`toast ${msg ? "show" : ""}`} role="status" aria-live="polite">
      {msg}
    </div>
  );
}
