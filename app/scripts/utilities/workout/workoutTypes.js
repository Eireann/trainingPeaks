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
        "Crosstrain": 5,
        "Race": 6,
        "Day Off": 7,
        "Mountain Bike": 8,
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
        5: "Crosstrain",
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

    var getNameById = function (workoutTypeId, defaultName)
    {
        defaultName = _.isString(defaultName) ? defaultName : "Unknown";
        return workoutTypesById.hasOwnProperty(workoutTypeId) ? workoutTypesById[workoutTypeId] : defaultName;
    };

    var workoutTypeShortNamesById =
    {
        8: "Mtn Bike"
    };
    
    var getShortNameById = function(workoutTypeId)
    {
        return workoutTypeShortNamesById.hasOwnProperty(workoutTypeId) ? workoutTypeShortNamesById[workoutTypeId] : getNameById(workoutTypeId);
    };
    
    var getListOfNames = function(workoutTypeIds, allWorkoutTypesValue)
    {

        var workoutTypeNames = [];
        var allTypes = allWorkoutTypesValue || "All Workout Types";

        if (!workoutTypeIds || !workoutTypeIds.length || workoutTypeIds.length === _.keys(workoutTypesById).length)
        {
            workoutTypeNames.push(allTypes);
        } else
        {
            _.each(workoutTypeIds, function(item, index)
            {
                var intItem = parseInt(item, 10);
                var workoutType = intItem === 0 ? allTypes : getNameById(intItem);
                if(workoutType !== "Unknown")
                {
                    workoutTypeNames.push(workoutType); 
                }

            }, this);
        }

        var types = workoutTypeNames.join(", ");
        if (!types)
        {
            types = allTypes;
        }
        return types;
    };

    return {
        getIdByName: getIdByName,
        getNameById: getNameById,
        getShortNameById: getShortNameById,
        getListOfNames: getListOfNames,
        typesByName: workoutTypesByName,
        typesById: workoutTypesById
    };
});
