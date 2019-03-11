const connection    = require ('./DataBase/db')
const formidable    = require ('formidable')
const fs            = require ('fs')
const Doc           = require ('./DataBase/doc')
const funcs         = require ('./funcs')
const Ufuncs        = require ('./utilFuncs')
const ML            = require ('./logger')
const FiLe = 'controller.js'
//
//
var upload = async function(req, res, next){
    let fNaMe = 'POST/upload'
    ML.log({message: `starting ${fNaMe}`,
        level: 'debug', src: `${FiLe}/${fNaMe}` })
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
        ML.log({message: `bytesReceived = ${bytesReceived} ... bytesExcepted = ${bytesExcepted}`,
            level: 'debug', src: `${FiLe}/${fNaMe}` })
    })
    //
    form.on('error', (err) => {
        let Serr = Ufuncs.stringErr(err)
        ML.log({message: `${Serr}`,
            level: 'error', src: `${FiLe}/${fNaMe}` })
        return res.status(500).json({
            msg: '',
            err: Serr
        })
    })
    //
    form.parse(req, (err, fields, files) => {
        // res.writeHead(200, {'content-type': 'text/plain'});
        // res.write('received upload:\n\n');
        // res.end(util.inspect({fields: fields, files: files}));
        ML.log({message: `parsing`,
            level: 'debug', src: `${FiLe}/${fNaMe}/form.parse` })
        filesNames = files.files.map(currFile => currFile.name)
        // console.log(`err: ${err}`)
        // console.log(`fields: ${fields}`)
    })
    //
    form.on('end', () => {
        let errFiles = []
        //update files in DB
        filesNames.forEach(currName => {
            ML.log({message: `saving doc: ${currName}`,
                level: 'debug', src: `${FiLe}/${fNaMe}/form.on('end')` })
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
        ML.log({message: `starting ${fNaMe}`,
                level: 'debug', src: `${FiLe}/${fNaMe}` })
        return res.status(200).json({
            files: filesNames,
            errFiles
        })
    })
}
//
//
var allFiles = function(req, res, next){
    let fNaMe = 'GET/allFiles'
    let path = __dirname + '/public/files'
    //
    fs.readdir(path, (err, items) => {
        if(err){
            let Serr = Ufuncs.stringErr(err)
            return res.status(500).json({
                msg: '',
                err: Serr
            })
        }
        //
        ML.log({message: `files in server: ${items}`,
                level: 'debug', src: `${FiLe}/${fNaMe}` })
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
    let fNaMe = 'GET/indexFiles'
    let docsFound = []
    let MSG = '', ERR = '', MSGhistory = '', ERRhistory = ''
    let nestedERR = '', nestedMSG = '' ,docsErrors = 0
    try{
        let queryResult = await Doc.find({isIndexed: false}).exec()
        docsFound = queryResult.map(currDoc => ({id: currDoc._id, name: currDoc.name}))
        MSG += `\ndocs to index: ${JSON.stringify(docsFound)}`
        ML.log({message: `docs to index: ${JSON.stringify(docsFound)}`,
                level: 'debug', src: `${FiLe}/${fNaMe}` })
    }
    catch(err){
        let Serr = Ufuncs.stringErr(err)
        ERR += `\nindexFiles ERROR: ${Serr}`
        ERR += `\nindexFiles FAILED because of Doc.find()`
        ML.log({message: `${fNaMe} FAILED because of Doc.find(): ${Serr}`,
                level: 'error', src: `${FiLe}/${fNaMe}` })
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
            MSG += `\nSUCCESS indexDocument() for ${JSON.stringify(currDoc)}`
            ML.log({message: `SUCCESS indexDocument() for ${JSON.stringify(currDoc)}`,
                level: 'debug', src: `${FiLe}/${fNaMe}` })
        }
        catch(err){
            MSGhistory += promise_indexDocument.msg
            ERRhistory += promise_indexDocument.err
            nestedMSG += promise_indexDocument.err_history
            nestedERR += promise_indexDocument.msg_history
            ERR += `\nFAILURE indexDocument() for ${JSON.stringify(currDoc)}`
            ML.log({message: `FAILURE indexDocument() for ${JSON.stringify(currDoc)}`,
                level: 'error', src: `${FiLe}/${fNaMe}` })
            docsErrors++
        }
    }
    //
    //console.log(`finished indexing all files`)
    ML.log({message: `finished indexing all files`,
                level: 'debug', src: `${FiLe}/${fNaMe}` })
    ERR += `\ntotal docs errors while indexing: ${docsErrors}`
    ML.log({message: `total docs errors while indexing: ${docsErrors}`,
                level: 'error', src: `${FiLe}/${fNaMe}` })
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