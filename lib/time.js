export function nowCST() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
}
