const handleSignin = (req, res, db, bcrypt) => {
    const { email, password} = req.body;
    if (!email || !password) {
        return Promise.reject('Incorrect form submission');
    }
    return db.select('email', 'hash').from('login')
        .where('email', '=', email)
        .then(data => {
            const isValid = bcrypt.compareSync(password, data[0].hash);
            if (isValid) {
                return db.select('*').from('users')
                    .where('email', '=', email)
                    .then(user => user[0])
                    .catch(err => Promise.reject('Unable to get user'))
            } else {
                Promise.reject("Wrong credentials")
            }
        })
        .catch(err => Promise.reject('Wrong credentials'))
}

const signToken = (email, jwt) => {
    const jwtPayload = { email };
    return jwt.sign(jwtPayload, process.env.JWT_SECRET || 'JWT_SECRET', {expiresIn: '2 days'})
}

const setToken = (token, id, redisClient) => {
    return Promise.resolve(redisClient.set(token, id));
}

const createSessions = (user, redisClient, jwt) => {
    // JWT token and return user data
    const { email, id } = user;
    const token = signToken(email, jwt);
    return setToken(token, id, redisClient)
        .then(() => {
            return {
                'success': 'true',
                'userId': id,
                token
            }
        })
        .catch(console.log)
}

const getAuthTokenId = (req, res, redisClient) => {
    const { authorization } = req.headers;
    return redisClient.get(authorization, (err, reply) => {
        if (err || !reply) {
            return res.status(400).json('Unauthorized')
        } else {
            return res.json({id: reply})
        }
    })
}

const signinAuthentication = (req, res, db, bcrypt, redisClient, jwt) => {
    const { authorization } = req.headers;
    return authorization ? getAuthTokenId(req, res, redisClient) 
    : handleSignin(req, res, db, bcrypt)
        .then(data => {
            return data.id && data.email ? createSessions(data, redisClient, jwt) : Promise.reject(data);
        })
        .then(session => res.json(session))
        .catch(err => res.status(400).json(err));
}

module.exports = {
    signinAuthentication,
    createSessions,
    setToken,
    signToken
}