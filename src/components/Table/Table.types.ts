import type * as React from "react";

export type TableProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Table element props.
   */
  tableProps?: React.TableHTMLAttributes<HTMLTableElement>;
};

export type TableSectionProps = React.HTMLAttributes<HTMLTableSectionElement>;
export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  /**
   * Adds hover background for rows.
   */
  hover?: boolean;
};

export type TableHeadCellProps = React.ThHTMLAttributes<HTMLTableCellElement>;
export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;


