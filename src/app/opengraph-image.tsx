import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Numero - Next Gen Numerology"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(to bottom right, #111827, #000000)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        color: "white",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Logo Icon */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "#f59e0b" }} // amber-500
        >
          {/* @ts-ignore */}
          <title>Numero Logo</title>
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <div
          style={{
            fontSize: 80,
            fontWeight: "bold",
            background: "linear-gradient(to right, #fcd34d, #f59e0b)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Numero
        </div>
      </div>
      <div style={{ marginTop: 20, fontSize: 32, color: "#d1d5db", fontWeight: 300 }}>
        AI-Driven Numerological Insights
      </div>
    </div>,
    {
      ...size,
    },
  )
}
