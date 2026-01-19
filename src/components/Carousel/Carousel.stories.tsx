import type { Meta, StoryObj } from '@storybook/react';
import { Carousel } from './Carousel';
import { Card, CardBody } from '../Card/Card';

const meta: Meta<typeof Carousel> = {
  title: 'Navigation/Carousel',
  component: Carousel,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    showArrows: { control: 'boolean' },
    showDots: { control: 'boolean' },
    autoplay: { control: 'number' },
    pauseOnHover: { control: 'boolean' },
    loop: { control: 'boolean' },
    initialSlide: { control: 'number' },
  },
  args: {
    size: 'md',
    showArrows: true,
    showDots: true,
    loop: true,
    pauseOnHover: true,
  },
};
export default meta;

type Story = StoryObj<typeof Carousel>;

function DemoSlide({ color, label }: { color: string; label: string }) {
  return (
    <div
      className="flex h-64 items-center justify-center rounded-xl text-2xl font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </div>
  );
}

export const Default: Story = {
  render: args => (
    <Carousel {...args}>
      <DemoSlide color="#081639" label="Slide 1" />
      <DemoSlide color="#00aeef" label="Slide 2" />
      <DemoSlide color="#aea1ed" label="Slide 3" />
      <DemoSlide color="#8696a2" label="Slide 4" />
    </Carousel>
  ),
};

export const WithCards: Story = {
  render: args => (
    <Carousel {...args} size="lg">
      <Card tone="inverse" className="h-full">
        <CardBody className="flex h-96 flex-col items-center justify-center text-center">
          <div className="text-3xl font-semibold">Welcome</div>
          <div className="mt-2 text-(--ui-inverse-text)/80">Your executive dashboard awaits</div>
        </CardBody>
      </Card>
      <Card tone="soft" className="h-full">
        <CardBody className="flex h-96 flex-col items-center justify-center text-center">
          <div className="text-3xl font-semibold text-(--ui-text)">Analytics</div>
          <div className="mt-2 text-(--ui-text-muted)">Track your key metrics</div>
        </CardBody>
      </Card>
      <Card className="h-full">
        <CardBody className="flex h-96 flex-col items-center justify-center text-center">
          <div className="text-3xl font-semibold text-(--ui-text)">Reports</div>
          <div className="mt-2 text-(--ui-text-muted)">Generate insights on demand</div>
        </CardBody>
      </Card>
    </Carousel>
  ),
};

export const Autoplay: Story = {
  args: {
    autoplay: 3000,
  },
  render: args => (
    <Carousel {...args}>
      <DemoSlide color="#081639" label="Auto 1" />
      <DemoSlide color="#00aeef" label="Auto 2" />
      <DemoSlide color="#aea1ed" label="Auto 3" />
    </Carousel>
  ),
};

export const NoLoop: Story = {
  args: {
    loop: false,
  },
  render: args => (
    <Carousel {...args}>
      <DemoSlide color="#081639" label="First" />
      <DemoSlide color="#00aeef" label="Middle" />
      <DemoSlide color="#aea1ed" label="Last" />
    </Carousel>
  ),
};

export const DotsOnly: Story = {
  args: {
    showArrows: false,
    showDots: true,
  },
  render: args => (
    <Carousel {...args}>
      <DemoSlide color="#081639" label="Slide 1" />
      <DemoSlide color="#00aeef" label="Slide 2" />
      <DemoSlide color="#aea1ed" label="Slide 3" />
    </Carousel>
  ),
};

export const ArrowsOnly: Story = {
  args: {
    showArrows: true,
    showDots: false,
  },
  render: args => (
    <Carousel {...args}>
      <DemoSlide color="#081639" label="Slide 1" />
      <DemoSlide color="#00aeef" label="Slide 2" />
      <DemoSlide color="#aea1ed" label="Slide 3" />
    </Carousel>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <div className="mb-2 text-sm font-semibold text-(--ui-text-muted)">Small</div>
        <Carousel size="sm">
          <DemoSlide color="#081639" label="Small" />
          <DemoSlide color="#00aeef" label="Carousel" />
        </Carousel>
      </div>
      <div>
        <div className="mb-2 text-sm font-semibold text-(--ui-text-muted)">Medium (default)</div>
        <Carousel size="md">
          <DemoSlide color="#081639" label="Medium" />
          <DemoSlide color="#00aeef" label="Carousel" />
        </Carousel>
      </div>
      <div>
        <div className="mb-2 text-sm font-semibold text-(--ui-text-muted)">Large</div>
        <Carousel size="lg">
          <DemoSlide color="#081639" label="Large" />
          <DemoSlide color="#00aeef" label="Carousel" />
        </Carousel>
      </div>
    </div>
  ),
};

export const SingleSlide: Story = {
  render: args => (
    <Carousel {...args}>
      <DemoSlide color="#081639" label="Only One Slide" />
    </Carousel>
  ),
};
