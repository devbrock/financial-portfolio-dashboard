import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from "./IconButton";

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <circle cx="6" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="18" cy="12" r="1.8" />
    </svg>
  );
}

const meta: Meta<typeof IconButton> = {
  title: "Controls/IconButton",
  component: IconButton,
};
export default meta;

type Story = StoryObj<typeof IconButton>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton ariaLabel="More options" icon={<DotsIcon />} variant="ghost" />
      <IconButton
        ariaLabel="More options"
        icon={<DotsIcon />}
        variant="secondary"
      />
      <div className="rounded-2xl bg-(--ui-inverse-bg) p-3">
        <IconButton ariaLabel="More options" icon={<DotsIcon />} variant="inverse" />
      </div>
    </div>
  ),
};


