const supertest = require('supertest');
const PgPromise = require("pg-promise")
const express = require('express');
const assert = require('assert');
const fs = require('fs');
require('dotenv').config();

const API = require('../api');
const { default: axios } = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const DATABASE_URL = 'postgres://amanda:@262632@localhost:5432/moviapis_tests';
// const {connectionString} = process.env.DATABASE_URL

const pgp = PgPromise({});
const db = pgp(DATABASE_URL);

API(app, db);

describe('The users API', function () {

	// before(async function () {
	// 	this.timeout(5000);
	// 	await db.none(`delete from users`);
	// 	const commandText = fs.readFileSync('./sql/data.sql', 'utf-8');
	// 	await db.none(commandText)
	// });


	it('should have a test method', async () => {

		const response = await supertest(app)
			.get('/test')
			.expect(200);

		assert.deepStrictEqual({ username: 'amish' }, response.body);

	});

	it('should be able to find 3 registered users', async () => {
		const response = await supertest(app)
			.post('/api/signup')
			.expect(200);

		const users = {
			firstname: 'amanda',
			lastname: 'maarman',
			username: 'amish',
			password: 'ama123',
		}
		assert.equal(1, users.length);

	})

	


	after(() => {
		db.$pool.end();
	});
});