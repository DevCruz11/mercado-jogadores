import { render, screen } from '@testing-library/react';
import { DataTable } from '../components/DataTable';

const columns = [{ header: 'Nome', render: (row: { id: number; name: string }) => row.name }];

describe('DataTable', () => {
  it('mostra o carregamento antes de chegar a lista', () => {
    render(
      <DataTable
        columns={columns}
        rows={undefined}
        rowKey={(row) => row.id}
        loading
        emptyMessage="Vazio"
      />,
    );
    expect(screen.getByText('Carregando…')).toBeInTheDocument();
  });

  it('mostra a mensagem de lista vazia', () => {
    render(
      <DataTable
        columns={columns}
        rows={[]}
        rowKey={(row) => row.id}
        loading={false}
        emptyMessage="Nenhum jogador."
      />,
    );
    expect(screen.getByText('Nenhum jogador.')).toBeInTheDocument();
  });

  it('mostra o erro devolvido pela API', () => {
    render(
      <DataTable
        columns={columns}
        rows={undefined}
        rowKey={(row) => row.id}
        loading={false}
        error="Não foi possível conectar à API."
        emptyMessage="Vazio"
      />,
    );
    expect(screen.getByText(/Não foi possível conectar/)).toBeInTheDocument();
  });

  it('mostra as linhas recebidas', () => {
    render(
      <DataTable
        columns={columns}
        rows={[{ id: 1, name: 'Meia Lua' }]}
        rowKey={(row) => row.id}
        loading={false}
        emptyMessage="Vazio"
      />,
    );
    expect(screen.getByText('Meia Lua')).toBeInTheDocument();
  });
});
