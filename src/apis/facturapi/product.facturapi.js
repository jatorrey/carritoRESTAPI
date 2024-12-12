const facturapi = require('./connection.facturapi');

async function createProduct(product) {
    const categoryToKey = {
        'Bebidas': '50202300',
        'Lácteos': '50131700',
        'Carnes': '50111500',
        'Frutas': '21102007',
        'Verduras': '50405706',
        'Panadería': '50181900',
        'Dulces': '50181905',
        'Limpieza': '23153207',
        'Higiene': '42151909',
        'Enlatados': '50464803'
    };

    const productKey = categoryToKey[product.category];

    const facturapiProduct = {
        description: product.description,
        product_key: productKey,
        price: product.price,
    };
    return await facturapi.products.create(facturapiProduct);
}

async function updateProduct(facturapiid, product) {
    const categoryToKey = {
        'Bebidas': '50202300',
        'Lácteos': '50131700',
        'Carnes': '50111500',
        'Frutas': '21102007',
        'Verduras': '50405706',
        'Panadería': '50181900',
        'Dulces': '50181905',
        'Limpieza': '23153207',
        'Higiene': '42151909',
        'Enlatados': '50464803'
    };

    const productKey = categoryToKey[product.category];
    
    const facturapiProduct = {
        description: product.description,
        product_key: productKey,
        price: product.price,
    };
    return await facturapi.products.update(facturapiid, facturapiProduct);
}

async function deleteProduct(product) {
    return await facturapi.products.delete(product.facturapiid);
}

module.exports = {
    createProduct
    , updateProduct
    , deleteProduct
};