// src/data/mockData.js
// Dados mockados baseados na planilha "Escala 07.08.26.xlsx"
// Estrutura real extraída das abas: 'Escala Diária seg a sex', 'Dados', 'LISTA DO GUARDA SEG-SEXTA'

// ============================================================
// MOTORISTAS (extraídos da aba "Dados")
// ============================================================
export const initialDrivers = [
  { id: 1,  name: 'ADEMAR DOS SANTOS',       phone: '51985290147', categoria: 'Titular',  status: 'Ativo' },
  { id: 2,  name: 'ADEMIR MONTEIRO',          phone: '51997226927', categoria: 'Titular',  status: 'Ativo' },
  { id: 3,  name: 'ADILSON MILANEZI',         phone: '51989616531', categoria: 'Titular',  status: 'Ativo' },
  { id: 4,  name: 'AGNALDO GENEROSO',         phone: '51982024282', categoria: 'Titular',  status: 'Ativo' },
  { id: 5,  name: 'ALBERTO DE SOUZA',         phone: '51985517213', categoria: 'Titular',  status: 'Ativo' },
  { id: 6,  name: 'ALCANTARA - FABIANO',      phone: '51984444047', categoria: 'Titular',  status: 'Ativo' },
  { id: 7,  name: 'ALDEMIR NASCIMENTO',       phone: '51986283408', categoria: 'Titular',  status: 'Ativo' },
  { id: 8,  name: 'ALECSANDRO RIBEIRO SILVA', phone: '51984189098', categoria: 'Reserva',  status: 'Ativo' },
  { id: 9,  name: 'ALESSANDRO BANDEIRA',      phone: '51995408331', categoria: 'Titular',  status: 'Ativo' },
  { id: 10, name: 'ALEX ALVES',               phone: '51993018967', categoria: 'Titular',  status: 'Ativo' },
  { id: 11, name: 'ALEXANDRE PEREIRA',        phone: '51989461174', categoria: 'Reserva',  status: 'Ativo' },
  { id: 12, name: 'ALEXSANDRO DE OLIVEIRA',   phone: '51980650527', categoria: 'Titular',  status: 'Ativo' },
  { id: 13, name: 'ALTAIR RAMOS',             phone: '51998221663', categoria: 'Reserva',  status: 'Ativo' },
  { id: 14, name: 'ANDERSON MOITOSO',         phone: '51984204331', categoria: 'Titular',  status: 'Ativo' },
  { id: 15, name: 'ANDRE ALMEIDA',            phone: '51984247208', categoria: 'Titular',  status: 'Ativo' },
  { id: 16, name: 'ANDRE MELO',               phone: '51992079650', categoria: 'Titular',  status: 'Ativo' },
  { id: 17, name: 'ANDREIA MERCEDES',         phone: '51994696256', categoria: 'Titular',  status: 'Ativo' },
  { id: 18, name: 'ANTONIO LEAL',             phone: '51982660028', categoria: 'Titular',  status: 'Ativo' },
  { id: 19, name: 'ARIANE MILLEO',            phone: '51995633144', categoria: 'Ferista',  status: 'Ativo' },
  { id: 20, name: 'ARNALDO ROSARIO',          phone: '51997149342', categoria: 'Reserva',  status: 'Ativo' },
  { id: 21, name: 'BERENICE DA ANTUNES',      phone: '51991950932', categoria: 'Titular',  status: 'Ativo' },
  { id: 22, name: 'BRUNO CHUQUEL',            phone: '51991650359', categoria: 'Titular',  status: 'Ativo' },
  { id: 23, name: 'CAREN FERREIRA',           phone: '51989601974', categoria: 'Reserva',  status: 'Ativo' },
  { id: 24, name: 'CARLOS RODRIGUES',         phone: '51997901519', categoria: 'Titular',  status: 'Ativo' },
  { id: 25, name: 'CASSIO SANTOS',            phone: '51981471968', categoria: 'Ferista',  status: 'Ativo' },
  { id: 26, name: 'CLAITON DIAS',             phone: '51994383326', categoria: 'Reserva',  status: 'Ativo' },
  { id: 27, name: 'CRISTIANO ALVES',          phone: '51996050194', categoria: 'Titular',  status: 'Ativo' },
  { id: 28, name: 'DANIEL CARDOSO',           phone: '51989081015', categoria: 'Titular',  status: 'Ativo' },
  { id: 29, name: 'DANIEL MONTEIRO',          phone: '51985493409', categoria: 'Reserva',  status: 'Ativo' },
  { id: 30, name: 'DAVI ALBERTO',             phone: '51989760765', categoria: 'Titular',  status: 'Ativo' },
  { id: 31, name: 'DEIVISON WILLIAN',         phone: '51995526690', categoria: 'Titular',  status: 'Ativo' },
  { id: 32, name: 'DIEGO FELIPE',             phone: '51992100833', categoria: 'Titular',  status: 'Ativo' },
  { id: 33, name: 'DOUGLAS VINICIUS',         phone: '51991933290', categoria: 'Ferista',  status: 'Ativo' },
  { id: 34, name: 'EDER LEANDRO',             phone: '51982427989', categoria: 'Titular',  status: 'Ativo' },
  { id: 35, name: 'EDEVALDO PEREIRA',         phone: '51984219687', categoria: 'Reserva',  status: 'Ativo' },
  { id: 36, name: 'EDILMAR DOS SANTOS',       phone: '51991887802', categoria: 'Titular',  status: 'Ativo' },
  { id: 37, name: 'EDSON PRESTES',            phone: '51997003234', categoria: 'Titular',  status: 'Ativo' },
  { id: 38, name: 'EMERSON RICARDO',          phone: '51985432118', categoria: 'Reserva',  status: 'Ativo' },
  { id: 39, name: 'FABIO ALVES',              phone: '51993571246', categoria: 'Titular',  status: 'Ativo' },
  { id: 40, name: 'FABIO RODRIGUES',          phone: '51981233405', categoria: 'Ferista',  status: 'Ativo' },
];

