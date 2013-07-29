define(
[],
function ()
{
    var userTypesByName =
    {
        "Undefined": 0,
        "Premium Athlete Paid By Coach": 1,
        "Paid Coach": 2,
        "Not Used": 3, // not used
        "Premium Athlete": 4,
        "Demo Coach": 5,
        "Basic Athlete": 6
    };
    
    var getIdByName = function (userTypeName)
    {
        return userTypesByName.hasOwnProperty(userTypeName) ? userTypesByName[userTypeName] : 0;
    };

    var userTypesById = {
        0: "Undefined", // Undefined, don't display it
        1: "Premium Athlete Paid By Coach",
        2: "Paid Coach",
        3: "Not Used",
        4: "Premium Athlete",
        5: "Demo Coach",
        6: "Basic Athlete"
    };

    var getNameById = function(userTypeId)
    {
        return userTypesById.hasOwnProperty(userTypeId) ? userTypesById[userTypeId] : "";
    };

    return {
        getIdByName: getIdByName,
        getNameById: getNameById,
        typesByName: userTypesByName,
        typesById: userTypesById
    };
});