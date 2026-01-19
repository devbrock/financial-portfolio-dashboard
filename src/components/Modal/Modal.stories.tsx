import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Modal } from './Modal';
import { Button } from '../Button/Button';

const meta: Meta<typeof Modal> = {
  title: 'Navigation/Modal',
  component: Modal,
};
export default meta;

type Story = StoryObj<typeof Modal>;

function DefaultExample() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Confirm action"
        description="This action can't be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </>
        }
      >
        <div className="text-sm text-(--ui-text)">Modal body content goes here.</div>
      </Modal>
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultExample />,
};
