define(
[
    "underscore",
    "handlebars",
    "TP"
],
function(_, Handlebars, TP)
{

    var getSharedDataByKey = function(obj, key)
    {

        if(key.indexOf(".") >= 0)
        {
            var keyParts = key.split(".");
            _.each(keyParts, function(key)
            {
                obj = getSharedDataByKey(obj, key);
            });
            return obj;
        }
        else
        {
            return obj[key]; 
        }
    };

    var lookupSharedData = function(sharedDataKey, modelValue, defaultValue)
    {
        var sharedDataArray = getSharedDataByKey(TP.sharedData, sharedDataKey);
        if(!defaultValue)
        {
            defaultValue = "";
        }

        if(!_.isArray(sharedDataArray))
        {
            throw new Error("In helpers/lookupSharedData, TP.sharedData." + sharedDataKey + " is not a valid data array");
        }

        var dataValue = _.find(sharedDataArray, function(dataObj)
        {
            return dataObj.data === modelValue;
        });

        return dataValue && dataValue.hasOwnProperty("label") ? dataValue.label : defaultValue;
    };

    Handlebars.registerHelper("lookupSharedData", lookupSharedData);
    return lookupSharedData;
});
