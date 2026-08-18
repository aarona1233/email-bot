// src/app/layout.js
// Root layout — wraps every page. Required by Next.js App Router.

export const metadata = {
  title: "Email Reply Bot",
  description: "AI-powered email reply tool with product database lookup",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, boxSizing: "border-box" }}>
        {children}
      </body>
    </html>
  );
}
