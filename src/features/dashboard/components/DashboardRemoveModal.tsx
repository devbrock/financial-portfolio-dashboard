import { Button, Modal, Text } from '@components';

type DashboardRemoveModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DashboardRemoveModal(props: DashboardRemoveModalProps) {
  const { open, onClose, onConfirm } = props;

  return (
    <Modal
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) onClose();
      }}
      title="Remove holding?"
      description="This will remove the position from your dashboard. You can add it again later."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Remove
          </Button>
        </>
      }
    >
      <Text as="p" size="sm" tone="muted">
        Think of this like removing a sticky note from your desk: it doesn't change the company,
        it just clears your view.
      </Text>
    </Modal>
  );
}
