const mongoose = require('mongoose');
const UserModel = require('./user.model');
const ProductModel = require('./product.model');

const CartModel = new mongoose.Schema({
    facturapiId: {
        type: String
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UsuarioFacturapi',  // Asegúrate de que este sea el nombre correcto del modelo 'UserFacturapi'
        required: true
    },
    productos: [{
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductFacturapi', // Nombre del modelo referenciado
            required: true
        },
        nombre: String,
        precio: Number,
        cantidad: {
            type: Number,
            min: 1,
            default: 1
        }
    }],
    subtotal: {
        type: Number,
        default: 0,
        min: 0
    },
    iva: {
        type: Number,
        min: 0,
        default: 0
    },
    total: {
        type: Number,
        min: 0,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    estatus: {
        type: String,
        enum: ['Activo', 'Inactivo'],
        default: 'Activo'
    },
    fechaCierre: {
        type: Date
    }

});

const Cart = mongoose.model('CartFacturapi', CartModel);

module.exports = Cart;