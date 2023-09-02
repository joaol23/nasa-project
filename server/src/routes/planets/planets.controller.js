const { getAllPlanets } = require("../../models/planets.model");

async function htppGetAllPlanets(req, res) {
    return res.status(200).json(await getAllPlanets());
}

module.exports = {
    htppGetAllPlanets
}