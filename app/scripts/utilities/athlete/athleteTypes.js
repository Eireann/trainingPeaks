define(
[],
function ()
{
    var athleteTypesByName =
    {
        "Undefined": 0,
        "Swimmer": 1,
        "Runner": 2,
        "Duathlete": 3,
        "Triathlete": 4,
        "Other": 5,
        "Cyclist": 6,
        "MTB": 7,
        "Adventure Racer": 8,
        "Climber": 9,
        "Weight Loss": 10
    };
    
    var getIdByName = function (athleteTypeName)
    {
        return athleteTypesByName.hasOwnProperty(athleteTypeName) ? athleteTypesByName[athleteTypeName] : 0;
    };

    var athleteTypesById = {
        0: "", // Undefined, don't display it
        1: "Swimmer",
        2: "Runner",
        3: "Duathlete",
        4: "Triathlete",
        5: "Other",
        6: "Cyclist",
        7: "MTB",
        8: "Adventure Racer",
        9: "Climber",
        10: "Weight Loss"
    };

    var getNameById = function(athleteTypeId)
    {
        return athleteTypesById.hasOwnProperty(athleteTypeId) ? athleteTypesById[athleteTypeId] : "";
    };

    return {
        getIdByName: getIdByName,
        getNameById: getNameById,
        typesByName: athleteTypesByName,
        typesById: athleteTypesById
    };
});