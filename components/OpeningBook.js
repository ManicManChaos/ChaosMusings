"use client";

import { useEffect, useState } from "react";
import Weave from "./Weave";
import { FLOW_COVERS } from "../lib/assets";

const T_WEAVE = 620;
const T_STEP2_HOLD = 850;   // “github login moment”
const T_STEP3_BREATHE = 1300;

function preload(src) {
  try {
    const img = new Image();
    img.src = src;
  } catch {}
}

export default function OpeningBook({ onDone }) {
  const [step, setStep] = useState(1); // 1 center -> 2 github -> 3 arrival
  const [weaving, setWeaving] = useState(false);

  useEffect(() => {
    preload(FLOW_COVERS.center);
    preload(FLOW_COVERS.github);
    preload(FLOW_COVERS.arrival);
  }, []);

  const src =
    step === 1 ? FLOW_COVERS.center : step === 2 ? FLOW_COVERS.github : FLOW_COVERS.arrival;

  const go = (next) => {
    setWeaving(true);
    setTimeout(() => {
      setStep(next);
      setWeaving(false);
    }, T_WEAVE);
  };

  // auto step 2 -> 3
  useEffect(() => {
    if (step !== 2) return;
    const t = setTimeout(() => go(3), T_STEP2_HOLD);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // finish on step 3 after breathe
  useEffect(() => {
    if (step !== 3) return;
    const t = setTimeout(() => {
      if (typeof onDone === "function") onDone();
    }, T_STEP3_BREATHE);
    return () => clearTimeout(t);
  }, [step, onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#050806",
        zIndex: 9999,
        overflow: "hidden",
      }}
      onClick={() => {
        if (weaving) return;
        if (step === 1) go(2); // only required click
      }}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
      {weaving ? <Weave /> : null}
    </div>
  );
}
