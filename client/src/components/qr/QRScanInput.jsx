import { Camera, CameraOff, Keyboard } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function extractValue(rawValue, field) {
  const value = rawValue.trim();
  try {
    const url = new URL(value);
    return url.searchParams.get(field) || value;
  } catch {
    return value;
  }
}

export default function QRScanInput({ field, label, value, onChange, required = true }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  function stopScanner() {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanning(false);
  }

  async function startScanner() {
    setError("");
    if (!("BarcodeDetector" in window)) {
      setError("This browser camera scanner is not supported. Use Chrome/Brave or scan with a USB scanner.");
      return;
    }

    try {
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setScanning(true);
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 0);

      const detect = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes[0]?.rawValue) {
            onChange(extractValue(codes[0].rawValue, field));
            stopScanner();
            return;
          }
        } catch {
          // The next camera frame is retried while the video is warming up.
        }
        frameRef.current = requestAnimationFrame(detect);
      };
      frameRef.current = requestAnimationFrame(detect);
    } catch (scanError) {
      stopScanner();
      setError(scanError?.message || "Camera permission is required to scan the QR code.");
    }
  }

  useEffect(() => stopScanner, []);

  return (
    <label className="qr-scan-field">
      <span>{label}</span>
      <div className="qr-scan-control">
        <input
          required={required}
          value={value}
          placeholder={`Scan ${label}`}
          onChange={(event) => onChange(extractValue(event.target.value, field))}
        />
        <button type="button" className={scanning ? "danger" : "scan-button"} onClick={scanning ? stopScanner : startScanner}>
          {scanning ? <CameraOff /> : <Camera />}
          {scanning ? "Stop" : "Scan"}
        </button>
      </div>
      {scanning && <div className="qr-camera"><video ref={videoRef} muted playsInline /><div className="qr-camera-frame" /></div>}
      {error && <small className="scan-error"><Keyboard /> {error}</small>}
    </label>
  );
}
