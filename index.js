if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}
//npm modules
const express       =   require ('express')
const cors          =   require ('cors')
//my modules
const ctrl          =   require ('./controller')
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
//Run the server
app.listen(port,
    () => console.log(`Express server ready on port: ${port}`))