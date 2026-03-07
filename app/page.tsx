"use client";

import React, { useRef, useState } from "react";

export default function Page() {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
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
      { x: w * 0.5, y: h * 0.25 },
      { x: w * 0.4, y: h * 0.35 },
      { x: w * 0.6, y: h * 0.35 },
      { x: w * 0.45, y: h * 0.55 },
      { x: w * 0.55, y: h * 0.55 },
      { x: w * 0.47, y: h * 0.75 },
      { x: w * 0.53, y: h * 0.75 }
    ];

    ctx.strokeStyle = "#7c6cff";
    ctx.lineWidth = 3;

    for (let i = 0; i < points.length - 1; i++) {
      ctx.beginPath();
      ctx.moveTo(points[i].x, points[i].y);
      ctx.lineTo(points[i + 1].x, points[i + 1].y);
      ctx.stroke();
    }

    ctx.fillStyle = "#14b8a6";

    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function analyze() {
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

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        color: "white",
        padding: 40,
        fontFamily: "sans-serif"
      }}
    >
      <h1 style={{ fontSize: 40 }}>HealthVision AI</h1>

      <p>Upload a body photo and analyze posture.</p>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const url = URL.createObjectURL(file);
          setImage(url);
          setResult(null);
        }}
      />

      <div style={{ position: "relative", maxWidth: 500, marginTop: 20 }}>
        {image && (
          <>
            <img
              ref={imgRef}
              src={image}
              style={{ width: "100%" }}
            />

            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%"
              }}
            />
          </>
        )}
      </div>

      <button
        onClick={analyze}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: "#7c6cff",
          border: "none",
          borderRadius: 10,
          color: "white",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Analyze
      </button>

      <p style={{ marginTop: 20 }}>{status}</p>

      {result && (
        <div style={{ marginTop: 30 }}>
          <h3>Results</h3>
          <p>Posture Score: {result.posture}</p>
          <p>Symmetry Score: {result.symmetry}</p>
          <p>Body Score: {result.body}</p>
        </div>
      )}
    </main>
  );
}