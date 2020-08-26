const express = require('express');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt-nodejs');
const redis = require('redis');
const jwt = require('jsonwebtoken');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const signout = require('./controllers/signout');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const auth = require('./controllers/authorization');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const db = knex({
    client: 'pg',
    connection: { 
        connectionString: process.env.DATABASE_URL, 
        ssl: Boolean(process.env.API_CLARIFAI) // uncommenet for production
    }
})

// setup redis
const redisClient = redis.createClient(process.env.REDIS_URL)

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json('its working');
})

app.post('/signin', (req, res) => signin.signinAuthentication(req, res, db, bcrypt, redisClient, jwt));
app.post('/signout', (req, res) => signout.handleSignout(req, res, redisClient));
app.post('/register', (req, res) => register.registerAuthentication(req, res, db, bcrypt, redisClient, jwt)); 
app.get('/profile/:id', (req, res, next) => auth.requireAuth(req, res, redisClient, next), (req, res) => profile.handleProfileGet(req, res, db));
app.post('/profile/:id', (req, res, next) => auth.requireAuth(req, res, redisClient, next), (req, res) => profile.handleProfileUpdate(req, res, db));
app.put('/image', (req, res, next) => auth.requireAuth(req, res, redisClient, next), (req, res) => image.handleImage(req, res, db));
app.post('/imageUrl', (req, res, next) => auth.requireAuth(req, res, redisClient, next), (req, res) => image.handleApiCall(req, res));

app.listen(process.env.PORT || 3000, () => {
    console.log(`app is running on port ${process.env.PORT || '3000'}`);
});