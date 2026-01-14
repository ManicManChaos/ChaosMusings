export default function IntakeBlock() {
  return (
    <section className="section" aria-label="The Intake">
      <h2>The Intake</h2>

      {/* Daily hub shows progress bars only */}
      <div style={{ marginBottom: 10, opacity: 0.85 }}>Protein</div>
      <div className="progress"><div style={{ width: "0%" }} /></div>

      <div style={{ margin: "12px 0 10px", opacity: 0.85 }}>Carbs</div>
      <div className="progress"><div style={{ width: "0%" }} /></div>

      <div style={{ margin: "12px 0 10px", opacity: 0.85 }}>Fats</div>
      <div className="progress"><div style={{ width: "0%" }} /></div>

      <div style={{ margin: "12px 0 10px", opacity: 0.85 }}>Water</div>
      <div className="progress"><div style={{ width: "0%" }} /></div>

      <div style={{ margin: "12px 0 10px", opacity: 0.85 }}>Calories</div>
      <div className="progress"><div style={{ width: "0%" }} /></div>

      {/* Cheat days belong to Intake (per your instruction) – editing UI goes in overlay later */}
      <div style={{ marginTop: 14, opacity: 0.75 }}>
        Cheat Days: Wednesday + Saturday (managed in Intake overlay).
      </div>
    </section>
  );
}
