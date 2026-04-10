import { useEffect, useState } from "react";

// Bump this version string to reset the prompt for all users
const STORAGE_KEY = "flexiledger_pwa_prompt_v2";

function isIOS() {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isInStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isMobile() {
  // Broad check — catches Android, iPhone, iPad, generic mobile browsers
  return (
    /android|iphone|ipad|ipod|mobile|tablet|touch/i.test(navigator.userAgent) ||
    navigator.maxTouchPoints > 1
  );
}

export default function PWAInstallPrompt() {
  const [show, setShow]                   = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [ios, setIos]                     = useState(false);
  const [installed, setInstalled]         = useState(false);
  const [canInstall, setCanInstall]       = useState(false);

  useEffect(() => {
    // Already dismissed before?
    if (localStorage.getItem(STORAGE_KEY) === "true") return;
    // Already running as installed PWA?
    if (isInStandaloneMode()) return;
    // Not a mobile/touch device?
    if (!isMobile()) return;

    const iosDevice = isIOS();
    setIos(iosDevice);

    // Listen for Android native install prompt (may or may not fire)
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setTimeout(() => {
        setShow(false);
        localStorage.setItem(STORAGE_KEY, "true");
      }, 2000);
    });

    // Always show popup on mobile after 1.5s
    // regardless of whether beforeinstallprompt fired
    const timer = setTimeout(() => setShow(true), 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    }
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleDismiss}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,15,40,0.55)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 9998,
          animation: "pwaFadeIn 0.3s ease forwards",
        }}
      />

      {/* Popup card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Install FlexiLedger"
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100vw - 32px)",
          maxWidth: "400px",
          zIndex: 9999,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(28px) saturate(200%)",
          WebkitBackdropFilter: "blur(28px) saturate(200%)",
          border: "1.5px solid rgba(255,255,255,0.95)",
          borderRadius: "28px",
          boxShadow:
            "0 30px 60px rgba(79,70,229,0.22), 0 12px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1)",
          padding: "22px 18px 18px",
          animation: "pwaSlideUp 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
          {/* App icon */}
          <div style={{
            width: "52px", height: "52px", borderRadius: "14px", flexShrink: 0,
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 20px rgba(79,70,229,0.4)",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
              <line x1="12" y1="12" x2="12" y2="16"/>
              <line x1="10" y1="14" x2="14" y2="14"/>
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: "16px", color: "#1e1b4b" }}>
              Install FlexiLedger
            </p>
            <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#6366f1", fontWeight: 600 }}>
              📊 Smart Financial Tracker
            </p>
          </div>

          {/* Close */}
          <button
            id="pwa-dismiss-btn"
            onClick={handleDismiss}
            aria-label="Close"
            style={{
              background: "rgba(100,116,139,0.12)",
              border: "none", borderRadius: "50%",
              width: "30px", height: "30px", flexShrink: 0,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#94a3b8",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Divider ── */}
        <div style={{
          height: "1px",
          background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.25),transparent)",
          marginBottom: "16px",
        }}/>

        {/* ── Body ── */}
        {installed ? (
          <div style={{ textAlign: "center", padding: "12px 0", color: "#10b981", fontWeight: 700, fontSize: "15px" }}>
            🎉 FlexiLedger installed!
          </div>

        ) : ios ? (
          /* ── iOS instructions ── */
          <>
            <p style={{ margin: "0 0 14px", fontSize: "13.5px", color: "#475569", lineHeight: 1.6 }}>
              Add FlexiLedger to your home screen for the best experience:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "16px" }}>
              {[
                { n: "1", icon: "⬆️", text: 'Tap the Share icon in Safari\'s toolbar' },
                { n: "2", icon: "📋", text: 'Scroll down and tap "Add to Home Screen"' },
                { n: "3", icon: "✅", text: 'Tap "Add" in the top‑right corner' },
              ].map((s) => (
                <div key={s.n} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  background: "rgba(99,102,241,0.07)", borderRadius: "14px", padding: "10px 14px",
                }}>
                  <span style={{ fontSize: "18px" }}>{s.icon}</span>
                  <span style={{ fontSize: "13px", color: "#334155", fontWeight: 500 }}>{s.text}</span>
                </div>
              ))}
            </div>
            <button
              id="pwa-ios-ok-btn"
              onClick={handleDismiss}
              style={{
                width: "100%", padding: "13px", borderRadius: "16px",
                border: "none",
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "white", fontSize: "15px", fontWeight: 700,
                cursor: "pointer", letterSpacing: "0.02em",
                boxShadow: "0 8px 20px rgba(79,70,229,0.35)",
              }}
            >
              Got it! 👍
            </button>
          </>

        ) : canInstall ? (
          /* ── Android native install ── */
          <>
            <p style={{ margin: "0 0 16px", fontSize: "13.5px", color: "#475569", lineHeight: 1.6 }}>
              Install <strong>FlexiLedger</strong> for quick access, offline use, and a smoother experience — no app store needed!
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                id="pwa-not-now-btn"
                onClick={handleDismiss}
                style={{
                  flex: 1, padding: "12px", borderRadius: "14px",
                  border: "1.5px solid rgba(100,116,139,0.2)",
                  background: "rgba(248,250,252,0.8)", color: "#64748b",
                  fontSize: "13.5px", fontWeight: 600, cursor: "pointer",
                }}
              >
                Not now
              </button>
              <button
                id="pwa-install-btn"
                onClick={handleInstall}
                style={{
                  flex: 2, padding: "12px", borderRadius: "14px",
                  border: "none",
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  color: "white", fontSize: "13.5px", fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(79,70,229,0.35)",
                  letterSpacing: "0.02em",
                }}
              >
                📲 Install App
              </button>
            </div>
          </>

        ) : (
          /* ── Android manual fallback (beforeinstallprompt didn't fire) ── */
          <>
            <p style={{ margin: "0 0 14px", fontSize: "13.5px", color: "#475569", lineHeight: 1.6 }}>
              Add FlexiLedger to your home screen for fast, offline access:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "16px" }}>
              {[
                { icon: "⋮", text: 'Tap the menu (⋮) in your browser' },
                { icon: "➕", text: 'Tap "Add to Home screen"' },
                { icon: "✅", text: 'Tap "Add" to confirm' },
              ].map((s, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  background: "rgba(99,102,241,0.07)", borderRadius: "14px", padding: "10px 14px",
                }}>
                  <span style={{
                    width: "26px", height: "26px", borderRadius: "8px",
                    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                    color: "white", fontSize: "13px", fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>{s.icon}</span>
                  <span style={{ fontSize: "13px", color: "#334155", fontWeight: 500 }}>{s.text}</span>
                </div>
              ))}
            </div>
            <button
              id="pwa-android-ok-btn"
              onClick={handleDismiss}
              style={{
                width: "100%", padding: "13px", borderRadius: "16px",
                border: "none",
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "white", fontSize: "15px", fontWeight: 700,
                cursor: "pointer", letterSpacing: "0.02em",
                boxShadow: "0 8px 20px rgba(79,70,229,0.35)",
              }}
            >
              Got it! 👍
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes pwaFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pwaSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(50px) scale(0.93); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0px)  scale(1);    }
        }
      `}</style>
    </>
  );
}
