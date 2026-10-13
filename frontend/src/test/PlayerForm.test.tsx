import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationProvider } from '../components/notifications/NotificationProvider';
import { PlayerForm } from '../features/players/PlayerForm';

describe('PlayerForm', () => {
  it('valida os campos antes de enviar', async () => {
    const onCreate = vi.fn();
    render(
      <NotificationProvider>
        <PlayerForm pending={false} onCreate={onCreate} onUpdate={vi.fn()} onClose={vi.fn()} />
      </NotificationProvider>,
    );

    await userEvent.type(screen.getByLabelText('Nome'), 'Ab');
    await userEvent.type(screen.getByLabelText('Agilidade (1 a 100)'), '150');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(screen.getByText('Use de 3 a 100 caracteres.')).toBeInTheDocument();
    expect(screen.getByText('Informe um inteiro de 1 a 100.')).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });
});
