const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const res = require('express/lib/response');
const saltRounds = 10;

const api = (app, db) => {
    app.post('/api/signup', async function(req, res){
        const {username, password} = req.body

        let useraccount = await db.oneOrNone('select * from users where username = $1', [username])

        await db.oneOrMany('insert into users (firstname, lastname, username, pass) values($1, $2)');

        if(useraccount !== null){
            res.json({
                message: 'User already exist please login with the username',
                status: 401
            })
        }else{
            bcrypt.genSalt(saltRounds, function (err, salt) {
                bcrypt.hash(password, salt, async function (err, hash) {
                    await db.none('insert into love_user (username, pass) values ($1, $2)', [username, hash]);
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

        let user = await db.oneOrNone('select * from love_user where username = $1', [username])
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
                    data:user_token
                })

            }
        }

    })

    // app.get('api/https://api.themoviedb.org/3/search/movie?api_key=85460cdc7e2094cf78adefea46b5950c&query=Avengers:%20Infinity%20War', async function(){

    //     res.json({
    //         data:
    //     })
    // })

}

module.exports = api;