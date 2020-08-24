const { response } = require("express");

const handleProfileGet = (req, res, db) => {
    const { id } = req.params;
    db.select('*').from('users').where({id})
        .then(user => {
            if (user.length) {
                res.json(user[0]);
            } else {
                res.status(400).json('Not found');
            }
        })
        .catch(err => res.status(400).json('Error getting user'));
}

const handleProfileUpdate = (req, res, db) => {
    const { id } = req.params;
    const { name, avatar } = req.body.formInput;
    db('users')
        .where({ id })
        .update({ name, avatar })
        .then(response => {
            if(response) {
                res.status(200).json('Success');
            } else {
                res.status(400).json('Unable to update');
            }
        })
        .catch(err => res.status(400).json('Error updating user'));
}

module.exports = {
    handleProfileGet,
    handleProfileUpdate
}