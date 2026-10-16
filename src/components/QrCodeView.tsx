import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface Props {
  value: string;
  size?: number;
  className?: string;
  alt?: string;
}

/** Composant QR Code vectoriel haute définition (avec repli de secours). */
export function QrCodeView({ value, size = 220, className = "", alt = "QR Code de connexion" }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [svgXml, setSvgXml] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!value) return;

    // Génération SVG pour un rendu net et imprimable
    QRCode.toString(value, {
      type: "svg",
      margin: 1,
      color: { dark: "#10163a", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then((svg) => {
        if (!cancelled) setSvgXml(svg);
      })
      .catch((e) => {
        if (!cancelled) setErr(String(e));
      });

    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: { dark: "#10163a", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (err) {
    return (
      <div style={{ padding: 16, border: "1px dashed var(--danger, #ff6b6b)", borderRadius: 8, color: "var(--danger, #ff6b6b)", textAlign: "center" }}>
        Erreur de génération du QR code
      </div>
    );
  }

  if (svgXml) {
    return (
      <div
        className={`qrcode-container ${className}`}
        style={{
          width: size,
          height: size,
          background: "#fff",
          padding: 8,
          borderRadius: 12,
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
        dangerouslySetInnerHTML={{ __html: svgXml }}
      />
    );
  }

  if (dataUrl) {
    return (
      <img
        src={dataUrl}
        alt={alt}
        width={size}
        height={size}
        className={`qrcode-img ${className}`}
        style={{ background: "#fff", padding: 8, borderRadius: 12, boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#f1f3f9",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#6b7280",
        fontSize: "0.85rem",
      }}
    >
      Génération du QR code...
    </div>
  );
}
