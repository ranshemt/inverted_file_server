//
var isObj = function(variable){
    if(typeof variable === 'object' && !Array.isArray(variable))
        return false
    return true
}
//
var printErr = function(err){
    if(isObj(err))
        console.log(`err: ${JSON.stringify(err)}`)
    else
        console.log(`err: ${err}`)
}
//
var stringErr = function(err){
    if(isObj(err))
        return JSON.stringify(err)
    else
        return err
}
module.exports = {
    isObj,
    printErr,
    stringErr
}