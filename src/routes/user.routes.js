const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/consultarTodos', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/crear', userController.createUser);
router.put('/actualizar/:id', userController.updateUser);
router.delete('/eliminar/:id', userController.deleteUser);

module.exports = router;