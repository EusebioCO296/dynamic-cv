// @ts-check
import { defineConfig } from 'astro/config';
import sanity from "@sanity/astro";
import react from "@astrojs/react";
import icon from "astro-icon";
import tailwind from "@astrojs/tailwind";
import { loadEnv } from 'vite';

const env = loadEnv("", process.cwd(), "PUBLIC_");

// https://astro.build/config
export default defineConfig({
  output: "static",
  integrations: [sanity({
    projectId: env.PUBLIC_SANITY_PROJECT_ID,
    dataset: env.PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: "2024-07-24",
    studioBasePath: '/studio',
    stega: {
      studioUrl: "/studio",
    },
  }), react(), tailwind(), icon()]
});