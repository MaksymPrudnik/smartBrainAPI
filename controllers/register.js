const createSession = require('./signin').createSessions;

const handleRegister = (req, res, db, bcrypt) => {
    const {email, name, password} = req.body;
    if (!email || !name || !password) {
        return Promise.reject('Incorrect form submission');
    }
    const hash = bcrypt.hashSync(password);
    return db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginemail => {
            return trx('users')
                .returning('*')
                .insert({
                    email: loginemail[0],
                    name: name,
                    joined: new Date()
                })
                .then(user => user[0])
                .catch(err => Promise.reject('Unable to register'))
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => Promise.reject('Unable to register'));
}

const registerAuthentication = (req, res, db, bcrypt, redisClient, jwt) => {
    return handleRegister(req, res, db, bcrypt)
        .then(data => {
            return data.id && data.email ? createSession(data, redisClient, jwt) : Promise.reject(data);
        })
        .then(session => res.json(session))
        .catch(err => res.status(400).json(err));
}

module.exports = {
    registerAuthentication
}