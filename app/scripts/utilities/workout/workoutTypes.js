define(
[],
function ()
{
    var workoutTypesByName =
    {
        "Swim": 1,
        "Bike": 2,
        "Run": 3,
        "Brick": 4,
        "XTrain": 5,
        "Race": 6,
        "Day Off": 7,
        "MountainBike": 8,
        "Strength": 9,
        "Custom": 10,
        "XC-Ski": 11,
        "Rowing": 12,
        "Walk": 13,
        "Other": 100
    };
    
    var getIdByName = function (workoutTypeName)
    {
        return workoutTypesByName.hasOwnProperty(workoutTypeName) ? workoutTypesByName[workoutTypeName] : 0;
    };

    var workoutTypesById =
    {
        1: "Swim",
        2: "Bike",
        3: "Run",
        4: "Brick",
        5: "XTrain",
        6: "Race",
        7: "Day Off",
        8: "Mountain Bike",
        9: "Strength",
        10: "Custom",
        11: "XC-Ski",
        12: "Rowing",
        13: "Walk",
        100: "Other"
    };

    var getNameById = function (workoutTypeId)
    {
        return workoutTypesById.hasOwnProperty(workoutTypeId) ? workoutTypesById[workoutTypeId] : "Unknown";
    };

    return {
        getIdByName: getIdByName,
        getNameById: getNameById,
        typesByName: workoutTypesByName,
        typesById: workoutTypesById
    };
});