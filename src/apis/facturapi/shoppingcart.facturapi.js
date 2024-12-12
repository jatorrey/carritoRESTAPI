const facturapi = require('./connection.facturapi');

async function createFactura(factura) {
    return await facturapi.invoices.create(factura);
}

module.exports = { createFactura };