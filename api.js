const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const api = (app, db) => {
    app.get('/test', (req, res) => res.json({ username: 'amish' }))
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

        const user = await db.oneOrNone('select * from users where username = $1', [username])
        
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
                const user_token = jwt.sign({user}, 'secretKey', { expiresIn: '24h' });

                res.json({
                    user:user,
                    message: `Hello ${user.firstname}`,
                    token:user_token
                })

            }
        }

    })

    app.post('/api/playlist', async function (req, res) {
        const { username, movie } = req.body

        // console.log(req.body);
        
        const user = await db.oneOrNone('select * from users where username = $1', [username])

            await db.manyOrNone('insert into favourites (movies,users_id) values ($1, $2)', [movie,user.id]);
        console.log({user, username});
        res.json({
            user:user
        })
    })

    app.get('/api/playlist/:id', async function (req, res){
        const { id } = req.params
        // console.log({id});
        const results = await db.manyOrNone(`select * from favourites WHERE users_id = $1`,[id])

        res.json({
            data:results
        })

    })

    app.delete('/api/playlist/:id', async function (req, res) {

		try {
			const { id } = req.params;
			const results = await db.none(`delete from favourites where id = $1`, [id]);
			// console.log(results);
			res.json({
				status: 'success',
				data: results
			})
		} catch (err) {
			console.log(err);
			res.json({
				status: 'success',
				error: err.stack
			})
		}
	});

}

module.exports = api;