const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

router.get('/consultarTodos', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/crear', productController.createProduct);
router.put('/actualizar/:id', productController.updateProduct);
router.delete('/eliminar/:id', productController.deleteProduct);

module.exports = router;