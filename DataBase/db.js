//npm modules
const mongoose  = require('mongoose')
const ML        = require ('../logger')
//
const FiLe = 'db.js'
//
const MLAB_URL = process.env.MLAB_URL
      DB_USER = process.env.DB_USER
      DB_PASS = process.env.DB_PASS

const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    user: DB_USER,
    pass: DB_PASS
}

const conn = mongoose.createConnection(MLAB_URL, options)

conn.on('connected', () =>
    ML.log({message: `mongoose connected`,
        level: 'info', src: `${FiLe}/conn.on` })
)
conn.on('error', (err) =>
    ML.log({message: `${err}`,
        level: 'error', src: `${FiLe}/conn.on` })
)

mongoose.connect(MLAB_URL, options)

module.exports = conn