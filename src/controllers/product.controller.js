const Producto = require('../models/product.model');
const facturapi = require('../apis/facturapi/product.facturapi')

const getAllProducts = async (req, res) => {
    try {
        const products = await Producto.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getProductById = async (req, res) => {
    try {
        const product = await Producto.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createProduct = async (req, res) => {
    try {
        const product = new Producto(req.body);
        const facturapiProduct = await facturapi.createProduct(product);
        product.facturapiId = facturapiProduct.id;
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateProduct = async (req, res) => {
    try {
        const product = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        facturapi.updateProduct(product.facturapiId, product);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const product = await Producto.findByIdAndDelete(req.params.id);
        facturapi.deleteProduct(product.facturapiId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllProducts
    , getProductById
    , createProduct
    , updateProduct
    , deleteProduct
};