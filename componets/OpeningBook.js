"use client";

import { useEffect, useMemo, useState } from "react";

// Opening flow (LOCKED):
// 1) eyes closed
// 2) auth weave (sigil click)
// 3) arrival pause
// then onDone()

export default function OpeningBook({ onDone }) {
  const frames = useMemo(
    () => [
      { key: "closed", src: "/flow/state-1-center.jpg", alt: "Eyes closed" },
      { key: "auth", src: "/flow/state-2-auth.jpg", alt: "Weave to authentication" },
      { key: "arrival", src: "/flow/state-3-arrival.jpg", alt: "Arrival" },
    ],
    []
  );

  const [step, setStep] = useState(0);
  const [weaving, setWeaving] = useState(false);

  // auto-advance from auth -> arrival (pause), then finish
  useEffect(() => {
    if (step !== 1) return;
    const t = window.setTimeout(() => {
      setWeaving(false);
      setStep(2);
    }, 850);
    return () => window.clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (step !== 2) return;
    const t = window.setTimeout(() => onDone?.(), 1100);
    return () => window.clearTimeout(t);
  }, [step, onDone]);

  const onSigil = () => {
    if (step !== 0) return;
    setWeaving(true);
    setStep(1);
  };

  return (
    <div className="gateWrap" role="presentation">
      <div className="gateCard">
        <div className="gateStage">
          {frames.map((f, i) => (
            <img
              key={f.key}
              className={`gateImg ${i === step ? "isOn" : ""}`}
              src={f.src}
              alt={f.alt}
              draggable="false"
            />
          ))}

          <div className="gateFade" aria-hidden="true" />

          {step === 0 ? (
            <button className="sigilBtn" onClick={onSigil} type="button">
              <span className="sigilRing" aria-hidden="true" />
              <span className="sigilCore" aria-hidden="true" />
              <span className="sigilText">OPEN</span>
            </button>
          ) : null}

          {weaving ? (
            <div className="weaveOverlay" aria-hidden="true">
              <div className="weaveField" />
              <div className="weavePulse" />
            </div>
          ) : null}
        </div>

        <div className="gateTitlePlate">
          <div className="gateTitle">MANIC MUSINGS OF CHAOS</div>
        </div>
      </div>
    </div>
  );
}
