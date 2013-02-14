define(
[
    "underscore",
    "TP",
    "views/library/libraryExerciseView",
    "views/library/exerciseLibraryAddView",
    "models/library/libraryExercisesCollection",
    "hbs!templates/views/library/exerciseLibraryView"
],
function(_, TP, LibraryExerciseView, ExerciseLibraryAddView, LibraryExercisesCollection, exerciseLibraryViewTemplate)
{
    return TP.CompositeView.extend(
    {
        libraryName: 'exerciseLibrary',
        tagName: "div",
        className: "exercises",

        getItemView: function(item)
        {
            if (item)
            {
                return LibraryExerciseView;
            } else
            {
                return TP.ItemView;
            }
        },

        initialize: function()
        {
            if (!this.collection)
            {
                this.collection = new LibraryExercisesCollection();
            }

        },

        collectionEvents:
        {
            "reset": "render"
        },

        template:
        {
            type: "handlebars",
            template: exerciseLibraryViewTemplate
        },

        events:
        {
            "click button#add": "addToLibrary"
        },

        addToLibrary: function()
        {
            var view = new ExerciseLibraryAddView({});
            view.render();
        }

    });
});