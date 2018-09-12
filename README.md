# hunit-js
Communication library for HUnit Channel Manager

## Install

```bash
npm install hunit-js --save
```

## Usage

```js
const hunit = require('hunit-js');

// Defines authentication credentials. Hotel id, user and password.
let opt = {
    id: 20,
    user: 'hotel.user',
    password: 'hotel.password'
};

hunit.getOTAs(opt)
    .then(xml => console.log(xml))
    .catch(e => console.log(e));
```

### Example list

The examples below show the most diverse communications being made to a single hotel in a simple way.

```js
const hunit = require('hunit-js');

// Returns instance of communication class with defined credentials
// Used to perform several methods for one hotel
let client = hunit.newClient(20, 'hotel.user', 'hotel.password');

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

## License

[Apache-2.0](https://spdx.org/licenses/Apache-2.0.html)