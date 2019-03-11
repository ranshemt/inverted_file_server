const {createLogger, format, transports } = require ('winston')
const   fs      =   require ('fs')
const   path    =   require ('path')
//
const env = process.env.NODE_ENV || 'development'
const logDir = 'log'
//
//create log directory if needed
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir)
}
const filename = path.join(logDir, 'results.log')
//
const consoleLevel = 'silly'
//
const logger = createLogger({
    level: env === 'development' ? 'silly' : 'info',
    format: format.combine(
        format.timestamp({
            format: 'DD-MM-YYYY HH:mm:ss'
        }),
        format.align(),
        format.printf(I => 
            `${I.timestamp} ${I.level}\t from: ${I.src}\n> ${I.message}`
        )
    ),
    transports: [
        new transports.Console({
            level: consoleLevel,
            format: format.combine(
                format.colorize(),
                format.printf(I => 
                    `${I.timestamp} ${I.level}\t from: ${I.src}\n> ${I.message}`
                )
            )
        }),
        new transports.File({filename})
    ]
})

module.exports = logger
// error: 0, 
// warn: 1, 
// info: 2, 
// verbose: 3, 
// debug: 4, 
// silly: 5 