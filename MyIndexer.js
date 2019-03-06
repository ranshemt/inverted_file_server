/** Indexer.js
 * Implementing the Indexer class
 * Suuports:
 * Create Index,
 * Get full index / subindex by location
 * Search Index
 */
//
import SW from './DataBase/stopWords'
//
//
class Indexer {
    constructor(name){
        this.name = name ? name : 'default name'
        this.rawData = []
        this.index = []
        /**index structure
         * {
         *      word1: ['pos1', 'pos2', ... 'posn'],
         *      word2: ['pos1', 'pos2', ... 'posn']
         * }
         * 
         * [
         *      {word1: ['pos1', 'pos2', ... 'posn']},
         *      {word2: ['pos1', 'pos2', ... 'posn']}
         * ]
         *  
         */
    }
}

//Inverted File Data-Structure for searching JSON documents
//contains all words in the document
let invertedFile = 
{
    word1: {
        isStopWord: false,
        word: 'word1',
        in_docs: {
            amount: 2,
            refs: ['link to 1st document', 'link to 2nd document'],
            where_in_docs: [ [{location_obj}] , [{location_obj}]]
                             //where in doc1  , where in doc2
                             //location_obj = 
                             //     { 
                             //         key: 'key_name', 
                             //         i: where_in_sentence
                             //      }
        }
    },
    word2: {
        //...
    }
}
//
/** How to search:
 * 1. get the query                                     //O(1), M(n)
 * 2. lower case it                                     //O(n)
 * 3. clean useless characters                          //O(n)
 * 4. create array of 'clean' words                     //O(n), M(n)
 * 5. for every word in that array:                     //O(n)
 *      if(    invertedFile.hasOwnProperty('currWord')  //O(1)
 *          && invertedFile[currWord].isStopWord        //O(1)
 *        )                                             //
 *          results += invertedFile[currWord]           //O(1)
 * 6. return all results                                //M(n)
 *                                                      //total
 *                                                      //O(n), M(1)
 */
//
/** How to parse JSON document?
 * 1. only JSON files with {key: primitive_value} are allowed!
 * 2. forEach property in JSON file
 *      1. sentence = JSON_file.currProperty
 *      2. arrSentence = makeCleanArr(sentence)
 *      3. for (i = 0; i < arrSentence.length; i++)
 *          1. Another option: always add to InvertedFile ARRAY, then check duplicates and merge
 *          1. currWord = arrSentence[i]
 *          2. If InvertedFile.hasOwnProperty('currWord') === false
 *              1. isSW = isStopWord('currWord')
 *              2. InvertedFile['currWord'] = new Object {isStopWord: isSW}
 *              3. InvertedFile['currWord'].word = 'currWord'
 *              4. InvertedFile['currWord'].in_docs = new Object {amount: 0, refs: [], where_in_docs: []}
 *          3. add information
 *          4. make sure no duplicates and amount of docs is correct
 * 
 */