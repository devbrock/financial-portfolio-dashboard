import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
  ],
  framework: "@storybook/react-vite",
  async viteFinal(baseConfig) {
    const storybookDir = path.dirname(fileURLToPath(import.meta.url));
    const projectRoot = path.resolve(storybookDir, "..");

    return mergeConfig(baseConfig, {
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          "@": path.resolve(projectRoot, "src"),
          "@utils": path.resolve(projectRoot, "src/utils"),
          "@components": path.resolve(projectRoot, "src/components"),
          "@hooks": path.resolve(projectRoot, "src/hooks"),
          "@services": path.resolve(projectRoot, "src/services"),
          "@types": path.resolve(projectRoot, "src/types"),
          "@test": path.resolve(projectRoot, "src/test"),
          "@styles": path.resolve(projectRoot, "src/styles"),
        },
      },
    });
  },
};
export default config;
