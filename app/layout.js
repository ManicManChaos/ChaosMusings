import "./globals.css";

export const metadata = {
  title: "Manic Musings of Chaos",
  description: "Manic Musings of Chaos",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
