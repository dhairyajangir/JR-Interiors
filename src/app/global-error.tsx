"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#fbf9f8",
          color: "#1b1c1c",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div>
          <h1 style={{ color: "#513726", fontSize: "2rem", marginBottom: "1rem" }}>
            JR Interiors
          </h1>
          <p style={{ marginBottom: "1.5rem", color: "#4f453e" }}>
            A critical error occurred. Please reload the page.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#513726",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.9rem 2rem",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
          {error?.digest && (
            <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#81756d" }}>
              Ref: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
