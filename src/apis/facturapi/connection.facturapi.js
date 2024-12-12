require('dotenv').config();
const Facturapi = require('facturapi').default;

const facturapi = new Facturapi(
    process.env.FACTURAPI_KEY //Reemplazar este campo por tu propio test_key, consultado en: https://dashboard.facturapi.io/integration/apikeys
);

module.exports = facturapi;