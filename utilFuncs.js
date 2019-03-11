//
var isObj = function(variable){
    if(typeof variable === 'object' && !Array.isArray(variable))
        return false
    return true
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
    stringErr
}