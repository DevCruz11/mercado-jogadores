interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalItems, onChange }: PaginationProps) {
  return (
    <nav className="pagination" aria-label="Paginação">
      <span className="pagination__total">
        {totalItems} {totalItems === 1 ? 'jogador encontrado' : 'jogadores encontrados'}
      </span>
      <div className="pagination__controls">
        <button
          type="button"
          className="button button--ghost"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          ‹ Anterior
        </button>
        <span>
          Página {totalPages === 0 ? 0 : page} de {totalPages}
        </span>
        <button
          type="button"
          className="button button--ghost"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Próxima ›
        </button>
      </div>
    </nav>
  );
}
