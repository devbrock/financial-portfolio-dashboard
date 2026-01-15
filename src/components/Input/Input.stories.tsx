import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Controls/Input",
  component: Input,
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    id: "example",
    placeholder: "Search symbols…",
  },
};

export const Invalid: Story = {
  args: {
    id: "invalid",
    placeholder: "Invalid state",
    "aria-invalid": true,
  },
};


