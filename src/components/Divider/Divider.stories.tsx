import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from "./Divider";

const meta: Meta<typeof Divider> = {
  title: "Primitives/Divider",
  component: Divider,
};
export default meta;

type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  args: { orientation: "horizontal" },
  render: (args) => (
    <div className="w-full max-w-md space-y-4">
      <div className="text-sm text-(--ui-text)">Top</div>
      <Divider {...args} />
      <div className="text-sm text-(--ui-text)">Bottom</div>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="flex items-center gap-4">
      <div className="text-sm text-(--ui-text)">Left</div>
      <Divider {...args} style={{ height: 40 }} />
      <div className="text-sm text-(--ui-text)">Right</div>
    </div>
  ),
};


