const mongoose = require('mongoose');

const UserModel = new mongoose.Schema({
    facturapiId: {
        type: String
    },
    rfc: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    direccion: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    },
    tel: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        enum: ['ADMIN', 'USER'],
        default: 'USER'
    },
    payMethod: {
        type: String,
        enum: ['CREDIT', 'DEBIT', 'PAYPAL', 'CASH'],
        default: 'CASH'
    }
});

const User = mongoose.model('UsuarioFacturapi', UserModel);

module.exports = User;