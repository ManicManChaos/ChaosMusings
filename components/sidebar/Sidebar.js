import Glyph from "../ui/Glyph";

export default function Sidebar() {
  // Separate tabs (NOT grouped)
  const tabs = [
    { name: "eye", label: "Today" },       // All-Seeing Eye = Today logic
    { name: "intake", label: "Intake" },
    { name: "moments", label: "Moments" },
    { name: "roidboy", label: "Roid Boy" },
    { name: "ps", label: "P.S." },
    { name: "summation", label: "Summation" },
    { name: "library", label: "Library" },
    { name: "directory", label: "Directory" },
    { name: "year", label: "Year Review" }
  ];

  return (
    <aside className="sidebar" aria-label="Right sidebar">
      {tabs.map((t) => (
        <Glyph key={t.name} name={t.name} label={t.label} />
      ))}
    </aside>
  );
}
