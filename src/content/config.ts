import { defineCollection, z } from "astro:content";

const watchlog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      mediaType: z.enum(["movie", "tv"]),
      status: z.string(),
      rating: z.string().optional(),
      progress: z.string().optional(),
      tags: z.array(z.string()).optional(),
      watchDate: z.string().optional(),
      tmdbId: z.number().int().optional(),
      tmdbUrl: z.string().url().optional(),
      posterUrl: z.string().url().optional(),
      backdropUrl: z.string().url().optional(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional()
    })
});

export const collections = {
  watchlog
};
