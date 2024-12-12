const express = require('express');
const router = express.Router();
const cartController = require('../controllers/shoppingcart.controller');

// Crear un carrito nuevo y asociarlo a un usuario
router.post('/crear', cartController.createCart);

// Obtener un carrito específico por su _id
router.get('/:id', cartController.getCartById);

// Obtener todos los carritos de un usuario por el _id del usuario
router.get('/usuario/:userId', cartController.getCartsByUserId);

// Agregar un producto a un carrito
router.post('/:cartId/producto', cartController.addProductToCart);

// Eliminar un producto del carrito
router.delete('/:cartId/producto', cartController.removeProductFromCart);

// Cerrar un carrito
router.post('/:cartId/cerrar', cartController.closeCart);

module.exports = router;
