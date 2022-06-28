const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const api = (app, db) => {
    app.post('/api/signup', async function(req, res){
        const {firstname, lastname, username, password} = req.body

        let useraccount = await db.oneOrNone('select * from users where username = $1', [username])

        // await db.oneOrNone('insert into users (firstname, lastname, username, pass) values($1, $2)');

        if(useraccount !== null){
            res.json({
                message: 'User already exist please login with the username and password',
                status: 401
            })
        }else{
            bcrypt.genSalt(saltRounds, function (err, salt) {
                bcrypt.hash(password, salt, async function (err, hash) {
                    await db.none('insert into users (firstname, lastname, username, pass) values ($1, $2, $3, $4)', [firstname, lastname, username, hash]);
                });
            });

            res.json({
                message: 'You have successfully created your account!',
                data: useraccount
            })
        }
    })

    app.post('/api/login', async function(req, res){
        const {username, password} = req.body

        let user = await db.oneOrNone('select * from users where username = $1', [username])
        if(user == null){
            res.json({
                message: 'Username does not exists, please signup',
                status: 401
            })
        }

        if(user !== null){
            const matchPassword = await bcrypt.compare(password, user.pass);
            if(!matchPassword){
                res.json({
                    message: 'Please enter a correct login details',
                    status: 402
                })
            }else{
                const user_token = jwt.sign(user, 'secretKey', { expiresIn: '24h' });

                res.json({
                    data:user_token,
                    message: `Hello ${username}`
                })

            }
        }

    })

}

module.exports = api;