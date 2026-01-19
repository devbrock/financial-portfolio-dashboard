import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardBody, CardFooter, CardHeader } from './Card';
import { Button } from '../Button/Button';

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card',
  component: Card,
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <div>
          <div className="text-sm font-semibold">Account Overview</div>
          <div className="text-sm text-(--ui-text-muted)">Updated 2 minutes ago</div>
        </div>
        <Button size="sm" variant="secondary">
          Action
        </Button>
      </CardHeader>
      <CardBody>
        <div className="text-sm text-(--ui-text)">Executive-friendly body content.</div>
      </CardBody>
      <CardFooter>
        <Button variant="ghost">Cancel</Button>
        <Button>Continue</Button>
      </CardFooter>
    </Card>
  ),
};

export const Inverse: Story = {
  render: () => (
    <Card tone="inverse">
      <CardHeader>
        <div className="text-sm font-semibold">Inverse Card</div>
      </CardHeader>
      <CardBody>
        <div className="text-sm opacity-90">Readable on dark surfaces.</div>
      </CardBody>
    </Card>
  ),
};
