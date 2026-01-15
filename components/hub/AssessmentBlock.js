export default function AssessmentBlock() {
  return (
    <section className="section" aria-label="The Assessment">
      <h2>The Assessment</h2>

      <div className="field">
        <input placeholder="Title" />
      </div>

      <div className="field">
        <input placeholder="Location" />
      </div>

      <div className="field">
        <input placeholder="Intent / Focus" />
      </div>

      <div className="field">
        <select defaultValue="">
          <option value="">Mood</option>
          <option>CALM</option>
          <option>CHAOS</option>
          <option>POWER</option>
          <option>LOVE</option>
          <option>MONEY</option>
        </select>
      </div>

      <div className="field">
        <select defaultValue="">
          <option value="">Era</option>
          <option>ERA (locked monthly)</option>
        </select>
      </div>

      <div className="field">
        <select defaultValue="">
          <option value="">Singleness</option>
          <option>LOW</option>
          <option>MEDIUM</option>
          <option>HIGH</option>
        </select>
      </div>
    </section>
  );
}
