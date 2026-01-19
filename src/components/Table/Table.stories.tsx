import type { Meta, StoryObj } from '@storybook/react';
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from './Table';

const meta: Meta<typeof Table> = {
  title: 'Data Display/Table',
  component: Table,
};
export default meta;

type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeadCell>Symbol</TableHeadCell>
          <TableHeadCell>Price</TableHeadCell>
          <TableHeadCell>Change</TableHeadCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow hover>
          <TableCell>AAPL</TableCell>
          <TableCell>$192.44</TableCell>
          <TableCell>+1.2%</TableCell>
        </TableRow>
        <TableRow hover>
          <TableCell>MSFT</TableCell>
          <TableCell>$412.18</TableCell>
          <TableCell>-0.4%</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
