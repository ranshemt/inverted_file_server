const connection    = require ('./DataBase/db')
const formidable    = require ('formidable')
const util          = require ('util')
//
//
var upload = function(req, res, next){
    console.log('starting POST /upload')
    //new incoming file form and settings
    let form = new formidable.IncomingForm()
    form.encoding = 'utf-8'
    form.uploadDir = '/public/files'
    form.multiples = true
    form.keepExtensions = true
    //save to
    form.on('fileBegin', (name, file) => {
        file.path = __dirname + '/public/files/' + file.name
    })
    //
    form.on('progress', (bytesReceived, bytesExcepted) => {
        console.log(`bytesReceived = ${bytesReceived} ... bytesExcepted = ${bytesExcepted}`)
    })
    //
    form.on('error', (err) => {
        console.log(`error occured: ${err}`)
        return res.status(500).json(err)
    })
    //
    form.parse(req, (err, fields, files) => {
        // res.writeHead(200, {'content-type': 'text/plain'});
        // res.write('received upload:\n\n');
        // res.end(util.inspect({fields: fields, files: files}));
        console.log('parsing')
        // console.log(`err: ${err}`)
        // console.log(`fields: ${fields}`)
        // console.log(`files: ${files}`)
    })
    //
    form.on('end', () => {
        console.log('end POST /upload')
        return res.status(200).json({msg: 'success'})
    })
}

module.exports = {
    upload
}