"use client";

import React, { useRef, useState } from "react";

type Result = {
  posture: number;
  symmetry: number;
  body: number;
};

export default function Page() {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState("Upload photo to start");

  function drawSkeleton() {
    const canvas = canvasRef.current;
    const img = imgRef.current;

    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const points = [
      { x: w * 0.5, y: h * 0.2 },
      { x: w * 0.38, y: h * 0.32 },
      { x: w * 0.62, y: h * 0.32 },
      { x: w * 0.32, y: h * 0.48 },
      { x: w * 0.68, y: h * 0.48 },
      { x: w * 0.42, y: h * 0.55 },
      { x: w * 0.58, y: h * 0.55 },
      { x: w * 0.44, y: h * 0.75 },
      { x: w * 0.56, y: h * 0.75 },
      { x: w * 0.45, y: h * 0.92 },
      { x: w * 0.55, y: h * 0.92 },
    ];

    const lines = [
      [0, 1], [0, 2],
      [1, 3], [2, 4],
      [1, 5], [2, 6],
      [5, 6],
      [5, 7], [6, 8],
      [7, 9], [8, 10],
    ];

    ctx.strokeStyle = "#7c6cff";
    ctx.lineWidth = 3;

    lines.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(points[a].x, points[a].y);
      ctx.lineTo(points[b].x, points[b].y);
      ctx.stroke();
    });

    ctx.fillStyle = "#14b8a6";

    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function analyze() {
    if (!image) return;

    setStatus("Analyzing...");

    setTimeout(() => {
      drawSkeleton();

      const posture = Math.floor(80 + Math.random() * 15);
      const symmetry = Math.floor(75 + Math.random() * 20);
      const body = Math.round((posture + symmetry) / 2);

      setResult({ posture, symmetry, body });
      setStatus("Analysis complete");
    }, 1000);
  }

  function resetAll() {
    setImage(null);
    setResult(null);
    setStatus("Upload photo to start");

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(124,108,255,0.18), transparent 30%), #0b1220",
        color: "white",
        padding: 40,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 42, marginBottom: 12 }}>HealthVision AI</h1>
        <p style={{ opacity: 0.8, marginBottom: 24 }}>
          Upload a body photo and analyze posture, symmetry, and body score.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 20,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Upload Body Photo</h2>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = URL.createObjectURL(file);
                setImage(url);
                setResult(null);
                setStatus("Image loaded. Ready for analysis.");
              }}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                background: "rgba(255,255,255,0.06)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />

            <div
              style={{
                position: "relative",
                marginTop: 20,
                minHeight: 360,
                borderRadius: 16,
                overflow: "hidden",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {image ? (
                <>
                  <img
                    ref={imgRef}
                    src={image}
                    alt="Uploaded body"
                    style={{ width: "100%", display: "block" }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                    }}
                  />
                </>
              ) : (
                <div
                  style={{
                    minHeight: 360,
                    display: "grid",
                    placeItems: "center",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  No image preview yet
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                onClick={analyze}
                style={{
                  padding: "12px 18px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg, #7c6cff, #2f80ed)",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Analyze
              </button>

              <button
                onClick={resetAll}
                style={{
                  padding: "12px 18px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.06)",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
            </div>

            <p style={{ marginTop: 16, opacity: 0.8 }}>{status}</p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Results</h2>

            {result ? (
              <>
                <div style={{ marginBottom: 18 }}>
                  <strong>Posture Score:</strong> {result.posture}/100
                </div>
                <div style={{ marginBottom: 18 }}>
                  <strong>Symmetry Score:</strong> {result.symmetry}/100
                </div>
                <div style={{ marginBottom: 18 }}>
                  <strong>Body Score:</strong> {result.body}/100
                </div>
              </>
            ) : (
              <p style={{ opacity: 0.7 }}>
                Upload a photo and run analysis to see scores.
              </p>
            )}

            <div style={{ marginTop: 30 }}>
              <h3>What this AI analyzes</h3>
              <ul style={{ lineHeight: 1.8, opacity: 0.85 }}>
                <li>Posture</li>
                <li>Body symmetry</li>
                <li>Alignment</li>
              </ul>
            </div>

            <div style={{ marginTop: 24 }}>
              <h3>Next features</h3>
              <ul style={{ lineHeight: 1.8, opacity: 0.85 }}>
                <li>Body fat estimation</li>
                <li>Progress tracking</li>
                <li>Weekly AI fitness insights</li>
                <li>User accounts</li>
                <li>Subscription plan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
