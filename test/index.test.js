const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../index'); // Assuming the main file is named index.js

describe('GET /', () => {
    it('responds with html', (done) => {
        request(app)
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200, done);
    });
    });


