import { tool } from "ai";
import { z } from "zod";
import { searxngSearch, fetchReadable } from "./web";

export const webTools = {
  web_search: tool({
    description:
      "Search the web. Returns a ranked list of {link, title, snippet}.\n\n" +
      "CALL this tool when the user asks about:\n" +
      "- current events, news, or time-sensitive info\n" +
      "- specific facts you're not confident in (dates, prices, versions, people's roles)\n" +
      "- anything that may have changed after your training cutoff\n" +
      "- a URL, product, or name you don't recognize\n\n" +
      "Unless you're 100% certain, you MUST call web_search instead of guessing/hallucinating.\n\n" +
      "After searching, use fetch_url on 1-3 promising results. Always cite sources.",
    inputSchema: z.object({
      query: z.string().describe("The search query"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(10)
        .default(5)
        .describe("Max number of results to return"),
    }),
    execute: async ({ query, limit }) => searxngSearch(query, limit),
  }),

  fetch_url: tool({
    description:
      "Fetch a URL and return its main content as markdown. Use this after web_search " +
      "to read specific pages in depth. Content is truncated to ~8k characters.",
    inputSchema: z.object({
      url: z.string().url().describe("The URL to fetch"),
    }),
    execute: async ({ url }) => fetchReadable(url),
  }),
}