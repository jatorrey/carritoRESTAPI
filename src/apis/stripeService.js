require('dotenv').config(); // Asegúrate de tener dotenv configurado
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (total, cartId, userId) => {

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100), 
            currency: 'mxn',
            payment_method_types: ['card'],
            description: `Pago por carrito #${cartId}`,
            metadata: {
                cartId: cartId.toString(),
                userId: userId.toString(),
            },
        });

        return paymentIntent;
    } catch (error) {
        throw new Error("No se pudo procesar el pago.");
    }
};

module.exports = {
    createPaymentIntent,
};
