<p align="center">
  <img src="./doc/logo-hunit.png" alt="Firebase Triggers" width="305"/>
</p>

<p align="center">	
  <a href="https://www.linkedin.com/in/andrebraghinis/">
    <img alt="André Braghini" src="https://img.shields.io/badge/-AndreBraghiniS-798D2A?style=flat&logo=Linkedin&logoColor=white" />
  </a>
  <a href="https://www.npmjs.com/package/hunit-js">
    <img alt="npm version" src="https://img.shields.io/npm/v/hunit-js?color=798D2A">
  </a>
  <a href="https://github.com/andrebraghini/hunit-js/blob/master/LICENSE">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-798D2A">
  </a>
  <a href="https://codecov.io/gh/andrebraghini/hunit-js">
    <img src="https://codecov.io/gh/andrebraghini/hunit-js/branch/master/graph/badge.svg?token=bF5hxlvggz"/>
  </a>
  <img alt="Build result" src="https://travis-ci.org/andrebraghini/hunit-js.svg?branch=master">

  <br>

  <i>
    Biblioteca de comunicação para o HUnit, Channel Manager da HSystem
  </i>
</p>

<p align="center">
  <a href="README.md">Inglês</a>
  ·
  <a href="https://github.com/andrebraghini/hunit-js/blob/master/README.pt.md">Português</a>
</p>


## Conteúdo

1. [Instalação](#instalação)

2. [Uso](#uso)


## Instalação

```bash
npm install hunit-js --save
```

## Uso

```ts
import { HUnitClient } from 'hunit-js';

// Definir credenciais de autenticação. Código de identificação do Hotel, usuário e senha.
const credentials = {
  hotelId: '20',
  userName: 'hotel.user',
  password: 'hotel.password'
};

// Instanciar a classe cliente
const hunit = new HUnitClient(credentials);

// Fazer requisição
hunit.portalRead()
  .then(console.log)
  .catch(console.error);
```

### Lista de exemplos

Os exemplos abaixo mostram diversas comunicações feitas para um único hotel de maneira simples.

```ts
import { HUnitClient } from 'hunit-js';

const hunit = new HUnitClient({ hotelId: '20', userName: 'hotel.user', password: 'hotel.password' });

// Consultar lista de portais
hunit.portalRead()
  .then(portalList => console.log({ portalList }))
  .catch(console.error);

// Consultar reservas novas, alteradas ou canceladas
hunit.bookingRead()
  .then(reservationList => console.log({ reservationList }))
  .catch(console.error);

// Consultar reserva específica pelo código de identificação do HUnit
hunit.bookingByIdRead({ locatorId: '21565' })
  .then(reservation => console.log({ reservation }))
  .catch(console.error);

// Consultar reserva específica pelo código de identificação da reserva no portal de origem
hunit.bookingByIdRead({ portalId: '1', channelReservationId: '155511' })
  .then(reservation => console.log({ reservation }))
  .catch(console.error);

// Confirmar recebimento de reservas
const confirmationList = [
  { reservationId: '12', pmsReservationIdentifier: 'my_id_1' },
  { reservationId: '52', pmsReservationIdentifier: 'my_id_2' },
  { reservationId: '589', pmsReservationIdentifier: 'my_id_5' }
];
hunit.confirmePost(confirmationList)
  .then(confirmeResult => console.log({ confirmeResult }))
  .catch(console.error);

// Atualizar inventário
const updates = [
  // Remover disponibilidade do apartamento com código 12, de 25 de Dezembro até 31 de Dezembro
  // Se não informar o dia da semana na tag "dateRange", todos os dias serão considerados
  {
    roomTypeId: '12',
    availability: 0,
    dateRange: { from: new Date('2021-12-25'), to: new Date('2021-12-31') }
  },
  // Remover disponibilidade do apartamento com código 12, durante os finais de semana de Janeiro
  {
    roomTypeId: '12',
    availability: 0,
    dateRange: { from: new Date('2021-01-01'), to: new Date('2021-01-31'), fri: true, sat: true }
  },
  // Fechando a disponibilidade de um tipo de quarto, com código 222, enviando um stop de venda
  {
    roomTypeId: '222',
    dateRange: { from: new Date('2021-12-25'), to: new Date('2021-12-31') },
    stopSell: true
  },
  // Liberando um stop de venda de um tipo de quarto, com código 15
  {
    roomTypeId: '15',
    dateRange: { from: new Date('2021-12-25'), to: new Date('2021-12-31') },
    stopSell: false
  }
];
hunit.availabilityUpdate(updates)
  .then(availabilityUpdateResult => console.log({ availabilityUpdateResult }))
  .catch(console.error);

// Consultar lista de pacotes de processamento
hunit.packageRead()
  .then(packageList => console.log({ packageList }))
  .catch(console.error);

// Consultar lista de Tipos de Quarto e Tarifa
hunit.roomRateRead()
  .then(roomRateList => console.log({ roomRateList }))
  .catch(console.error);

// Atualizar taxa de ocupação
const occupancyRateList = [
  { date: new Date('2020-01-01'), occupancy: 15 },
  { date: new Date('2020-01-02'), occupancy: 21 },
  { date: new Date('2020-01-03'), occupancy: 13 }
];
hunit.occupancyRateUpdate(occupancyRateList)
  .then(rateUpdateResult => console.log({ rateUpdateResult }))
  .catch(console.error);
```

As requisições abaixo são feitas para consultar reservas e confirmar o recebimento de vários hoteis ao mesmo tempo numa única requisição.

```ts
import { HUnitClient } from 'hunit-js';

const hunit = new HUnitClient({ userName: 'hotel.user', password: 'hotel.password' });

// Consultar reservas novas, alteradas ou canceladas para todos os hotéis
hunit.bookingReadOneCall()
  .then(reservationList => console.log({ reservationList }))
  .catch(console.error);

// Confirmar recebimento de reservas para todos os hotéis
const confirmationListOneCall = [
  { hotelId: '65', reservationId: '12', pmsReservationIdentifier: 'my_id_1' },
  { hotelId: '65', reservationId: '52', pmsReservationIdentifier: 'my_id_2' },
  { hotelId: '77', reservationId: '98', pmsReservationIdentifier: 'my_id_78' }
];
hunit.bookingConfirmationOneCall(confirmationListOneCall)
  .then(confirmeResult => console.log({ confirmeResult }))
  .catch(console.error);
```
