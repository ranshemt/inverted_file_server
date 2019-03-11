const Doc           = require ('./DataBase/doc')
const Word          = require ('./DataBase/word')
const SW            = require ('./DataBase/stopWords')
const uFuncs        = require ('./utilFuncs')
const fs            = require ('fs').promises
const ML            = require ('./logger')
const FiLe = 'funcs.js'
//
async function handleWord(word, doc){
    let fNaMe = 'handleWod()'
    return new Promise(async (resolve, reject) => {
        let MSG = '', ERR = ''
        //console.log(`handling word: ${word} from doc: ${doc.name} with id: ${doc.id}`)
        ML.log({message: `handling word: ${word} from doc: ${doc.name} with id: ${doc.id}`,
            level: 'debug', src: `${FiLe}/${fNaMe}` })
        //
        let isSW = false
        let wordExists = false
        let wordID = '', word_docs_refs = [], word_docs_hits = []
        if(SW.indexOf(word) !== -1)
                isSW = true
        //
        //check if word exists and get its ID
        try {
            let foundWord = await Word.findOne({word: word})
            if(foundWord){
                wordExists = true
                wordID = foundWord._id
                word_docs_refs = [...foundWord.docs_refs]
                word_docs_hits = [...foundWord.docs_hits]
                MSG += `\nthe word ${word} is in the index with id: ${wordID}`
                ML.log({message: `the word ${word} is in the index with id: ${wordID}`,
                    level: 'debug', src: `${FiLe}/${fNaMe}` })
                MSG += `\nit is: ${JSON.stringify(foundWord)}`
                ML.log({message: `it is: ${JSON.stringify(foundWord)}`,
                    level: 'debug', src: `${FiLe}/${fNaMe}` })
            }
        }
        catch(err) {
            let Serr = uFuncs.stringErr(err)
            ERR += `\nin handleWord for ${word} from doc: ${doc.name} error with findOne`
            ERR += `\n${Serr}`
            ML.log({message: `for ${word} from doc: ${doc.name} error with Word.findOne(): ${Serr}`,
                level: 'error', src: `${FiLe}/${fNaMe}` })
            return reject({
                msg: MSG,
                err: ERR
            })
        }
        //
        //add the word if needed
        if(wordExists === false){
            MSG += `\nthe word ${word} is not in the index and will be added now`
            ML.log({message: `the word ${word} is not in the index and will be added now`,
                    level: 'debug', src: `${FiLe}/${fNaMe}` })
            try{
                const newWord = new Word({
                    isStopWord: isSW,
                    word: word,
                    docs_refs: [],
                    docs_hits: []
                })
                let savedWord = await newWord.save()
                wordID = savedWord._id
                word_docs_refs = [...savedWord.docs_refs]
                word_docs_hits = [...savedWord.docs_hits]
                MSG += `\nthe word ${word} was added to the index with id: ${wordID}`
                ML.log({message: `the word ${word} was added to the index with id: ${wordID}`,
                    level: 'debug', src: `${FiLe}/${fNaMe}` })
            }
            catch(err){
                let Serr = uFuncs.stringErr(err)
                ERR += `\nin handleWord for ${word} from doc: ${doc.name} error with save`
                ERR += `\n${Serr}`
                ML.log({message: `for ${word} from doc: ${doc.name} error with Word.save(): ${Serr}`,
                    level: 'error', src: `${FiLe}/${fNaMe}` })
                return reject({
                    msg: MSG,
                    err: ERR
                })
            }
        }
        //
        //update word info
        let docI = -1
        for(let i = 0; i < word_docs_refs.length; i++){
            if(word_docs_refs[i].localeCompare(doc.name) === 0)
                docI = i
        }
        if(docI !== -1){
            word_docs_hits[docI] = word_docs_hits[docI] + 1
            MSG += `\nfound index for document ${doc.name} in word: ${word} is: ${docI}`
            ML.log({message: `found index for document ${doc.name} in word: ${word} is: ${docI}`,
                level: 'debug', src: `${FiLe}/${fNaMe}` })
        }
        else {
            word_docs_refs.push(doc.name)
            word_docs_hits.push(1)
            MSG += `\nno index found for document ${doc.name} in word: ${word}`
            ML.log({message: `no index found for document ${doc.name} in word: ${word}`,
                level: 'debug', src: `${FiLe}/${fNaMe}` })
        }
        //
        try{
            MSG += `\nupdating DB for word: ${word} with refs: ${word_docs_refs} && hits = ${word_docs_hits}`
            ML.log({message: `updating DB for word: ${word} with refs: ${word_docs_refs} && hits = ${word_docs_hits}`,
                level: 'debug', src: `${FiLe}/${fNaMe}` })
            let updatedWord = await Word.findByIdAndUpdate(wordID,{
                docs_refs: word_docs_refs,
                docs_hits: word_docs_hits
            })
            if(!updatedWord){
                ERR += `\nin ${fNaMe} 404. ${word} not found from Word.findByIdAndUpdate()`
                ML.log({message: `in ${fNaMe} 404. ${word} not found from Word.findByIdAndUpdate()`,
                    level: 'error', src: `${FiLe}/${fNaMe}` })
                return reject({
                    msg: MSG,
                    err: ERR
                })
            }
            else{
                MSG += `\nthe word: ${word} with id: ${wordID} was updated`
                ML.log({message: `the word: ${word} with id: ${wordID} was updated in index`,
                    level: 'debug', src: `${FiLe}/${fNaMe}` })
                MSG += `\nfinished ${fNaMe} for word: ${word} from doc: ${doc.name} with doc.id: ${doc.id}`
                ML.log({message: `finished ${fNaMe} for word: ${word} from doc: ${doc.name} with doc.id: ${doc.id}`,
                    level: 'debug', src: `${FiLe}/${fNaMe}` })
                return resolve({
                    msg: MSG,
                    err: ERR
                })
            }
        }
        catch(err){
            let Serr = uFuncs.stringErr(err)
            ERR += `\nerror from Word.findByIdAndUpdate()`
            ERR += `\n${Serr}`
            ML.log({message: `error from Word.findByIdAndUpdate(${wordID}): ${Serr}`,
                level: 'error', src: `${FiLe}/${fNaMe}` })
            return reject({
                msg: MSG,
                err: ERR
            })
        }
    })
}
//
async function indexDocument(doc){
    let fNaMe = 'indexDocument()'
    return new Promise(async (resolve, reject) => {
        let MSG ='', ERR='', MSGhistory = '', ERRhistory = '', errWords = 0, data
        //console.log(`----\nstarting indexDocument of: ${doc.name}, ${doc.id}`)
        ML.log({message: `starting ${fNaMe} of: ${doc.name}, ${doc.id}`,
            level: 'debug', src: `${FiLe}/${fNaMe}` })
        let path = __dirname + '/public/files/' + doc.name
        //
        //data from file
        try{
            data = await fs.readFile(path, 'utf-8')
            MSG += `\n data read success`
            ML.log({message: `data read finish for file: ${doc.name}`,
                level: 'debug', src: `${FiLe}/${fNaMe}` })
        }
        catch (err){
            let Serr = uFuncs.stringErr(err)
            ERR += `\n${Serr}`
            ML.log({message: `error from fe.readFile(${doc.name}): ${Serr}`,
                level: 'error', src: `${FiLe}/${fNaMe}` })
            //console.log(Serr)
            return reject({
                msg: MSG,
                err: ERR
            })
        }
        //
        //words
        let normalWords = 0, stopWordsCounter = 0
        let cleanStr = data.replace(/[^A-Za-z0-9]/g, ' ')
        cleanStr = cleanStr.toLowerCase()
        let words = cleanStr.split(' ')
        words = words.filter(s => s != '')
        //console.log(words)
        ML.log({message: `words of ${doc.name}: --- ${words}`,
            level: 'debug', src: `${FiLe}/${fNaMe}` })
        //count
        words.forEach(currWord => {
            if(SW.indexOf(currWord) !== -1)
                stopWordsCounter++
            else
                normalWords++
        })
        //
        //handle words
        for(const currWord of words){
            try{
                let promise_handleWord = await handleWord(currWord, doc)
                MSGhistory += promise_handleWord.msg
                ERRhistory += promise_handleWord.err
                MSG += `\n WORD HANDLE SUCCESS ${currWord} for doc: ${doc.name}, doc.id: ${doc.id}`
                ML.log({message: `WORD HANDLE SUCCESS ${currWord} for doc: ${doc.name}, doc.id: ${doc.id}`,
                    level: 'debug', src: `${FiLe}/${fNaMe}` })
            }
            catch(err){
                MSGhistory += err.msg
                ERRhistory += err.err
                ERR += `\n WORD HANDLE FAILURE ${currWord} for doc: ${doc.name}, doc.id: ${doc.id}`
                ML.log({message: `WORD HANDLE FAILURE ${currWord} for doc: ${doc.name}, doc.id: ${doc.id}`,
                    level: 'error', src: `${FiLe}/${fNaMe}` })
                errWords++
            }
        }
        //
        //update document info in DB
        try{
            let updatedDoc = await Doc.findByIdAndUpdate(doc.id, {
                total_words: words.length,
                words: normalWords,
                stopWords: stopWordsCounter//,
                //isIndexed: true
            })
            //
            if(!updatedDoc){
                ERR += `\n404 from findByIdAndUpdate for doc: ${doc.name}, doc.id: ${doc.id}`
                ML.log({message: `in ${fNaMe} 404. ${word} not found from Word.findByIdAndUpdate() for doc: ${doc.name}, doc.id: ${doc.id}`,
                    level: 'error', src: `${FiLe}/${fNaMe}` })
                return reject({
                    msg: MSG,
                    err: ERR,
                    msg_history: MSGhistory,
                    err_history: ERRhistory
                })
            }
            else{
                MSG += `\nfinished indexCodument() for: ${doc.name}`
                ML.log({message: `finished ${fNaMe} for doc: ${doc.name}, doc.id: ${doc.id}`,
                    level: 'debug', src: `${FiLe}/${fNaMe}` })
                ERR += `\ntotal ${errWords} words handles with errors`
                ML.log({message: `total ${errWords} words handles with errors`,
                    level: 'error', src: `${FiLe}/${fNaMe}` })
                return resolve({
                    msg: MSG,
                    err: ERR,
                    msg_history: MSGhistory,
                    err_history: ERRhistory
                })
            }
        }
        catch(err){
            let Serr = uFuncs.stringErr(err)
            ERR += `\ntotal ${errWords} words handles with errors`
            ML.log({message: `total ${errWords} words handles with errors`,
                level: 'error', src: `${FiLe}/${fNaMe}` })
            ERR += `\nERROR: ${Serr}`
            ERR += `\nindexDocument() FAILURE for doc: ${doc.name}`
            ML.log({message: `FAILURE ${fNaMe} for doc: ${doc.name}. : ${Serr}`,
                level: 'error', src: `${FiLe}/${fNaMe}` })
            return reject({
                msg: MSG,
                err: ERR,
                msg_history: MSGhistory,
                err_history: ERRhistory
            })
        }
    })//promise
}
//
//
module.exports = {
    indexDocument,
    handleWord
}