require('dotenv').config();
const express = require('express');
const { mongoose } = require('./config/database.config');

const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const shoppingcartRoutes = require('./routes/shoppingcart.routes');

const app = express();

app.use(express.json());

app.use('/api/usuarios', userRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/carritos', shoppingcartRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
