"use client";

import { useState } from "react";

type Result = {
  url: string;
  abstract_1l: string;
  score: number;
  guide_type: string;
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSearch() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, k: 8 }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Search failed");

      setResults(json.results || []);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 640px) {
          .search-container {
            flex-direction: row !important;
          }
          .search-button {
            width: auto !important;
            min-width: 120px;
          }
        }
        @media (prefers-color-scheme: dark) {
          .main-container {
            background: var(--background, #0a0a0a);
            color: var(--foreground, #ededed);
          }
          .title-text {
            color: var(--foreground, #ededed) !important;
          }
          .input-field {
            background: #1a1a1a !important;
            border-color: #333 !important;
            color: var(--foreground, #ededed) !important;
          }
          .input-field::placeholder {
            color: #888 !important;
          }
          .search-btn {
            background: #2a2a2a !important;
            border-color: #444 !important;
            color: var(--foreground, #ededed) !important;
          }
          .search-btn:disabled {
            opacity: 0.5;
          }
          .result-card {
            background: #1a1a1a !important;
            border-color: #333 !important;
          }
          .result-text {
            color: #d1d1d1 !important;
          }
          .result-link {
            color: #60a5fa !important;
          }
          .error-text {
            color: #f87171 !important;
          }
          .white-paper-tag {
            background: #2a2a2a !important;
            color: #ededed !important;
            border-color: #444 !important;
          }
        }
      `}} />
      <main className="main-container" style={{ 
        maxWidth: 900, 
        margin: "40px auto", 
        padding: "16px",
        width: "100%",
        boxSizing: "border-box"
      }}>
        <h1 className="title-text" style={{ 
          fontSize: "clamp(20px, 4vw, 28px)", 
          fontWeight: 700,
          padding: "0 8px"
        }}>
          Validated Design / Reference Architecture Search
        </h1>

        <div className="search-container" style={{ 
          display: "flex", 
          flexDirection: "column",
          gap: 8, 
          marginTop: 16,
          padding: "0 8px"
        }}>
          <input
            className="input-field"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you're looking for (e.g., 'AI training pod design with UCS and Nexus')"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #ddd",
              boxSizing: "border-box",
              fontSize: "16px"
            }}
          />
          <button
            className="search-button search-btn"
            onClick={onSearch}
            disabled={loading || !prompt.trim()}
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid #ddd",
              cursor: loading ? "default" : "pointer",
              fontSize: "16px",
              width: "100%"
            }}
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

      {error && (
        <p className="error-text" style={{ marginTop: 12, color: "crimson", padding: "0 8px" }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: 24, display: "grid", gap: 12, padding: "0 8px" }}>
        {results.map((r) => {
          const getTagColor = (guideType: string) => {
            if (guideType === "CVD") return { bg: "#3b82f6", text: "#fff" }; // Blue
            if (guideType === "White Paper") return { bg: "#ffffff", text: "#000", border: "1px solid #ddd" }; // White
            if (guideType === "Integration Guide") return { bg: "#f97316", text: "#fff" }; // Orange
            return { bg: "#e5e7eb", text: "#6b7280" }; // Default gray
          };

          const tagStyle = getTagColor(r.guide_type);

          return (
            <div
              key={r.url}
              className="result-card"
              style={{
                border: "1px solid #eee",
                borderRadius: 14,
                padding: 14,
                position: "relative",
                width: "100%",
                boxSizing: "border-box"
              }}
            >
              <div style={{ 
                position: "absolute", 
                top: 8, 
                right: 8, 
                display: "flex", 
                gap: 6, 
                flexDirection: "column", 
                alignItems: "flex-end",
                zIndex: 1
              }}>
                {r.guide_type && (
                  <span
                    className={r.guide_type === "White Paper" ? "white-paper-tag" : ""}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: "clamp(10px, 2vw, 11px)",
                      fontWeight: 600,
                      backgroundColor: tagStyle.bg,
                      color: tagStyle.text,
                      border: tagStyle.border || "none",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {r.guide_type}
                  </span>
                )}
                {Number.isFinite(r.score) && (
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: "clamp(10px, 2vw, 11px)",
                      fontWeight: 600,
                      backgroundColor: "#6b7280",
                      color: "#fff",
                      fontFamily: "monospace",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {r.score.toFixed(3)}
                  </span>
                )}
              </div>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                gap: 12, 
                paddingRight: (r.guide_type || Number.isFinite(r.score)) ? "clamp(80px, 15vw, 100px)" : 0,
                wordBreak: "break-all"
              }}>
                <a 
                  href={r.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="result-link"
                  style={{ 
                    fontWeight: 600,
                    fontSize: "clamp(14px, 2.5vw, 16px)",
                    wordBreak: "break-all",
                    overflowWrap: "break-word",
                    flex: 1
                  }}
                >
                  {r.url}
                </a>
              </div>
              <p className="result-text" style={{ 
                marginTop: 8, 
                color: "#333",
                textAlign: "justify",
                textAlignLast: "left",
                lineHeight: "1.6",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                fontSize: "clamp(14px, 2.5vw, 16px)"
              }}>{r.abstract_1l}</p>
            </div>
          );
        })}
      </div>
      </main>
    </>
  );
}