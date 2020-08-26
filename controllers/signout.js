const delAuthToken = (req, res, redisClient) => {
    const { authorization } = req.headers;
    return redisClient.get(authorization, (err, reply) => {
        if (err || !reply) {
            return res.status(400).json('Wrong token')
        } else {
            return res.json(reply)
        }
    })
}

const handleSignout = (req, res, redisClient) => {
    const { authorization } = req.headers;
    return authorization ? delAuthToken(req, res, redisClient) : Promise.reject('No token sent')
        .then(data => res.json(data))
        .catch(data => res.status(400).json(data))
}

module.exports = {
    handleSignout
}