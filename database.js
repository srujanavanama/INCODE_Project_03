const pgp = require('pg-promise')();
const user = 'postgres'
const password = 'password'
const host = 'localhost'
const pgPort = 5432
const database = 'mrcoffee'
const connection = `postgres://${user}:${password}@${host}:${pgPort}/${database}`

const db = pgp(connection)

module.exports = db