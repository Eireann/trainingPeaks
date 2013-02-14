define(
[
    "TP"
],
function (TP)
{
    return TP.APIModel.extend(
    {

        webAPIModelName: "LibraryExercise",
        idAttribute: "ExerciseId",

        defaults: {
            ExerciseId: null,
            Title: "",
            Sport: ""
        }

    });
});