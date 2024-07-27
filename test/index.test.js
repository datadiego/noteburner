const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Asegúrate de que esta ruta sea correcta

chai.use(chaiHttp);
const expect = chai.expect;

describe('GET /', () => {
  let server;

  before((done) => {
    server = app.listen(8000, done);
  });

  after((done) => {
    server.close(done);
  });

  it('responds with html', (done) => {
    chai.request(server)
      .get('/')
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res).to.have.header('Content-Type', /html/);
        done();
      });
  });
});