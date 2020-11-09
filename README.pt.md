<p align="center">
  <img src="./doc/logo-hunit.png" alt="Firebase Triggers" width="305"/>
</p>

<p align="center">	
  <a href="https://www.linkedin.com/in/andrebraghinis/">
    <img alt="André Braghini" src="https://img.shields.io/badge/-AndreBraghiniS-798D2A?style=flat&logo=Linkedin&logoColor=white" />
  </a>
  <img alt="Repository size" src="https://img.shields.io/github/repo-size/andrebraghini/hunit-js?color=798D2A">
  <a href="https://github.com/andrebraghini/hunit-js/commits/main">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/andrebraghini/hunit-js?color=798D2A">
  </a>
  <img alt="npm version" src="https://img.shields.io/npm/v/hunit-js?color=798D2A">
  <a href="https://github.com/andrebraghini/hunit-js/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-798D2A">
  </a>

  <br>

  <i>
    Biblioteca de comunicação para o HUnit, Channel Manager da HSystem
  </i>
</p>

<p align="center">
  <a href="README.md">Inglês</a>
  ·
  <a href="https://github.com/andrebraghini/hunit-js/blob/main/README.pt.md">Português</a>
</p>


## Conteúdo

1. [Instalação](#instalação)

2. [Uso](#uso)


## Instalação

```bash
npm install hunit-js --save
```

## Uso

```js
const hunitJs = require('hunit-js');

// Defines authentication credentials. Hotel id, user and password.
let opt = {
    id: 20,
    user: 'hotel.user',
    password: 'hotel.password'
};

hunitJs.getOTAs(opt)
    .then(res => console.log(res.data))
    .catch(e => console.log(e));
```

### Example list

The examples below show the most diverse communications being made to a single hotel in a simple way.

```js
const hunitJs = require('hunit-js');

// Returns instance of communication class with defined credentials
// Used to perform several methods for one hotel
let client = hunitJs.newClient(20, 'hotel.user', 'hotel.password');

// Get OTAs list
client.getOTAs()
    .then(res => console.log(res.data))
    .catch(e => console.log(e));

// Get specific reservation
let reservationId = 21565;
client.getReservation(reservationId)
    .then(res => console.log(res.data))
    .catch(e => console.log(e));

// Get new, changed or canceled reservations
client.getReservations()
    .then(res => console.log(res.data))
     .catch(e => console.log(e));

// Confirm receipt of reservation
client.confirmReservations([123, 124])
    .then(res => console.log(res.data))
    .catch(e => console.log(e));

// Update inventory
let updates = [
    // Remove availability from apartment 12, from 25 to 31 December
    {id: 12, qtd: 0, from: new Date(2018, 11, 25), to: new Date(2018, 11, 31)},
    // Remove availability from apartment 12, during the weekends of January
    {id: 12, qtd: 0, from: new Date(2019, 0, 1), to: new Date(2019, 0, 31), days: {fri: true, sat: true}}
];
client.updateInventory(updates)
    .then(res => console.log(res.data))
    .catch(e => console.log(e));
```
