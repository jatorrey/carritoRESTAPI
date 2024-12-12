const facturapi = require('./connection.facturapi');

async function createUser(user) {
    const facturapiUser = {
        legal_name: user.name,
        tax_id: user.rfc,
        tax_system: '601',
        email: user.email,
        phone: user.tel,
        address: {
            zip: user.zip
        }
    }
    return await facturapi.customers.create(facturapiUser);
}

async function updateUser(facturapiid, user) {
    const facturapiUser = {
        legal_name: user.name,
        tax_id: user.rfc,
        tax_system: '603',
        email: user.email,
        address: {
            zip: user.zip
        }
    }
    return await facturapi.customers.update(facturapiid, facturapiUser);
}

async function deleteUser(user) {
    return await facturapi.customers.delete(user.facturapiid);
}

module.exports = {
    createUser
    , updateUser
    , deleteUser
};