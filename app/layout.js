import "./globals.css";

export const metadata = {
  title: "ChaosMusings",
  description: "Manic Musings of Chaos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
