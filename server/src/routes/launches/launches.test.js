const request = require('supertest');
const app = require('../../app');
const { connectMongo, disconnectMongo } = require('../../services/mongo');
const { loadPlanetsData } = require('../../models/planets.model');

describe('Launches API', () => {
    beforeAll(async () => {
        await connectMongo();
        await loadPlanetsData();
    });

    afterAll(async () => {
        await disconnectMongo();
    })

    describe("Test GET /launches", () => {
        test('It should respond with 200 success', async () => {
            await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/)
                .expect(200);
        });
    })

    describe('Test POST /launches', () => {
        const launchData = {
            mission: "USS Enterprise",
            rocket: 'NCC 1701-D',
            target: "Kepler-62 f",
            launchDate: 'January 4, 2028'
        };

        const launchDataWithoutDate = {
            mission: "USS Enterprise",
            rocket: 'NCC 1701-D',
            target: "Kepler-62 f"
        };

        const launchDataWithInvalidDate = {
            mission: "USS Enterprise",
            rocket: 'NCC 1701-D',
            target: "Kepler-62 f",
            launchDate: 'Hello'
        };
        test('It should respond with 201 success', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchData)
                .expect('Content-Type', /json/)
                .expect(201);

            const resquestDate = new Date(launchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();

            expect(responseDate).toBe(resquestDate);
            expect(response.body).toMatchObject(launchDataWithoutDate)
        });

        test('It should catch missing required properties', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: "Missing required launch property"
            })
        });

        test('It should catch invalid Date', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: "invalid launch date"
            })
        });
    });
})