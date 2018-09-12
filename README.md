# hunit-js
Communication library for HUnit Channel Manager

## Install

```bash
npm install hunit-ts --save
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

## License

[Apache-2.0](https://spdx.org/licenses/Apache-2.0.html)