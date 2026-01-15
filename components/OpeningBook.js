"use client";

import { useEffect, useRef, useState } from "react";
import Weave from "./Weave";

// REQUIRED FILES (must exist under /public/assets/flow/)
const FLOW = {
  CENTER: "/assets/flow/state-1-center.jpg",   // eyes closed / waist sigil
  AUTH: "/assets/flow/state-2-auth.jpg",       // weave into github login step
  ARRIVAL: "/assets/flow/state-3-arrival.jpg", // final breathe image
};

// Timing (ms)
const T_WEAVE = 520;
const T_BREATHE = 1400;

function preload(src) {
  try {
    const img = new Image();
    img.src = src;
  } catch {}
}

export default function OpeningBook({ onDone }) {
  const [step, setStep] = useState("CENTER"); // CENTER -> AUTH -> ARRIVAL
  const [weaving, setWeaving] = useState(false);
  const [openedLogin, setOpenedLogin] = useState(false);
  const awaitingReturn = useRef(false);

  // preload images
  useEffect(() => {
    preload(FLOW.CENTER);
    preload(FLOW.AUTH);
    preload(FLOW.ARRIVAL);
  }, []);

  // handle return to app after login
  useEffect(() => {
    const onReturn = () => {
      if (!awaitingReturn.current) return;

      awaitingReturn.current = false;

      // land on AUTH
      setWeaving(true);
      setTimeout(() => {
        setStep("AUTH");
        setWeaving(false);

        // breathe on ARRIVAL
        setTimeout(() => {
          setStep("ARRIVAL");

          // final weave -> hub
          setTimeout(() => {
            setWeaving(true);
            setTimeout(() => {
              setWeaving(false);
              if (typeof onDone === "function") onDone();
            }, T_WEAVE);
          }, T_BREATHE);
        }, 0);
      }, T_WEAVE);
    };

    window.addEventListener("focus", onReturn);
    document.addEventListener("visibilitychange", onReturn);

    return () => {
      window.removeEventListener("focus", onReturn);
      document.removeEventListener("visibilitychange", onReturn);
    };
  }, [onDone]);

  const startLogin = () => {
    if (openedLogin) return;

    setOpenedLogin(true);
    setWeaving(true);

    const loginUrl =
      process.env.NEXT_PUBLIC_GITHUB_LOGIN_URL || "https://github.com/login";

    setTimeout(() => {
      try {
        window.open(loginUrl, "_blank", "noopener,noreferrer");
      } catch {}
      setWeaving(false);
      awaitingReturn.current = true;
    }, T_WEAVE);
  };

  // fallback if focus doesn’t fire
  const manualReturn = () => {
    if (!awaitingReturn.current) return;
    awaitingReturn.current = false;

    setWeaving(true);
    setTimeout(() => {
      setStep("AUTH");
      setWeaving(false);

      setTimeout(() => {
        setStep("ARRIVAL");

        setTimeout(() => {
          setWeaving(true);
          setTimeout(() => {
            setWeaving(false);
            if (typeof onDone === "function") onDone();
          }, T_WEAVE);
        }, T_BREATHE);
      }, 0);
    }, T_WEAVE);
  };

  const bg =
    step === "CENTER" ? FLOW.CENTER : step === "AUTH" ? FLOW.AUTH : FLOW.ARRIVAL;

  return (
    <div style={styles.root}>
      <div style={{ ...styles.bg, backgroundImage: `url(${bg})` }} />

      {step === "CENTER" ? (
        <div style={styles.overlay}>
          <button style={styles.primaryBtn} onClick={startLogin}>
            ENTER
          </button>

          <a
            href={process.env.NEXT_PUBLIC_GITHUB_LOGIN_URL || "https://github.com/login"}
            target="_blank"
            rel="noreferrer"
            style={styles.link}
            onClick={() => {
              setOpenedLogin(true);
              awaitingReturn.current = true;
            }}
          >
            If nothing opened, tap here to login
          </a>

          {openedLogin ? (
            <button style={styles.secondaryBtn} onClick={manualReturn}>
              I’M BACK
            </button>
          ) : null}
        </div>
      ) : null}

      {weaving ? <Weave /> : null}
    </div>
  );
}

const styles = {
  root: {
    position: "relative",
    width: "100%",
    height: "100dvh",
    overflow: "hidden",
    background: "#000",
  },
  bg: {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    transform: "scale(1.02)",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    paddingBottom: 40,
    background:
      "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.0) 55%)",
  },
  primaryBtn: {
    padding: "14px 22px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.35)",
    background: "rgba(0,0,0,0.45)",
    color: "rgba(255,255,255,0.95)",
    fontSize: 14,
    letterSpacing: 2,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(0,0,0,0.25)",
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    letterSpacing: 1,
    cursor: "pointer",
  },
  link: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    textDecoration: "underline",
  },
};
