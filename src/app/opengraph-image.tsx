import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "VaahanERP — AI-Powered Dealership Management Software India";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          padding: "60px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.1)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(168, 85, 247, 0.08)",
            display: "flex",
          }}
        />

        {/* Top bar - Logo + Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "40px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "28px",
                fontWeight: 800,
              }}
            >
              V
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "-0.5px",
                }}
              >
                VaahanERP 2.0
              </span>
              <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                by Ravi Accounting Services
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              padding: "8px 20px",
              borderRadius: "50px",
              background: "rgba(34, 197, 94, 0.15)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              color: "#4ade80",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            🇮🇳 Made for India
          </div>
        </div>

        {/* Main heading */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "36px",
          }}
        >
          <span
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.1,
              letterSpacing: "-1px",
            }}
          >
            AI-Powered Dealership
          </span>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 800,
              background: "linear-gradient(90deg, #3b82f6, #a855f7, #ec4899)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1.1,
              letterSpacing: "-1px",
            }}
          >
            Management Software
          </span>
          <span
            style={{
              fontSize: "20px",
              color: "#94a3b8",
              marginTop: "12px",
              lineHeight: 1.4,
            }}
          >
            Bike, Car & EV Showrooms — Leads se Delivery tak, sab ek jagah
          </span>
        </div>

        {/* Feature pills - 2 rows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { icon: "🤖", text: "52+ AI Tools" },
              { icon: "🎙️", text: "Voice Commands" },
              { icon: "📱", text: "WhatsApp Bot" },
              { icon: "📊", text: "Smart Analytics" },
            ].map((f) => (
              <div
                key={f.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { icon: "💰", text: "CashFlow & Daybook" },
              { icon: "🏍️", text: "Lead CRM" },
              { icon: "🔧", text: "Service Module" },
              { icon: "📋", text: "RTO Tracking" },
              { icon: "📦", text: "Inventory" },
            ].map((f) => (
              <div
                key={f.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.07)",
                  color: "#cbd5e1",
                  fontSize: "15px",
                  fontWeight: 500,
                }}
              >
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <span style={{ fontSize: "18px", color: "#64748b" }}>
            vaahanerp.com
          </span>
          <div
            style={{
              display: "flex",
              padding: "10px 28px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: "white",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            Free Demo Available →
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
