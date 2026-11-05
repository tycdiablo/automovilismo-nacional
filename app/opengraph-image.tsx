import { ImageResponse } from "next/og";

export const alt = "Motor Nacional · El automovilismo argentino en un solo lugar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0e1117 0%, #0e1117 55%, #1b3a57 100%)",
          color: "white",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", height: 18, width: "100%" }}>
          <div style={{ flex: 1, background: "#75AADB" }} />
          <div style={{ flex: 1, background: "#FFFFFF" }} />
          <div style={{ flex: 1, background: "#75AADB" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 34, color: "#75AADB", letterSpacing: 6, textTransform: "uppercase", fontWeight: 700 }}>
            Motor Nacional
          </div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.02, marginTop: 16, maxWidth: 980 }}>
            El automovilismo argentino en un solo lugar
          </div>
          <div style={{ fontSize: 32, color: "#9aa3b2", marginTop: 24 }}>
            Pilotos · Resultados · Calendario · Campeonatos · Noticias
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: "#F4B942" }} />
          <div style={{ fontSize: 28, color: "#cbd5e1" }}>TC · TC2000 · TN · Top Race · F1 · WEC · IndyCar</div>
        </div>
      </div>
    ),
    size
  );
}
