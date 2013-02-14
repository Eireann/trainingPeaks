define(
[
    "TP"
],
function (TP)
{
    return TP.APIModel.extend(
    {

        webAPIModelName: "ExerciseLibraryItem",
        idAttribute: "ExerciseLibraryItemId",

        defaults: {
            "ExerciseLibraryId": 0,
            "ExerciseLibraryItemId": 0,
            "ItemName": null,
            "ItemType": 0,
            "WorkoutTypeId": 0
        }

    });
});