"use client";

import { useState } from "react";

type Result = {
  url: string;
  abstract_1l: string;
  score: number;
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
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>
        Validated Design / Reference Architecture Search
      </h1>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you’re looking for (e.g., 'AI training pod design with UCS and Nexus')"
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ddd",
          }}
        />
        <button
          onClick={onSearch}
          disabled={loading || !prompt.trim()}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #ddd",
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {error && (
        <p style={{ marginTop: 12, color: "crimson" }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
        {results.map((r) => (
          <div
            key={r.url}
            style={{
              border: "1px solid #eee",
              borderRadius: 14,
              padding: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <a href={r.url} target="_blank" rel="noreferrer" style={{ fontWeight: 600 }}>
                {r.url}
              </a>
              <span style={{ fontFamily: "monospace" }}>
                {Number.isFinite(r.score) ? r.score.toFixed(3) : "—"}
              </span>
            </div>
            <p style={{ marginTop: 8, color: "#333" }}>{r.abstract_1l}</p>
          </div>
        ))}
      </div>
    </main>
  );
}