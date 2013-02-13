define(
[
    "TP"
],
function (TP)
{
    return TP.APIModel.extend(
    {

        webAPIModelName: "LibraryWorkout",
        idAttribute: "WorkoutId",

        defaults: {
            WorkoutId: null,
            Title: "",
            Description: ""
        }

    });
});