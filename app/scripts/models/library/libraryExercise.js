define(
[
    "TP"
],
function (TP)
{
    return TP.APIDeepModel.extend(
    {
        cacheable: true,
        webAPIModelName: "ExerciseLibraryItem",
        idAttribute: "exerciseLibraryItemId",

        itemTypeIds: 
        {
            Exercise: 0,
            ExerciseRoutine: 1,
            WorkoutTemplate: 2
        },

        defaults:
        {
            "exerciseLibraryId": 0,
            "exerciseLibraryItemId": 0,
            "itemName": null,
            "itemType": 0,
            "workoutTypeId": 0,
            "distancePlanned": null,
            "totalTimePlanned": null,
            "caloriesPlanned": null,
            "tssPlanned": null,
            "ifPlanned": null,
            "velocityPlanned": null,
            "energyPlanned": null,
            "elevationGainPlanned": null,
            "description": null,
            "exerciseLibraryItemFilters": null
        }
    });
});
