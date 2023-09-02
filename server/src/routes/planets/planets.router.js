const express = require('express');
const { htppGetAllPlanets } = require('./planets.controller');

const planetsRouter = express.Router();

planetsRouter.get('/', htppGetAllPlanets)


module.exports = planetsRouter