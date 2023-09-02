const http = require('http');

require('dotenv').config();

const app = require('./app');
const { loadPlanetsData } = require('./models/planets.model');
const { connectMongo } = require('./services/mongo');
const { loadLaunchData } = require('./models/launches.model');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
    await connectMongo();
    await loadPlanetsData();
    await loadLaunchData();
    server.listen(PORT, console.log(`Server Port: ${PORT}`));
}

startServer();