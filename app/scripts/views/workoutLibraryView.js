define(
[
    "underscore",
    "TP",
    "views/libraryWorkoutItemView",
    "models/libraryWorkoutsCollection",
    "hbs!templates/views/workoutLibrary"
],
function(_, TP, LibraryWorkoutItemView, LibraryWorkoutsCollection, workoutLibraryTemplate)
{
    return TP.CompositeView.extend(
    {
        libraryName: 'workoutLibrary',
        tagName: "div",
        className: "workouts",

        getItemView: function(item)
        {
            if (item)
            {
                return LibraryWorkoutItemView;
            } else
            {
                return TP.ItemView;
            }
        },

        initialize: function()
        {
            if (!this.collection)
            {
                this.collection = new LibraryWorkoutsCollection();
            }

        },

        collectionEvents:
        {
            "reset": "render"
        },

        template:
        {
            type: "handlebars",
            template: workoutLibraryTemplate
        }

    });
});