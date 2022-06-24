'use strict';

process.env.SECRET = "TEST_SECRET";

const { sequelize } = require('../src/auth/models/index');
const supertest = require('supertest');
const { app } = require('../src/server.js');

const mockRequest = supertest(app);

let userData = {
  testUser: { username: 'user', password: 'password' },
};
let accessToken = null;

beforeAll(async () => {
  await sequelize.sync();
});


describe('Auth Router', () => {

  it('Can create a new user', async () => {

    const response = await mockRequest.post('/signup').send(userData.testUser);
    const userObject = response.body;

    expect(response.status).toBe(201);
    expect(userObject.username).toEqual(userData.testUser.username);
  });

  it('Can signin with basic auth string', async () => {
    let { username, password } = userData.testUser;

    const response = await mockRequest.post('/signin')
      .auth(username, password);

    const userObject = response.body;
    expect(response.status).toBe(200);
    expect(userObject.token).toBeDefined();
    expect(userObject.username).toEqual(username);
  });

  it('Can signin with bearer auth token', async () => {
    let { username, password } = userData.testUser;
    const response = await mockRequest.post('/signin')
      .auth(username, password);
    // expect(response.status).toBe(200);
    accessToken = response.body.token;
    const bearerResponse = await mockRequest
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(bearerResponse.status).toBe(200);
  });

  it('basic fails with known user and wrong password ', async () => {

    const response = await mockRequest.post('/signin')
      .auth('admin', 'xyz')
    const { user, token } = response.body;

    expect(response.status).toBe(500);
    expect(user).not.toBeDefined();
    expect(token).not.toBeDefined();
  });

  it('basic fails with unknown user', async () => {

    const response = await mockRequest.post('/signin')
      .auth('nobody', 'xyz')
    const { user, token } = response.body;

    expect(response.status).toBe(500);
    expect(user).not.toBeDefined();
    expect(token).not.toBeDefined();
  });


  it('Secret Route fails with invalid token', async () => {
    const response = await mockRequest.get('/secretstuff')
      .set('Authorization', `bearer accessgranted`);

    expect(response.status).toBe(500);
  });
});

afterAll(async () => {
  await sequelize.drop();
});