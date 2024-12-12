const Cart = require('../models/shoppingCart.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const { sendCartEmail } = require('../apis/mailService');
const { sendWhatsAppMessage } = require('../apis/twilio');
const { createPaymentIntent } = require('../apis/stripeService');
const { generateCartPdf } = require('../utils/createPDF');
const { createFactura } = require('../apis/facturapi/shoppingcart.facturapi');

// Para formatear la fecha
function obtenerFechaActual() {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    const fecha = new Date();
    return fecha.toLocaleDateString('es-ES', opciones).replace(',', '');
}

// Crear un carrito nuevo y asociarlo a un usuario
const createCart = async (req, res) => {
    try {
        const { usuario } = req.body;

        // Verificar si el usuario existe
        const userExists = await User.findById(usuario);
        if (!userExists) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Crear el carrito
        const newCart = new Cart({ usuario });
        await newCart.save();

        const fullCart = await Cart.findById(newCart._id).populate('usuario');

        res.status(201).json(fullCart);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el carrito', error });
    }
};

// Obtener un carrito específico por su _id
const getCartById = async (req, res) => {
    try {
        const { id } = req.params;
        const cart = await Cart.findById(id).populate('usuario').populate('productos.producto');

        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el carrito', error });
    }
};

// Obtener todos los carritos de un usuario por el _id del usuario
const getCartsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const carts = await Cart.find({ usuario: userId }).populate('productos.producto');

        if (!carts.length) {
            return res.status(404).json({ message: 'No se encontraron carritos para este usuario' });
        }

        res.json(carts);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los carritos', error });
    }
};

// Agregar un producto a un carrito
const addProductToCart = async (req, res) => {
    try {
        const { cartId } = req.params;
        const { productId, cantidad } = req.body;
        const cartDB = await Cart.findById(cartId);
        if (!cartDB) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        const productoExistente = cartDB.productos.find(p => p.producto.equals(productId));
        if (productoExistente) {
            productoExistente.cantidad += cantidad;
        } else {
            cartDB.productos.push({
                producto: product._id,
                cantidad
            });
        }

        await cartDB.save();

        await cartDB.populate('productos.producto');

        const cartFinal = await calculateCartTotals(cartId);

        return res.status(200).json(cartFinal);
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar el producto', error: error.message });
    }
    
};

// Eliminar un producto del carrito
const removeProductFromCart = async (req, res) => {
    try {
        const { cartId } = req.params;
        const { producto } = req.body;

        const cart = await Cart.findById(cartId).populate('productos.producto');
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        // Filtrar los productos del carrito
        cart.productos = cart.productos.filter(item => item.producto._id.toString() !== producto);

        await cart.save();
        res.status(200).json(calculateCartTotals(cartId));
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el producto del carrito', error });
    }
};

// Cerrar un carrito
const closeCart = async (req, res) => {
    const { cartId } = req.params;
    const cartDB = await Cart.findById(cartId).populate('productos.producto').populate('usuario');
    console.log(" ~ CerrandoCarrito ~ carrito:", cartDB);

    // Verificando si el carrito existe
    if (!cartDB) {
        return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    // Actualizando el estado del carrito
    cartDB.estatus = 'Inactivo';
    cartDB.fechaCierre = new Date();

    // Guardando los cambios
    const updatedCart = await cartDB.save();

    // Enviar correo al usuario
    try {

        // Hacer pago con Stripe
        const paymentIntent = await createPaymentIntent(cartDB.total, cartId, cartDB.usuario._id);

        const cartDetails = {
            productos: cartDB.productos,
            subtotal: cartDB.subtotal,
            iva: cartDB.iva,
            total: cartDB.total,
        };

        // Crear el PDF del carrito
        const publicUrl = await generateCartPdf(cartDB.usuario.email, cartDB.usuario.name, cartDetails);

        // Enviar correo al usuario
        await sendCartEmail(cartDB.usuario.email, cartDB.usuario.name, cartDetails, publicUrl);

        // Crear la factura en Facturapi
        const facturaApiPayload = {
            customer: cartDB.usuario.facturapiId, // ID del cliente en Facturapi
            items: cartDB.productos.map(producto => ({
                product: producto.producto.facturapiId, // ID del producto en Facturapi
                quantity: producto.cantidad // Cantidad del producto
            })),
            payment_form: '01',
            use: 'G01'
        };

        // Crear la factura en Facturapi
        const factura = await createFactura(facturaApiPayload);

        // Productos en una cadena de texto en formato de lista desordenada
        const productosString = cartDB.productos.map(item => {
            const producto = item.producto;
            return `- ${producto.name} - ${item.cantidad} x $${producto.price}\n`;
        }).join('');

        const bodyMessage = `Hola,\n\n` +
            `Haz facturado una nueva venta el día ${obtenerFechaActual()}.\n\n` +
            `¡Gracias por tu atención! \n\n` +
            `*Productos:*\n` +
            `${productosString} \n\n` +
            `*Subtotal:* $${cartDB.subtotal}\n` +
            `*IVA:* $${cartDB.iva}\n` +
            `*Total:* $${cartDB.total}\n\n` +
            `Ve tu factura en el siguiente enlace: ${publicUrl}\n\n`;


        // Enviar mensaje de WhatsApp
        await sendWhatsAppMessage("+5213111572896", bodyMessage);

        return res.status(200).json(updatedCart);


    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({ message: 'Error al cerrar el carrito', error: error.message });
    }

    //return res.status(200).json(updatedCart);

};

const calculateCartTotals = async (cartId) => {
    const ivaRate = 0.16; // Tasa de IVA

    // Busca el carrito
    const cart = await Cart.findById(cartId)
        .populate('productos.producto')
        .populate('usuario');

    if (!cart) {
        throw new Error('Carrito no encontrado');
    }

    let subtotal = 0;

    cart.productos.forEach(item => {
        const producto = item.producto;

        if (producto && producto.price && item.cantidad) {
            subtotal += producto.price * item.cantidad;
        } else {
            console.log("Producto sin precio o cantidad no valida:", producto);
        }
    });

    // Calculo del IVA
    const iva = subtotal * ivaRate;
    const total = subtotal + iva;

    // Actualizar el carrito con los valores calculados redondeados a 2 decimales
    cart.subtotal = subtotal.toFixed(2);
    cart.iva = iva.toFixed(2);
    cart.total = total.toFixed(2);

    // Guardar los cambios en la base de datos
    await cart.save();
    console.log("Carro a retornar: ", cart);

    return cart;
}

module.exports = {
    createCart,
    getCartById,
    getCartsByUserId,
    addProductToCart,
    removeProductFromCart,
    closeCart
};
