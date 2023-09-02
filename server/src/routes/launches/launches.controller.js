const { getAllLaunches, scheduleNewLaunch, existsLaunchWithId, abortLaunchById } = require("../../models/launches.model");
const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
    const {skip, limit} = getPagination(req.query);
    return res.status(200).json(await getAllLaunches(skip, limit));
}

async function httpAddNewLaunch(req, res) {
    let launchData = req.body;
    if (!launchData.mission || !launchData.rocket || !launchData.launchDate || !launchData.target) {
        return res.status(400).json({
            error: "Missing required launch property"
        });
    }

    launchData.launchDate = new Date(launchData.launchDate);
    if (isNaN(launchData.launchDate)) {
        return res.status(400).json({
            error: "invalid launch date"
        })
    }

    await scheduleNewLaunch(launchData);
    return res.status(201).json(launchData);
}

async function httpAbortLaunch(req, res) {
    const launchId = Number(req.params.id);

    if (!(await existsLaunchWithId(launchId))) {
        return res.status(404).json({
            error: "Launch not found"
        })
    }

    const abortedLaunch = await abortLaunchById(launchId);
    if (!abortedLaunch) {
        return res.status(404).json({
            error: "Launch not aborted"
        })
    }
    return res.status(200).json(abortedLaunch);
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
}