import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaService } from '../src/prisma/prisma.service';

const VALID_PLAYER = {
  name: 'Meia Lua',
  position: 'MEI',
  agility: 85,
  age: 25,
  pace: 70,
  shooting: 68,
  passing: 82,
  dribbling: 79,
  defending: 55,
  physical: 64,
  potential: 86,
};

describe('validação HTTP (V1 a V9)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();
    app = moduleRef.createNestApplication<NestExpressApplication>({
      bodyParser: false,
      logger: false,
    });
    configureApp(app);
    await app.init();
  });

  afterAll(() => app.close());

  async function expectRefusal(response: request.Response, status: number): Promise<void> {
    expect(response.status).toBe(status);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(typeof response.body.message).toBe('string');
    expect(response.body.message.length).toBeGreaterThan(0);
    expect(JSON.stringify(response.body)).not.toMatch(/at .*\.(ts|js):\d+/);
  }

  const postPlayer = (body: unknown) =>
    request(app.getHttpServer())
      .post('/api/v1/players')
      .set('Content-Type', 'application/json')
      .send(typeof body === 'string' ? body : JSON.stringify(body));

  describe('corpo do cadastro de jogador', () => {
    it.each([
      ['JSON inválido (V1)', '{"name":'],
      ['array no lugar de objeto (V1)', []],
      ['número no lugar de objeto (V1)', '10'],
      ['número enviado como texto (V2)', { ...VALID_PLAYER, agility: '85' }],
      ['inteiro com parte fracionária (V2)', { ...VALID_PLAYER, agility: 50.5 }],
      ['nome com caractere de controle (V4)', { ...VALID_PLAYER, name: 'Meia\tLua' }],
      ['nome que fica vazio (V4)', { ...VALID_PLAYER, name: '   ' }],
      ['nome com uma só palavra', { ...VALID_PLAYER, name: 'Meialua' }],
      ['nome com dígito', { ...VALID_PLAYER, name: 'Meia Lua 2' }],
      ['valor de lista em minúsculas (V5)', { ...VALID_PLAYER, position: 'mei' }],
      ['campo obrigatório nulo (V6)', { ...VALID_PLAYER, age: null }],
      ['campo fora do snake_case (V6)', { ...VALID_PLAYER, agility: undefined, Agility: 85 }],
      ['idade abaixo do limite', { ...VALID_PLAYER, age: 15 }],
      ['agilidade acima de 85 com 35 anos', { ...VALID_PLAYER, age: 35, agility: 86 }],
      [
        'soma dos atributos acima de 480',
        {
          ...VALID_PLAYER,
          pace: 99,
          shooting: 99,
          passing: 99,
          dribbling: 99,
          defending: 99,
          physical: 99,
          potential: 99,
        },
      ],
      ['potencial menor que o maior atributo', { ...VALID_PLAYER, potential: 81 }],
      ['potencial diferente do maior atributo com 33 anos', { ...VALID_PLAYER, age: 33 }],
    ])('recusa %s com 400', async (_case, body) => {
      await expectRefusal(await postPlayer(body), 400);
    });
  });

  describe('id na URL (V8)', () => {
    it.each(['abc', '0', '-1', '1.5', '01', '2147483648'])(
      'trata "%s" como inexistente (404)',
      async (id) => {
        await expectRefusal(await request(app.getHttpServer()).get(`/api/v1/players/${id}`), 404);
      },
    );

    it('responde 404 em JSON para caminho fora do enunciado', async () => {
      await expectRefusal(await request(app.getHttpServer()).get('/api/v1/inexistente'), 404);
    });
  });

  describe('query params', () => {
    it.each([
      '/api/v1/players?position=',
      '/api/v1/players?position=mei',
      '/api/v1/players?sort=value_asc,value_desc',
      '/api/v1/players?sort=POSITION',
      '/api/v1/players?free=true&club_id=1',
      '/api/v1/players?min_age=30&max_age=20',
      '/api/v1/players?min_value=10.555',
      '/api/v1/players?page=01',
      '/api/v1/players?limit=51',
      '/api/v1/players?search=a',
      '/api/v1/clubs?sort=net_worth',
      '/api/v1/clubs/1/transactions?type=COMPRA,venda',
      '/api/v1/clubs/1/transactions?type=VENDA,VENDA',
      '/api/v1/matches?club_id=0',
    ])('recusa %s com 400', async (path) => {
      await expectRefusal(await request(app.getHttpServer()).get(path), 400);
    });
  });

  describe('corpos dos demais endpoints', () => {
    const send = (method: 'post' | 'put', path: string, body: unknown) =>
      request(app.getHttpServer())
        [method](path)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(body));

    it.each([
      [
        'clube com sigla que não sai do nome',
        'post',
        '/api/v1/clubs',
        { name: 'Águias FC', acronym: 'FCA' },
      ],
      [
        'clube com três letras iguais na sigla',
        'post',
        '/api/v1/clubs',
        { name: 'Aaa Bbb', acronym: 'AAA' },
      ],
      [
        'clube com nome de uma palavra',
        'post',
        '/api/v1/clubs',
        { name: 'Águias', acronym: 'AGU' },
      ],
      [
        'compra com data sem -03:00 (RN01)',
        'post',
        '/api/v1/players/1/buy',
        { club_id: 1, loyalty_until: '2027-03-02T10:15' },
      ],
      [
        'compra com data inexistente (RN01)',
        'post',
        '/api/v1/players/1/buy',
        { club_id: 1, loyalty_until: '2027-02-30T10:15-03:00' },
      ],
      [
        'compra com club_id zero',
        'post',
        '/api/v1/players/1/buy',
        { club_id: 0, loyalty_until: '2027-03-02T10:15-03:00' },
      ],
      [
        'escalação com 4 jogadores',
        'put',
        '/api/v1/clubs/1/lineup',
        { formation: '2-1-1', player_ids: [1, 2, 3, 4] },
      ],
      [
        'escalação com jogador repetido',
        'put',
        '/api/v1/clubs/1/lineup',
        { formation: '2-1-1', player_ids: [1, 2, 3, 4, 4] },
      ],
      [
        'escalação com formação fora da lista',
        'put',
        '/api/v1/clubs/1/lineup',
        { formation: '4-0', player_ids: [1, 2, 3, 4, 5] },
      ],
      [
        'partida com mandante igual ao visitante',
        'post',
        '/api/v1/matches',
        { home_club_id: 1, away_club_id: 1 },
      ],
    ] as const)('recusa %s com 400', async (_case, method, path, body) => {
      await expectRefusal(await send(method, path, body), 400);
    });
  });
});
