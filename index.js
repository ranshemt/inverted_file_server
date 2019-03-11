if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}
//
const ML            =   require ('./logger')
const express       =   require ('express')
const cors          =   require ('cors')
const ctrl          =   require ('./controller')
//
const FiLe = 'index.js'
//Establish app()
const app   =   express()
const port  =   process.env.PORT || 5555
//Middleware(s)
app.use(express.json())
   .use(express.urlencoded({extended: false}))
   .use(express.static(__dirname + '/public'))
   .use(cors())
//
//Routes
app.post('/upload', ctrl.upload)
app.get('/allFiles', ctrl.allFiles)
app.get('/indexFiles', ctrl.indexFiles)
//Run the server
app.listen(port, () => {
    ML.log({message: `Express server ready on port: ${port}`,
        level: 'info', src: `${FiLe}/app.listen` })
})