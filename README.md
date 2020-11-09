<p align="center">
  <img src="./doc/logo-hunit.png" alt="Firebase Triggers" width="305"/>
</p>

<p align="center">	
  <a href="https://www.linkedin.com/in/andrebraghinis/">
    <img alt="André Braghini" src="https://img.shields.io/badge/-AndreBraghiniS-798D2A?style=flat&logo=Linkedin&logoColor=white" />
  </a>
  <img alt="Repository size" src="https://img.shields.io/github/repo-size/andrebraghini/hunit-js?color=798D2A">
  <a href="https://github.com/andrebraghini/hunit-js/commits/master">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/andrebraghini/hunit-js?color=798D2A">
  </a>
  <a href="https://www.npmjs.com/package/hunit-js">
    <img alt="npm version" src="https://img.shields.io/npm/v/hunit-js?color=798D2A">
  </a>
  <a href="https://github.com/andrebraghini/hunit-js/blob/master/LICENSE">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-798D2A">
  </a>

  <br>

  <i>
    Communication library for HUnit, HSystem Channel Manager
  </i>
</p>

<p align="center">
  <a href="README.md">English</a>
  ·
  <a href="https://github.com/andrebraghini/hunit-js/blob/master/README.pt.md">Portuguese</a>
</p>


## Content

1. [Installation](#installation)

2. [Usage](#usage)


## Installation

```bash
npm install hunit-js --save
```

## Usage

```ts
import { HUnitClient } from 'hunit-js';

// Defines authentication credentials. Hotel id, user and password.
const credentials = {
  hotelId: '20',
  userName: 'hotel.user',
  password: 'hotel.password'
};

// Instantiate the client
const hunit = new HUnitClient(credentials);

// Do request
hunit.portalRead()
  .then(console.log)
  .catch(console.error);
```

### Example list

The examples below show the most diverse communications being made to a single hotel in a simple way.

```ts
import { HUnitClient } from 'hunit-js';

const hunit = new HUnitClient({ hotelId: '20', userName: 'hotel.user', password: 'hotel.password' });

// Get OTAs list
hunit.portalRead()
  .then(portalList => console.log({ portalList }))
  .catch(console.error);

// Get new, changed or canceled reservations
hunit.bookingRead()
  .then(reservationList => console.log({ reservationList }))
  .catch(console.error);

// Get specific reservation by HUnit ID
hunit.bookingByIdRead({ locatorId: '21565' })
  .then(reservation => console.log({ reservation }))
  .catch(console.error);

// Get specific reservation by Portal ID
hunit.bookingByIdRead({ portalId: '1', channelReservationId: '155511' })
  .then(reservation => console.log({ reservation }))
  .catch(console.error);

// Confirm receipt of reservation
const confirmationList = [
  { reservationId: '12', pmsReservationIdentifier: 'my_id_1' },
  { reservationId: '52', pmsReservationIdentifier: 'my_id_2' },
  { reservationId: '589', pmsReservationIdentifier: 'my_id_5' }
];
hunit.confirmePost(confirmationList)
  .then(confirmeResult => console.log({ confirmeResult }))
  .catch(console.error);

// Update inventory
const updates = [
  // Remove availability from apartment 12, from December 25 to December 31
  // if you do not enter the day of the week in the "dateRange" tag, all days will be considered
  {
    roomTypeId: '12',
    availability: 0,
    dateRange: { from: new Date('2021-12-25'), to: new Date('2021-12-31') }
  },
  // Remove availability from apartment 12, during the weekends of January
  {
    roomTypeId: '12',
    availability: 0,
    dateRange: { from: new Date('2021-01-01'), to: new Date('2021-01-31'), fri: true, sat: true }
  },
  // Close availability from apartment 222 sending a sell stop
  {
    roomTypeId: '222',
    dateRange: { from: new Date('2021-12-25'), to: new Date('2021-12-31') },
    stopSell: true
  },
  // Open availability from apartment 15 canceling a sell stop
  {
    roomTypeId: '15',
    dateRange: { from: new Date('2021-12-25'), to: new Date('2021-12-31') },
    stopSell: false
  }
];
hunit.availabilityUpdate(updates)
  .then(availabilityUpdateResult => console.log({ availabilityUpdateResult }))
  .catch(console.error);

// Get packages list
hunit.packageRead()
  .then(packageList => console.log({ packageList }))
  .catch(console.error);

// Get room rate list
hunit.roomRateRead()
  .then(roomRateList => console.log({ roomRateList }))
  .catch(console.error);

// Update occupancy rate
const occupancyRateList = [
  { date: new Date('2020-01-01'), occupancy: 15 },
  { date: new Date('2020-01-02'), occupancy: 21 },
  { date: new Date('2020-01-03'), occupancy: 13 }
];
hunit.occupancyRateUpdate(occupancyRateList)
  .then(rateUpdateResult => console.log({ rateUpdateResult }))
  .catch(console.error);
```

The requests below are made to get reservations and confirm the receipt of several hotels at the same time in a single request.

```ts
import { HUnitClient } from 'hunit-js';

const hunit = new HUnitClient({ userName: 'hotel.user', password: 'hotel.password' });

// Get new, changed or canceled reservations for all hotels
hunit.bookingReadOneCall()
  .then(reservationList => console.log({ reservationList }))
  .catch(console.error);

// Confirm receipt of reservation for all hotels
const confirmationListOneCall = [
  { hotelId: '65', reservationId: '12', pmsReservationIdentifier: 'my_id_1' },
  { hotelId: '65', reservationId: '52', pmsReservationIdentifier: 'my_id_2' },
  { hotelId: '77', reservationId: '98', pmsReservationIdentifier: 'my_id_78' }
];
hunit.bookingConfirmationOneCall(confirmationListOneCall)
  .then(confirmeResult => console.log({ confirmeResult }))
  .catch(console.error);
```
