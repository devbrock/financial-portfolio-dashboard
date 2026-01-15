import type { Meta, StoryObj } from "@storybook/react";
import { Chip } from "./Chip";

const meta: Meta<typeof Chip> = {
  title: "Controls/Chip",
  component: Chip,
};
export default meta;

type Story = StoryObj<typeof Chip>;

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Chip>Default</Chip>
      <Chip selected>Selected</Chip>
      <Chip disabled>Disabled</Chip>
      <Chip selected disabled>
        Selected + Disabled
      </Chip>
    </div>
  ),
};


