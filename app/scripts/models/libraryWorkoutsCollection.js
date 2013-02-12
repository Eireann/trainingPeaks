define(
[
    "TP",
    "models/libraryWorkout"
],
function(TP, LibraryWorkoutModel)
{
    return TP.Collection.extend(
    {
        model: LibraryWorkoutModel
    });
});