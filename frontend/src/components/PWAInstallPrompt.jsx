import { useEffect, useState } from "react";

const STORAGE_KEY = "flexiledger_pwa_prompt_v3";

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

function isMobileOrTablet() {
  return (
    /android|iphone|ipad|ipod|mobile|tablet/i.test(navigator.userAgent) ||
    navigator.maxTouchPoints > 1
  );
}

export default function PWAInstallPrompt() {
  const [visible, setVisible]             = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [ios, setIos]                     = useState(false);
  const [installing, setInstalling]       = useState(false);
  const [done, setDone]                   = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") return;
    if (isInStandaloneMode()) return;
    if (!isMobileOrTablet()) return;

    const iosDevice = isIOS();
    setIos(iosDevice);

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", () => {
      setDone(true);
      setTimeout(dismiss, 2500);
    });

    // Always show after 1 second
    const t = setTimeout(() => setVisible(true), 1000);
    return () => {
      clearTimeout(t);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setInstalling(false);
    if (outcome === "accepted") {
      setDone(true);
      setTimeout(dismiss, 2500);
    } else {
      dismiss();
    }
    setDeferredPrompt(null);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!visible) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={dismiss}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(10,10,30,0.6)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex: 9990,
          animation: "pwaFade 0.35s ease forwards",
        }}
      />

      {/* ── Card ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Install FlexiLedger app"
        style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100vw - 32px)",
          maxWidth: "380px",
          zIndex: 9999,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(30px) saturate(200%)",
          WebkitBackdropFilter: "blur(30px) saturate(200%)",
          border: "1.5px solid rgba(255,255,255,1)",
          borderRadius: "28px",
          boxShadow:
            "0 32px 64px rgba(79,70,229,0.25), 0 8px 24px rgba(0,0,0,0.1), inset 0 1px 0 #fff",
          overflow: "hidden",
          animation: "pwaRise 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {/* ── Purple gradient strip at top ── */}
        <div style={{
          height: "6px",
          background: "linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899, #7c3aed, #4f46e5)",
          backgroundSize: "200% 100%",
          animation: "shimmer 3s linear infinite",
        }}/>

        <div style={{ padding: "22px 20px 20px" }}>
          {done ? (
            /* ── Success state ── */
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%",
                background: "linear-gradient(135deg,#10b981,#059669)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px",
                boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#1e1b4b" }}>
                App Installed! 🎉
              </p>
              <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
                FlexiLedger is ready on your home screen
              </p>
            </div>

          ) : (
            <>
              {/* ── App info row ── */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "18px" }}>
                {/* Real app icon */}
                <img
                  src="/pwa-192x192.png"
                  alt="FlexiLedger icon"
                  width="64"
                  height="64"
                  style={{
                    borderRadius: "16px",
                    flexShrink: 0,
                    boxShadow: "0 8px 24px rgba(79,70,229,0.35)",
                    border: "2px solid rgba(99,102,241,0.2)",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#1e1b4b", letterSpacing: "-0.3px" }}>
                    FlexiLedger
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#6366f1", fontWeight: 600 }}>
                    Smart Financial Tracker
                  </p>
                  <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                    {["Free","Offline","No ads"].map(tag => (
                      <span key={tag} style={{
                        fontSize: "10px", fontWeight: 700, color: "#4f46e5",
                        background: "rgba(99,102,241,0.1)",
                        padding: "2px 8px", borderRadius: "100px",
                        border: "1px solid rgba(99,102,241,0.2)",
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>
                {/* Close */}
                <button
                  id="pwa-close-btn"
                  onClick={dismiss}
                  aria-label="Close"
                  style={{
                    alignSelf: "flex-start",
                    background: "rgba(100,116,139,0.1)",
                    border: "none", borderRadius: "50%",
                    width: "28px", height: "28px", flexShrink: 0,
                    cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "#94a3b8",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* ── Divider ── */}
              <div style={{
                height: "1px",
                background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.2),transparent)",
                marginBottom: "18px",
              }}/>

              {ios ? (
                /* ── iOS: step-by-step ── */
                <>
                  <p style={{ margin: "0 0 14px", fontSize: "13.5px", color: "#475569", lineHeight: 1.65 }}>
                    Install FlexiLedger directly to your home screen:
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
                    {[
                      { icon: "⬆️", text: "Tap the Share icon at the bottom of Safari" },
                      { icon: "📋", text: 'Select "Add to Home Screen"' },
                      { icon: "✅", text: 'Tap "Add" to complete installation' },
                    ].map((s, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        background: "rgba(99,102,241,0.07)", borderRadius: "14px", padding: "11px 14px",
                        border: "1px solid rgba(99,102,241,0.1)",
                      }}>
                        <span style={{ fontSize: "20px", flexShrink: 0 }}>{s.icon}</span>
                        <span style={{ fontSize: "13px", color: "#334155", fontWeight: 500, lineHeight: 1.4 }}>{s.text}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    id="pwa-ios-ok-btn"
                    onClick={dismiss}
                    style={{
                      width: "100%", padding: "15px",
                      borderRadius: "16px", border: "none",
                      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                      color: "white", fontSize: "15px", fontWeight: 700,
                      cursor: "pointer", letterSpacing: "0.02em",
                      boxShadow: "0 10px 28px rgba(79,70,229,0.4)",
                    }}
                  >
                    Got it! 👍
                  </button>
                </>
              ) : deferredPrompt ? (
                /* ── Android native install ── */
                <>
                  <p style={{ margin: "0 0 18px", fontSize: "13.5px", color: "#475569", lineHeight: 1.65 }}>
                    Install <strong style={{ color: "#1e1b4b" }}>FlexiLedger</strong> on your device — works offline, loads instantly, no app store needed.
                  </p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      id="pwa-not-now-btn"
                      onClick={dismiss}
                      style={{
                        flex: 1, padding: "14px",
                        borderRadius: "14px",
                        border: "1.5px solid rgba(100,116,139,0.2)",
                        background: "rgba(248,250,252,0.9)",
                        color: "#64748b", fontSize: "14px", fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Later
                    </button>
                    <button
                      id="pwa-install-btn"
                      onClick={handleInstall}
                      disabled={installing}
                      style={{
                        flex: 2.5, padding: "14px",
                        borderRadius: "14px", border: "none",
                        background: installing
                          ? "rgba(99,102,241,0.6)"
                          : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                        color: "white", fontSize: "15px", fontWeight: 800,
                        cursor: installing ? "not-allowed" : "pointer",
                        boxShadow: "0 10px 28px rgba(79,70,229,0.4)",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", gap: "8px",
                        letterSpacing: "0.02em",
                        transition: "all 0.2s",
                      }}
                    >
                      {installing ? (
                        <>
                          <span style={{
                            width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)",
                            borderTopColor: "white", borderRadius: "50%",
                            animation: "spin 0.7s linear infinite", display: "inline-block",
                          }}/>
                          Installing…
                        </>
                      ) : (
                        <>📲 Install App</>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* ── Android manual (beforeinstallprompt didn't fire yet) ── */
                <>
                  <p style={{ margin: "0 0 14px", fontSize: "13.5px", color: "#475569", lineHeight: 1.65 }}>
                    Add FlexiLedger to your home screen for the best experience:
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
                    {[
                      { icon: "⋮", text: "Tap the menu icon in your browser (top-right)" },
                      { icon: "➕", text: '"Add to Home Screen" or "Install App"' },
                      { icon: "✅", text: "Tap Install or Add to confirm" },
                    ].map((s, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        background: "rgba(99,102,241,0.07)", borderRadius: "14px", padding: "11px 14px",
                        border: "1px solid rgba(99,102,241,0.1)",
                      }}>
                        <span style={{
                          width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
                          background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                          color: "white", fontSize: "13px", fontWeight: 800,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>{s.icon}</span>
                        <span style={{ fontSize: "13px", color: "#334155", fontWeight: 500, lineHeight: 1.4 }}>
                          {s.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    id="pwa-android-ok-btn"
                    onClick={dismiss}
                    style={{
                      width: "100%", padding: "15px",
                      borderRadius: "16px", border: "none",
                      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                      color: "white", fontSize: "15px", fontWeight: 700,
                      cursor: "pointer", letterSpacing: "0.02em",
                      boxShadow: "0 10px 28px rgba(79,70,229,0.4)",
                    }}
                  >
                    Got it! 👍
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pwaFade {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes pwaRise {
          from { opacity: 0; transform: translateX(-50%) translateY(60px) scale(0.92); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1);    }
        }
        @keyframes shimmer {
          0%   { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
