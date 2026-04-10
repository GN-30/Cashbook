import { useEffect, useState } from "react";

const STORAGE_KEY = "flexiledger_pwa_prompt_dismissed";

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isMobile() {
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

export default function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or already installed as PWA
    if (localStorage.getItem(STORAGE_KEY) === "true") return;
    if (isInStandaloneMode()) return;
    if (!isMobile()) return;

    const ios = isIOS();
    setIsIOSDevice(ios);

    if (ios) {
      // iOS: show manual instructions after a short delay
      setTimeout(() => setShow(true), 2000);
    } else {
      // Android: capture beforeinstallprompt
      const handler = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setTimeout(() => setShow(true), 2000);
      };
      window.addEventListener("beforeinstallprompt", handler);
      window.addEventListener("appinstalled", () => {
        setInstalled(true);
        setTimeout(() => setShow(false), 2000);
      });
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setTimeout(() => setShow(false), 1500);
    }
    setDeferredPrompt(null);
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
          background: "rgba(15, 15, 35, 0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 9998,
          animation: "fadeIn 0.3s ease",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 32px)",
          maxWidth: "420px",
          zIndex: 9999,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.9)",
          borderRadius: "24px",
          boxShadow:
            "0 25px 50px rgba(79,70,229,0.18), 0 10px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)",
          padding: "24px 20px 20px",
          animation: "slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Icon + App Name */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 8px 20px rgba(79,70,229,0.35)",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
              <path d="M7 8h2m2 0h2m2 0h2" strokeOpacity="0.6" />
              <path d="M7 11h4" />
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "17px", color: "#1e1b4b", fontFamily: "'Outfit', sans-serif" }}>
              Install FlexiLedger
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#6366f1", fontWeight: 500, fontFamily: "'Outfit', sans-serif" }}>
              Your smart finance tracker
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            style={{
              marginLeft: "auto",
              background: "rgba(100,100,120,0.1)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "#64748b",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)", marginBottom: "14px" }} />

        {installed ? (
          <div style={{ textAlign: "center", padding: "8px 0", color: "#4f46e5", fontWeight: 700, fontSize: "15px", fontFamily: "'Outfit', sans-serif" }}>
            🎉 Installed successfully!
          </div>
        ) : isIOSDevice ? (
          // iOS instructions
          <>
            <p style={{ margin: "0 0 12px", fontSize: "14px", color: "#475569", fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>
              Add this app to your home screen for the best experience:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              {[
                { icon: "⬆️", text: "Tap the Share button in Safari" },
                { icon: "➕", text: 'Scroll and tap "Add to Home Screen"' },
                { icon: "✅", text: 'Tap "Add" to install' },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(99,102,241,0.06)", borderRadius: "12px", padding: "10px 12px" }}>
                  <span style={{ fontSize: "18px" }}>{step.icon}</span>
                  <span style={{ fontSize: "13.5px", color: "#334155", fontWeight: 500, fontFamily: "'Outfit', sans-serif" }}>{step.text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleDismiss}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "16px",
                border: "1.5px solid rgba(99,102,241,0.3)",
                background: "rgba(99,102,241,0.08)",
                color: "#4f46e5",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: "0.01em",
              }}
            >
              Got it!
            </button>
          </>
        ) : (
          // Android prompt
          <>
            <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#475569", fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>
              Install <strong>FlexiLedger</strong> on your device for quick access, offline use, and a smoother experience — no app store needed!
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleDismiss}
                style={{
                  flex: 1,
                  padding: "13px",
                  borderRadius: "16px",
                  border: "1.5px solid rgba(100,116,139,0.25)",
                  background: "rgba(100,116,139,0.08)",
                  color: "#64748b",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Not now
              </button>
              <button
                onClick={handleInstall}
                style={{
                  flex: 2,
                  padding: "13px",
                  borderRadius: "16px",
                  border: "none",
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                  boxShadow: "0 8px 20px rgba(79,70,229,0.35)",
                  letterSpacing: "0.02em",
                }}
              >
                📲 Install App
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(40px) scale(0.95); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1);    }
        }
      `}</style>
    </>
  );
}
