const chai = require('chai');
const chaiHttp = require('chai-http');
const {app, start} = require('../app')


chai.use(chaiHttp);
chai.should();

describe('post/api/v1/auth/login', () =>{
    it('should not login a user without an email', (done) => {
        chai
            .request(app)
            .post('/api/v1/auth/login')
            .send({ password: 'hellothere'})
            .end((err, res) =>{
                res.should.have.status(400);
                res.body.should.be.eql({msg:'Please provide email and password.'});
                done();
            });
    });
    it('should not a login without a password', (done) => {
        chai
            .request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'hello@gmail.com'})
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.eql({msg:'Please provide email and password.'});
                done();
            });
    });

})