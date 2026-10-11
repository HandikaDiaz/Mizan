import { db } from "@/src/prisma/db";
import Parser from "rss-parser";

const parser = new Parser();

export interface RssSource {
  id: string;
  name: string;
  baseUrlOrHandle: string;
}

export interface RssResult {
  source: {
    id: string;
    name: string;
  };

  items: Parser.Item[];
}

export async function fetchRssSources(): Promise<RssResult[]> {
  const sources = await db.orm.public.Source
    .where({
      dataFormats: "RSS",
      isActive: true,
      sourceType: "NEWS",
    })
    .all();

  if (sources.length === 0) {
    throw new Error("RSS sources not found");
  }

  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const feed = await parser.parseURL(
        source.baseUrlOrHandle,
      );

      return {
        source: {
          id: source.id,
          name: source.name,
        },

        items: feed.items,
      };
    }),
  );

  return results
    .filter(
      (
        result,
      ): result is PromiseFulfilledResult<RssResult> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value);
}