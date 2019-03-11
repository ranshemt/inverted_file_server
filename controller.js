const connection    = require ('./DataBase/db')
const formidable    = require ('formidable')
const fs            = require ('fs')
const Doc           = require ('./DataBase/doc')
const funcs         = require ('./funcs')
const Ufuncs        = require ('./utilFuncs')
//
//
var upload = async function(req, res, next){
    console.log('starting POST /upload')
    //new incoming file form and settings
    let form = new formidable.IncomingForm()
    form.encoding = 'utf-8'
    form.uploadDir = '/public/files'
    form.multiples = true
    form.keepExtensions = true
    let filesNames = []
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
        filesNames = files.files.map(currFile => currFile.name)
        // console.log(`err: ${err}`)
        // console.log(`fields: ${fields}`)
    })
    //
    form.on('end', () => {
        let errFiles = []
        //update files in DB
        filesNames.forEach(currName => {
            console.log(`saving doc: ${currName}`)
            Doc.create(
                {
                    isIndexed: false,
                    name: currName,
                    total_words: 0,
                    words: 0,
                    stopWords: 0
                },
                (err, s) => {
                    if(err)
                        errFiles.push(currName)
                }
            )
        })
        //
        console.log('end POST /upload')
        return res.status(200).json({
            files: filesNames,
            errFiles
        })
    })
}
//
//
var allFiles = function(req, res, next){
    let path = __dirname + '/public/files'
    //
    fs.readdir(path, (err, items) => {
        if(err){
            let msg = ''
            if(typeof err === 'object' && !Array.isArray(err))
                msg = JSON.stringify(err)
            else
                msg = err
            return res.status(500).json({msg: err})
        }
        //
        console.log(`files in server: ${items}`)
        return res.status(200).json({
            filesAmount: items.length,
            names: [...items]
        })
    })
}
//
//
var indexFiles = async function(req, res, next){
    //
    //docs to index
    let docsFound = []
    let MSG = '', ERR = '', MSGhistory = '', ERRhistory = ''
    let nestedERR = '', nestedMSG = '' ,docsErrors = 0
    try{
        let queryResult = await Doc.find({isIndexed: false}).exec()
        docsFound = queryResult.map(currDoc => ({id: currDoc._id, name: currDoc.name}))
        MSG += `\ndocs to index: ${JSON.stringify(docsFound)}`
    }
    catch(err){
        ERR += `\nindexFiles ERROR: ${Ufuncs.stringErr(err)}`
        ERR += `\nindexFiles FAILED because of find`
        Ufuncs.printErr(err)
        res.status(500).json({
            msg: MSG,
            err: ERR,
            msg_history: MSGhistory,
            err_history: ERRhistory
        })
    }
    //
    //handle docs
    for(const currDoc of docsFound){
        try{
            let promise_indexDocument = await funcs.indexDocument(currDoc)
            MSGhistory += promise_indexDocument.msg
            ERRhistory += promise_indexDocument.err
            nestedMSG += promise_indexDocument.err_history
            nestedERR += promise_indexDocument.msg_history
            MSG += `\nSUCCESS indexDocument for ${JSON.stringify(currDoc)}`
        }
        catch(err){
            MSGhistory += promise_indexDocument.msg
            ERRhistory += promise_indexDocument.err
            nestedMSG += promise_indexDocument.err_history
            nestedERR += promise_indexDocument.msg_history
            ERR += `\nSUCCESS indexDocument for ${JSON.stringify(currDoc)}`
            docsErrors++
        }
    }
    //
    console.log(`finished indexing all files`)
    ERR += `total docs errors while indexing: ${docsErrors}`
    res.status(200).json({
        msg: MSG,
        err: ERR,
        msg_history: MSGhistory,
        err_history: ERRhistory,
        msg_nested: nestedMSG,
        err_nested: nestedERR
    })
}
//
//
module.exports = {
    upload,
    allFiles,
    indexFiles
}