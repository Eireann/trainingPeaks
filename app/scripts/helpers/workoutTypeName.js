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
        8: "Mountain Bike",
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