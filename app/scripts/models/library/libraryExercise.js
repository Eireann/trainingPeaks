define(
[
    "TP"
],
function (TP)
{
    return TP.APIModel.extend(
    {

        webAPIModelName: "ExerciseLibraryItem",
        idAttribute: "exerciseLibraryItemId",

        defaults: {
            "exerciseLibraryId": 0,
            "exerciseLibraryItemId": 0,
            "itemName": null,
            "itemType": 0,
            "workoutTypeId": 0
        }

    });
});