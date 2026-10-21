import { integerRange, required, textLength, validateFields } from '../utils/validation';

describe('validação de formulários', () => {
  it('exige campo preenchido', () => {
    expect(required('   ')).toBe('Campo obrigatório.');
    expect(required('Meia Lua')).toBeUndefined();
  });

  it('conta o tamanho do texto depois de tirar espaços repetidos', () => {
    const nameLength = textLength(3, 100);
    expect(nameLength('  Ab  ')).toBeDefined();
    expect(nameLength('  A   b ')).toBeUndefined();
  });

  it('aceita só inteiros dentro da faixa', () => {
    const agility = integerRange(1, 100);
    expect(agility('100')).toBeUndefined();
    expect(agility('101')).toBeDefined();
    expect(agility('50.5')).toBeDefined();
    expect(agility('')).toBeDefined();
  });

  it('devolve a primeira mensagem de erro de cada campo', () => {
    const errors = validateFields(
      { name: '', age: '15' },
      { name: [required, textLength(3, 100)], age: [required, integerRange(16, 45)] },
    );
    expect(errors).toEqual({
      name: 'Campo obrigatório.',
      age: 'Informe um inteiro de 16 a 45.',
    });
  });
});