// ============================================================
// ESCALAS (extraídas das abas 'Escala Diária seg a sex' e 'LISTA DO GUARDA SEG-SEXTA')
// Coluna "pontoInicio": 'Linha' = saída direto da rota (Tok do Guarda)
//                        'Garagem' = motorista sai da garagem
// ============================================================
export const initialSchedules = [
  // --- SHOPEE STA RITA ---
  { id: 'ESC001', lineId: '103-SR', empresa: 'SHOPEE STA RITA', horario: '07:45', descricao: '103 - BRENO GARCIA / GRAVATAI / CACHOEIRINHA (ENTRADA 07:45)', pontoInicio: 'Linha',   motorista: 'ADEMAR DOS SANTOS',    status: 'Escalado', turno: 'Manhã' },
  { id: 'ESC002', lineId: '101-SR', empresa: 'SHOPEE STA RITA', horario: '19:00', descricao: '101 - MATHIAS VELHO / RIO BRANCO / CANOAS (SAÍDA 20:00)',       pontoInicio: 'Linha',   motorista: 'ANDRE ALMEIDA',        status: 'Escalado', turno: 'Noite' },
  { id: 'ESC003', lineId: '102-SR', empresa: 'SHOPEE STA RITA', horario: '19:00', descricao: '102 - SAPUCAIA DO SUL / FORTUNA (SAÍDA 20:00)',                  pontoInicio: 'Linha',   motorista: 'CRISTIANO ALVES',      status: 'Escalado', turno: 'Noite' },
  { id: 'ESC004', lineId: '104-SR', empresa: 'SHOPEE STA RITA', horario: '19:00', descricao: '104 - GUAJUVIRAS / NITEROI / CANOAS (SAÍDA 20:00)',              pontoInicio: 'Linha',   motorista: 'DANIEL CARDOSO',       status: 'Escalado', turno: 'Noite' },
  { id: 'ESC005', lineId: '105-SR', empresa: 'SHOPEE STA RITA', horario: '19:00', descricao: '105 - ESTEIO / TRES MARIAS (SAÍDA 20:00)',                       pontoInicio: 'Linha',   motorista: 'DAVI ALBERTO',         status: 'Escalado', turno: 'Noite' },

  // --- REITER LOG ---
  { id: 'ESC006', lineId: '301-RL', empresa: 'REITER LOG',      horario: '19:05', descricao: '301 - SAPUCAIA DO SUL / ESTEIO (ENTRADA 20:40)',                 pontoInicio: 'Linha',   motorista: 'DEIVISON WILLIAN',     status: 'Escalado', turno: 'Noite' },
  { id: 'ESC007', lineId: '302-RL', empresa: 'REITER LOG',      horario: '19:13', descricao: '302 - CANOAS (NITEROI / GUAJUVIRAS / NOVA SANTA RITA)',          pontoInicio: 'Linha',   motorista: 'DIEGO FELIPE',         status: 'Escalado', turno: 'Noite' },
  { id: 'ESC008', lineId: '303-RL', empresa: 'REITER LOG',      horario: '19:25', descricao: '303 - CANOAS (RIO BRANCO / MATHIAS VELHO)',                      pontoInicio: 'Linha',   motorista: 'DOUGLAS VINICIUS',     status: 'Escalado', turno: 'Noite' },

  // --- VIEMAR ---
  { id: 'ESC009', lineId: '201-VM', empresa: 'VIEMAR',          horario: '14:00', descricao: '6X1 - 201 - CANOAS (ENTRADA 14:00)',                            pontoInicio: 'Garagem', motorista: 'ADEMAR DOS SANTOS',    status: 'Escalado', turno: 'Tarde' },
  { id: 'ESC010', lineId: '109-VM', empresa: 'VIEMAR',          horario: '14:32', descricao: '109 - GUAJUVIRAS / CANOAS (SAÍDA 14:37)',                        pontoInicio: 'Garagem', motorista: 'EDER LEANDRO',         status: 'Escalado', turno: 'Tarde' },
  { id: 'ESC011', lineId: 'COZ-VM', empresa: 'VIEMAR',          horario: '19:30', descricao: 'VIEMAR COZINHEIRAS (ENTRADA 20:00)',                             pontoInicio: 'Linha',   motorista: 'EDSON PRESTES',        status: 'Escalado', turno: 'Noite' },

  // --- MUNDIAL ---
  { id: 'ESC012', lineId: '108-MN', empresa: 'MUNDIAL',         horario: '05:30', descricao: '108 - Parque Itacolomi / Bom Sucesso (ENTRADA 5:30)',            pontoInicio: 'Garagem', motorista: 'ADILSON MILANEZI',     status: 'Escalado', turno: 'Manhã' },
  { id: 'ESC013', lineId: '302-MN', empresa: 'MUNDIAL',         horario: '19:15', descricao: '302 - GRAVATAI (ENTRADA 20:40)',                                 pontoInicio: 'Linha',   motorista: 'EMERSON RICARDO',      status: 'Escalado', turno: 'Noite' },
  { id: 'ESC014', lineId: 'ADM-MN', empresa: 'MUNDIAL',         horario: '17:50', descricao: 'Adm Gravatai RS 030 (SAÍDA 17:50)',                              pontoInicio: 'Linha',   motorista: 'ADEMAR DOS SANTOS',    status: 'Escalado', turno: 'Tarde' },

  // --- PERTO ---
  { id: 'ESC015', lineId: '407-PT', empresa: 'PERTO',           horario: '18:00', descricao: '407 - Pq Matriz (SAÍDA 18:00)',                                  pontoInicio: 'Garagem', motorista: 'ADEMIR MONTEIRO',      status: 'Escalado', turno: 'Noite' },
  { id: 'ESC016', lineId: '415-PT', empresa: 'PERTO',           horario: '18:00', descricao: '415 - Ipiranga / Morada do Vale (SAÍDA 18:00)',                  pontoInicio: 'Garagem', motorista: 'ALDEMIR NASCIMENTO',   status: 'Escalado', turno: 'Noite' },
  { id: 'ESC017', lineId: '426-PT', empresa: 'PERTO',           horario: '18:00', descricao: '426 - Gravatai RS030 Via Freeway (SAÍDA 18:00)',                 pontoInicio: 'Garagem', motorista: 'ADILSON MILANEZI',     status: 'Escalado', turno: 'Noite' },
  { id: 'ESC018', lineId: '427-PT', empresa: 'PERTO',           horario: '18:00', descricao: '427 - Poa Jd Botanico / ZN (SAÍDA 18:00)',                       pontoInicio: 'Garagem', motorista: 'AGNALDO GENEROSO',     status: 'Escalado', turno: 'Noite' },
  { id: 'ESC019', lineId: '301-PT', empresa: 'PERTO',           horario: '23:00', descricao: '301 - RS030 / Morada Gaucha (ENTRADA 23:00)',                    pontoInicio: 'Linha',   motorista: 'ALBERTO DE SOUZA',     status: 'Escalado', turno: 'Madrugada' },

  // --- SHOPEE ESTEIO ---
  { id: 'ESC020', lineId: '202-SE', empresa: 'SHOPEE ESTEIO',   horario: '06:30', descricao: '202 - NOVO HAMBURGO / CAMPO BOM (ENTRADA 06:30)',                pontoInicio: 'Garagem', motorista: 'ALCANTARA - FABIANO', status: 'Escalado', turno: 'Manhã' },
  { id: 'ESC021', lineId: '302-SE', empresa: 'SHOPEE ESTEIO',   horario: '08:00', descricao: '302 - NOVO HAMBURGO / CAMPO BOM / SAPIRANGA (SAÍDA 08:00)',      pontoInicio: 'Garagem', motorista: 'ALEX ALVES',           status: 'Escalado', turno: 'Manhã' },
  { id: 'ESC022', lineId: '101-SE', empresa: 'SHOPEE ESTEIO',   horario: '13:45', descricao: '101 - CAMPO BOM (SAÍDA 13:45)',                                  pontoInicio: 'Garagem', motorista: 'ALCANTARA - FABIANO', status: 'Escalado', turno: 'Tarde' },

  // --- HERC ---
  { id: 'ESC023', lineId: '3D-HC',  empresa: 'HERC',            horario: '22:35', descricao: '3D - Sapucaia do Sul (ENTRADA 22:40)',                           pontoInicio: 'Linha',   motorista: 'ALEXSANDRO DE OLIVEIRA', status: 'Escalado', turno: 'Noite' },
  { id: 'ESC024', lineId: 'TL-HC',  empresa: 'HERC',            horario: '12:00', descricao: 'TRANSLADO MADALENA (12:00): MADALENA - HERC',                   pontoInicio: 'Garagem', motorista: 'AGNALDO GENEROSO',   status: 'Escalado', turno: 'Tarde' },

  // --- PROMETEON ---
  { id: 'ESC025', lineId: 'P1-PR',  empresa: 'PROMETEON',       horario: '21:40', descricao: 'Parque da Matriz / Bom Principio (ENTRADA 21:40)',               pontoInicio: 'Linha',   motorista: 'ADEMIR MONTEIRO',      status: 'Escalado', turno: 'Noite' },
  { id: 'ESC026', lineId: 'P2-PR',  empresa: 'PROMETEON',       horario: '22:20', descricao: 'Parque da Matriz / Bom Principio (SAÍDA 22:20)',                 pontoInicio: 'Linha',   motorista: 'ADILSON MILANEZI',     status: 'Escalado', turno: 'Noite' },

  // --- NEXTEER ---
  { id: 'ESC027', lineId: '201-NX', empresa: 'NEXTEER',         horario: '14:30', descricao: '201 - ALVORADA / PORTO ALEGRE (ENTRADA 14:30)',                  pontoInicio: 'Linha',   motorista: 'AGNALDO GENEROSO',     status: 'Escalado', turno: 'Tarde' },
  { id: 'ESC028', lineId: '101-NX', empresa: 'NEXTEER',         horario: '15:05', descricao: '101 - ALVORADA / PORTO ALEGRE (SAÍDA 15:05)',                    pontoInicio: 'Linha',   motorista: 'ANDREIA MERCEDES',     status: 'Escalado', turno: 'Tarde' },

  // --- FIBRAPLAC ---
  { id: 'ESC029', lineId: 'F1-FB',  empresa: 'FIBRAPLAC',       horario: '23:50', descricao: 'Cachoeirinha Ponte / Pda 76 / Gravatai Centro / RS030 (E 23:50)', pontoInicio: 'Linha',  motorista: 'ANDRE ALMEIDA',        status: 'Escalado', turno: 'Madrugada' },
  { id: 'ESC030', lineId: 'F2-FB',  empresa: 'FIBRAPLAC',       horario: '00:30', descricao: 'Cachoeirinha Ponte / Gravatai Centro / RS030 (S 00:30)',          pontoInicio: 'Linha',   motorista: 'ALEXANDRE PEREIRA',    status: 'Escalado', turno: 'Madrugada' },

  // --- SHOPEE GTI ---
  { id: 'ESC031', lineId: 'L02-GT', empresa: 'SHOPEE GTI',      horario: '05:00', descricao: 'LINHA 02 ENTRADA 05:00',                                         pontoInicio: 'Garagem', motorista: 'ALCANTARA - FABIANO',  status: 'Escalado', turno: 'Manhã' },
  { id: 'ESC032', lineId: 'L08-GT', empresa: 'SHOPEE GTI',      horario: '05:40', descricao: '302 - NEOPOLIS / SAO VICENTE / RINCAO (S 05:40)',                pontoInicio: 'Garagem', motorista: 'ANDRE MELO',           status: 'Escalado', turno: 'Manhã' },

  // --- AIVA ---
  { id: 'ESC033', lineId: '302-AV', empresa: 'AIVA',            horario: '22:00', descricao: '302 - ESTEIO / CACHOEIRINHA / GRAVATAI TURNO A (ENTRADA 22:00)', pontoInicio: 'Linha',   motorista: 'ALCANTARA - FABIANO', status: 'Escalado', turno: 'Noite' },

  // --- HT MICRON ---
  { id: 'ESC034', lineId: '401-HT', empresa: 'HT MICRON',       horario: '08:00', descricao: '401 - Sapucaia / Gravatai / Poa (ENTRADA 08:00)',                 pontoInicio: 'Garagem', motorista: 'ALCANTARA - FABIANO', status: 'Escalado', turno: 'Manhã' },

  // --- HERTZ ---
  { id: 'ESC035', lineId: '102-HZ', empresa: 'HERTZ',           horario: '06:20', descricao: '102 - GUAIBA (ENTRADA 06:20)',                                   pontoInicio: 'Linha',   motorista: 'ALBERTO DE SOUZA',     status: 'Escalado', turno: 'Manhã' },

  // --- CONTROIL ---
  { id: 'ESC036', lineId: '105-CT', empresa: 'CONTROIL',        horario: '15:38', descricao: '105 Fortuna / Centro / Esteio (SAÍDA 15:38)',                    pontoInicio: 'Garagem', motorista: 'ALCANTARA - FABIANO', status: 'Escalado', turno: 'Tarde' },
];

// ============================================================
// FÉRIAS (histórico mockado)
// ============================================================
export const initialVacations = [
  {
    id: 'FER001',
    driverId: 22,
    driverName: 'BRUNO CHUQUEL',
    startDate: '2026-08-10',
    endDate: '2026-08-30',
    substitutoDriverId: 33,
    substitutoName: 'DOUGLAS VINICIUS',
    status: 'Agendado',
  },
];

// ============================================================
// ATESTADOS (histórico mockado)
// ============================================================
export const initialMedicalLeaves = [];

// ============================================================
// EMPRESAS disponíveis (para filtros)
// ============================================================
export const empresas = [
  'SHOPEE STA RITA', 'SHOPEE ESTEIO', 'SHOPEE GTI',
  'REITER LOG', 'VIEMAR', 'MUNDIAL', 'PERTO',
  'HERC', 'PROMETEON', 'NEXTEER', 'FIBRAPLAC',
  'AIVA', 'HT MICRON', 'HERTZ', 'CONTROIL',
];
