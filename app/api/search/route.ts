import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export const runtime = "nodejs"; // ensure Node runtime (not Edge)

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type MatchRow = {
  url: string;
  abstract_1l: string;
  score: number;
  guide_type: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = String(body?.prompt || "").trim();
    const k = Math.max(1, Math.min(Number(body?.k ?? 8), 20));

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // 1) Embed the prompt
    const emb = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: prompt,
    });
    const query_embedding = emb.data[0].embedding;
    console.log("k", k);
    console.log("prompt", prompt);
    console.log("query_embedding", query_embedding);

    // 2) Vector search in Supabase (pgvector)
    const { data, error } = await supabase.rpc("match_papers", {
      query_embedding,
      match_count: k,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 3) Return the minimal shape you want
    const results: MatchRow[] = (data || []).map((r: any) => ({
      url: r.url,
      abstract_1l: r.abstract_1l,
      score: Number(r.score),
      guide_type: r.guide_type || "",
    }));
    console.log(results);

    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}