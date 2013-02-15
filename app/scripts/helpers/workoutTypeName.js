define(
[
    "handlebars"
],
function(Handlebars)
{


    var workoutTypes = {
        1: "Swim",
        2: "Bike",
        3: "Run",
        4: "Brick",
        5: "X-Train",
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

    var workoutTypeName = function(workoutTypeId)
    {

        return workoutTypes.hasOwnProperty(workoutTypeId) ? workoutTypes[workoutTypeId] : "Unknown";
    };

    Handlebars.registerHelper("workoutTypeName", workoutTypeName);
    return workoutTypeName;
});