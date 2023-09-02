const axios = require('axios');
const launches = require('./launches.mongo')
const planets = require('./planets.mongo');
const launchesMongo = require('./launches.mongo');

const DEFAULT_FLIGHT_NUMBER = 1;

async function existsLaunchWithId(launchId) {
    return await launches.findOne({ flightNumber: launchId })
}

async function getLatestFlightNumber() {
    const latestLaunch = await launches
        .findOne()
        .sort('-flightNumber');
    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
    return await launches.find({}, {
        "__v": 0,
        "_id": 0
    })
        .sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit);
}

async function saveLaunch(launch) {
    await launches.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    });
}

async function scheduleNewLaunch(launch) {
    const newLaunch = Object.assign(launch, {
        flightNumber: (await getLatestFlightNumber()) + 1,
        success: true,
        upcoming: true,
        customers: ['ZTM']
    })

    if (!(await planets.findOne({ keplerName: newLaunch.target }))) {
        throw new Error('Planet not found');
    }
    await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
    return await launches.findOneAndUpdate({
        flightNumber: launchId
    }, {
        upcoming: false,
        success: false,
    })
}

const SPACEX_API_URL = "https://api.spacexdata.com/v5/launches/query"

async function findLaunch(filter) {
    return await launchesMongo.findOne(filter);
}

async function populateLaunches() {
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        'name': 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    })

    if (response.status !== 200) {
        console.log("problem downloading lunch data");
        throw new Error("problem downloading lunch data");
    }
    const launchDocs = response.data.docs;
    launchDocs.forEach(async (launchDoc) => {
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers: launchDoc['payloads'].flatMap(payload => payload['customers'])
        }
        await saveLaunch(launch);

    });
}

async function loadLaunchData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1'
    });
    if (firstLaunch) {
        console.log("Launch data already loaded");
        return;
    }
    await populateLaunches();
}

module.exports = {
    getAllLaunches,
    scheduleNewLaunch,
    loadLaunchData,
    existsLaunchWithId,
    abortLaunchById
}