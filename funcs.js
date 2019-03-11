const Doc           = require ('./DataBase/doc')
const Word          = require ('./DataBase/word')
const SW            = require ('./DataBase/stopWords')
const uFuncs        = require ('./utilFuncs')
const fs            = require ('fs').promises
//
async function handleWord(word, doc){
    return new Promise(async (resolve, reject) => {
        let MSG = '', ERR = ''
        console.log(`handling word: ${word} from doc: ${doc.name} with id: ${doc.id}`)
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
                MSG += `\nis it: ${JSON.stringify(foundWord)}`
            }
        }
        catch(err) {
            ERR += `\nin handleWord for ${word} from doc: ${doc.name} error with findOne`
            ERR += `\n${uFuncs.stringErr(err)}`
            return reject({
                msg: MSG,
                err: ERR
            })
        }
        //
        //add the word if needed
        if(wordExists === false){
            MSG += `\nthe word ${word} is not in the index and will be added now`
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
            }
            catch(err){
                ERR += `\nin handleWord for ${word} from doc: ${doc.name} error with save`
                ERR += `\n${uFuncs.stringErr(err)}`
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
        }
        else {
            word_docs_refs.push(doc.name)
            word_docs_hits.push(1)
            MSG += `\nno index found for document ${doc.name} in word: ${word}`
        }
        //
        try{
            MSG += `\nupdating DB for word: ${word} with refs: ${word_docs_refs} && hits = ${word_docs_hits}`
            let updatedWord = await Word.findByIdAndUpdate(wordID,{
                docs_refs: word_docs_refs,
                docs_hits: word_docs_hits
            })
            if(!updatedWord){
                ERR += `\nin handleWord 404. ${word} not found from findByIdAndUpdate`
                return reject({
                    msg: MSG,
                    err: ERR
                })
            }
            else{
                MSG += `\nthe word: ${word} with id: ${wordID} was updated`
                MSG += `\nfinished handleWord(): ${word} from doc: ${doc.name} with doc.id: ${doc.id}`
                return resolve({
                    msg: MSG,
                    err: ERR
                })
            }
        }
        catch(err){
            ERR += `\nerror when updating word info`
            ERR += `\n${uFuncs.stringErr(err)}`
            return reject({
                msg: MSG,
                err: ERR
            })
        }
    })
}
//
async function indexDocument(doc){
    return new Promise(async (resolve, reject) => {
        let MSG ='', ERR='', MSGhistory = '', ERRhistory = '', errWords = 0, data
        console.log(`----\nstarting indexDocument of: ${doc.name}, ${doc.id}`)
        let path = __dirname + '/public/files/' + doc.name
        //
        //data from file
        try{
            data = await fs.readFile(path, 'utf-8')
            MSG += `\n data read success`
        }
        catch (err){
            ERR += `\n${uFuncs.stringErr(err)}`
            console.log(ERR)
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
        console.log(words)
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
            }
            catch(err){
                MSGhistory += err.msg
                ERRhistory += err.err
                ERR += `\n WORD HANDLE FAILURE ${currWord} for doc: ${doc.name}, doc.id: ${doc.id}`
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
                ERR += `\n404 from findByIdAndUpdate for doc: ${doc.name}, doc.id: ${doc.is}`
                return reject({
                    msg: MSG,
                    err: ERR,
                    msg_history: MSGhistory,
                    err_history: ERRhistory
                })
            }
            else{
                MSG += `\nfinished indexCodument() for: ${doc.name}`
                ERR += `\ntotal ${errWords} words handles with errors`
                return resolve({
                    msg: MSG,
                    err: ERR,
                    msg_history: MSGhistory,
                    err_history: ERRhistory
                })
            }
        }
        catch(err){
            ERR += `\ntotal ${errWords} words handles with errors`
            ERR += `\nERROR: ${uFuncs.stringErr(err)}`
            ERR += `\nindexDocument() FAILURE for doc: ${doc.name}`
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