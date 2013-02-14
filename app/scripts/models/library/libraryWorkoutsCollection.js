define(
[
    "TP",
    "models/library/libraryWorkout"
],
function(TP, LibraryWorkoutModel)
{
    return TP.Collection.extend(
    {
        model: LibraryWorkoutModel,

        url: function()
        {
            //return theMarsApp.apiRoot + "/WebApiServer/WorkoutsLibrary";
            return "workoutsLibrary.json";
        },
        
        initialize: function()
        {
            this.fetch();
        }
    });
});