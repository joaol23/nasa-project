
const mongoose = require('mongoose');

require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
    console.log("mongodb connection open");
})

mongoose.connection.on('error', (err) => {
    console.error(err)
})

async function connectMongo() {
    await mongoose.connect(MONGO_URL);
}

async function disconnectMongo() {
    await mongoose.disconnect();
}

module.exports = { connectMongo, disconnectMongo }