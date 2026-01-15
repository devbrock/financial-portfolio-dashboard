import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "Data Display/Alert",
  component: Alert,
};
export default meta;

type Story = StoryObj<typeof Alert>;

export const Tones: Story = {
  render: () => (
    <div className="space-y-3">
      <Alert tone="info">Info alert — portfolio refreshed.</Alert>
      <Alert tone="success">Success alert — export complete.</Alert>
      <Alert tone="warning">Warning alert — data may be delayed.</Alert>
      <Alert tone="danger">Danger alert — connection lost.</Alert>
    </div>
  ),
};


