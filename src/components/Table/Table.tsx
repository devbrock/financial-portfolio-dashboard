import { cn } from "@utils/cn";
import type {
  TableCellProps,
  TableHeadCellProps,
  TableProps,
  TableRowProps,
  TableSectionProps,
} from "./Table.types";
import {
  tableClassName,
  tableTdClassName,
  tableThClassName,
  tableTheadClassName,
  tableWrapperClassName,
  tableRowHoverClassName,
} from "./Table.styles";

/**
 * Table
 * Responsive table wrapper with executive-friendly readability.
 *
 * A11y notes (spec):
 * - Use `<th scope="col">` for headers.
 * - Sortable headers must be buttons with `aria-sort` (consumer responsibility).
 */
export function Table(props: TableProps) {
  const { className, tableProps, children, ...rest } = props;
  return (
    <div className={cn(tableWrapperClassName, className)} {...rest}>
      <table className={tableClassName} {...tableProps}>
        {children}
      </table>
    </div>
  );
}

export function TableHead(props: TableSectionProps) {
  const { className, ...rest } = props;
  return <thead className={cn(tableTheadClassName, className)} {...rest} />;
}

export function TableBody(props: TableSectionProps) {
  return <tbody {...props} />;
}

export function TableRow(props: TableRowProps) {
  const { className, hover = false, ...rest } = props;
  return (
    <tr className={cn(hover && tableRowHoverClassName, className)} {...rest} />
  );
}

export function TableHeadCell(props: TableHeadCellProps) {
  const { className, scope = "col", ...rest } = props;
  return (
    <th scope={scope} className={cn(tableThClassName, className)} {...rest} />
  );
}

export function TableCell(props: TableCellProps) {
  const { className, ...rest } = props;
  return <td className={cn(tableTdClassName, className)} {...rest} />;
}
