import { ImageResponse } from "next/og";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export const socialImageContentType = "image/png";
export const socialImageAlt =
  "Sisters Photo Studio — studio fotograficzne w Warszawie";

export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 78% 22%, rgba(245,162,183,0.28), transparent 30%), linear-gradient(135deg, #0b0908 0%, #21110f 55%, #0b0908 100%)",
          color: "#fff7f2",
          padding: "72px 82px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-90px",
            top: "-110px",
            width: "510px",
            height: "510px",
            borderRadius: "999px",
            border: "1px solid rgba(245,162,183,0.36)",
            boxShadow: "0 0 100px rgba(245,162,183,0.18)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#f5a2b7",
            }}
          >
            Warszawa · Taśmowa 1
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 106,
                lineHeight: 0.9,
                letterSpacing: -5,
                fontFamily: "Georgia, serif",
              }}
            >
              Sisters
            </div>
            <div
              style={{
                display: "flex",
                marginLeft: 165,
                marginTop: 8,
                fontSize: 96,
                lineHeight: 0.9,
                letterSpacing: -4,
                color: "#f5a2b7",
                fontFamily: "Georgia, serif",
              }}
            >
              Studio
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              fontSize: 25,
              color: "#eadbd2",
            }}
          >
            <span>Wynajem studia</span>
            <span style={{ color: "#f5a2b7" }}>•</span>
            <span>Sesje zdjęciowe</span>
            <span style={{ color: "#f5a2b7" }}>•</span>
            <span>Szkolenia</span>
          </div>
        </div>
      </div>
    ),
    socialImageSize
  );
}
