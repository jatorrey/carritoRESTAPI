const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Database connected');
}).catch((error) => {
    console.error('Error connecting to database:', error);
});

module.exports = mongoose;