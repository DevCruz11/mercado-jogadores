import { ReactNode } from 'react';

export interface ResultItem {
  label: string;
  value: ReactNode;
}

export function ResultSummary({ items }: { items: ResultItem[] }) {
  return (
    <dl className="result-summary">
      {items.map((item) => (
        <div key={item.label} className="result-summary__item">
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
