import { ImageResponse } from "next/og";

export const socialImageAlt = "OneStudio OS | Website, booking and CRM";
export const socialImageSize = { width: 1200, height: 630 };
export const socialImageContentType = "image/png";

export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0d12",
          color: "#f7f5ef",
          padding: "72px 82px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 28, letterSpacing: 4 }}>
          <div style={{ display: "flex", gap: 7 }}>
            <span style={{ width: 13, height: 38, borderRadius: 99, background: "#d8b36a" }} />
            <span style={{ width: 13, height: 52, borderRadius: 99, background: "#f0d59f" }} />
            <span style={{ width: 13, height: 31, borderRadius: 99, background: "#d8b36a" }} />
          </div>
          <span>ONESTUDIO OS</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ maxWidth: 950, fontSize: 72, lineHeight: 1.04, letterSpacing: -3 }}>
            Your business in one connected system.
          </div>
          <div style={{ fontSize: 27, color: "#c9c4b8" }}>
            Website · Booking · CRM · Payments · Media · Analytics
          </div>
        </div>
      </div>
    ),
    socialImageSize,
  );
}
