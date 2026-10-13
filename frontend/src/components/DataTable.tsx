import { ReactNode } from 'react';

export interface Column<Row> {
  header: string;
  render: (row: Row) => ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<Row> {
  columns: Column<Row>[];
  rows: Row[] | undefined;
  rowKey: (row: Row) => string | number;
  loading: boolean;
  error?: string;
  emptyMessage: string;
  onRetry?: () => void;
  onRowClick?: (row: Row) => void;
}

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  loading,
  error,
  emptyMessage,
  onRetry,
  onRowClick,
}: DataTableProps<Row>) {
  return (
    <div className="table-wrapper" aria-busy={loading}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header} className={`align-${column.align ?? 'left'}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderBody()}</tbody>
      </table>
    </div>
  );

  function renderBody() {
    if (loading && !rows) {
      return <StateRow columns={columns.length}>Carregando…</StateRow>;
    }
    if (error) {
      return (
        <StateRow columns={columns.length} tone="error">
          {error}{' '}
          {onRetry && (
            <button type="button" className="button button--link" onClick={onRetry}>
              Tentar de novo
            </button>
          )}
        </StateRow>
      );
    }
    if (!rows || rows.length === 0) {
      return <StateRow columns={columns.length}>{emptyMessage}</StateRow>;
    }
    return rows.map((row) => (
      <tr
        key={rowKey(row)}
        className={onRowClick ? 'table__row--clickable' : undefined}
        onClick={onRowClick ? () => onRowClick(row) : undefined}
      >
        {columns.map((column) => (
          <td key={column.header} className={`align-${column.align ?? 'left'}`}>
            {column.render(row)}
          </td>
        ))}
      </tr>
    ));
  }
}

function StateRow({
  columns,
  tone,
  children,
}: {
  columns: number;
  tone?: 'error';
  children: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={columns} className={`table__state ${tone ? `table__state--${tone}` : ''}`}>
        {children}
      </td>
    </tr>
  );
}
