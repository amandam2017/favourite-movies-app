const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const api = (app, db) => {
    app.post('/api/signup', async function(req, res){
        const {firstname, lastname, username, password} = req.body

        let useraccount = await db.oneOrNone('select * from users where username = $1', [username])

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
                    user,
                    message: `Hello ${username}`,
                    data:user_token
                })

            }
        }

    })

    const authanticateToken = (req, res, next) => {
        // inside this function we want to get the token that is generated/sent to us and to verify if this is the correct user.
        const authHeader = req.headers['authorization']
        // console.log({authHeader});
        const token = jwt.sign(user, 'secretKey', { expiresIn: '24h' });
        // if theres no token tell me
        if (token === null) return res.sendStatus(401)
        // if there is then verify if its the correct user using token if not return the error
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, username) => {
            // console.log(err);
            if (err) return res.sendStatus(403)
            console.log('show error' + err);

            req.username = username
            console.log(username);
            next()
        })

    }
    

    app.post('/api/playlist', async function (req, res) {
        const { movies, userid } = req.body


        console.log(req.body);
        // console.log(movies);
        // console.log(userid);

        let user = await db.none('insert into favourites (users_id, movies) values ($1, $2)', [movies,userid]);
        if(user !== null){
            await db.oneOrNone('select * from avourites where users_id = $1', [movies,userid])
            console.log(user);
        }
        // await db.none('UPDATE Favourites SET movies = movies+1 WHERE users_id = $1', [movies]);
        // console.log({user, username});

        res.json({
            data:user
        })
    })

}

module.exports = api;