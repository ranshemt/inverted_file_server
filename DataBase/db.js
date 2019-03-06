//npm modules
const mongoose  = require('mongoose')

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

conn.on('connected', () => console.log('mongoose connected'))
conn.on('error', (err) => console.error(err))

mongoose.connect(MLAB_URL, options)

module.exports = conn