"use client";

import CompanySigil from "./CompanySigil";

export default function Sidebar({ triggerWeave }) {
  return (
    <aside>
      <button onClick={triggerWeave}><CompanySigil /></button>
      <button>THE CONTEXT</button>
      <button>ROID BOY</button>
      <button>P.S.</button>
      <button>THE SUMMATION</button>
      <button>LIBRARY</button>
      <button>YEAR IN REVIEW</button>
      <button>APP DIRECTORY</button>
      <button>SETTINGS</button>
    </aside>
  );
}
