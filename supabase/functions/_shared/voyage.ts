const VOYAGE_API_KEY = Deno.env.get("VOYAGE_API_KEY")!;
const VOYAGE_MODEL = Deno.env.get("VOYAGE_MODEL") ?? "voyage-3";

export async function embed(
  texts: string[],
  inputType: "query" | "document" = "query",
): Promise<number[][]> {
  if (!VOYAGE_API_KEY) {
    throw new Error("VOYAGE_API_KEY not configured");
  }
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: texts,
      input_type: inputType,
      output_dimension: 1024,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Voyage API ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = await res.json() as { data: Array<{ embedding: number[] }> };
  return json.data.map((d) => d.embedding);
}
