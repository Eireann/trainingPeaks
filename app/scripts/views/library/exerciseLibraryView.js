define(
[
    "underscore",
    "backbone.marionette",
    "TP",
    "views/library/exerciseLibraryItemView",
    "views/library/exerciseLibraryAddItemView",
    "models/library/libraryExercisesCollection",
    "hbs!templates/views/library/exerciseLibraryView"
],
function(_, Marionette, TP, ExerciseLibraryItemView, ExerciseLibraryAddItemView, LibraryExercisesCollection, exerciseLibraryViewTemplate)
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
                return ExerciseLibraryItemView;
            } else
            {
                return TP.ItemView;
            }
        },

        initialize: function()
        {
            if (!this.collection)
            {
                this.onWaitStart();
                this.collection = new LibraryExercisesCollection();
                Marionette.bindEntityEvents(this, this.collection, this.collectionEvents);
            }

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
            var view = new ExerciseLibraryAddItemView({});
            view.render();
        }

    });


});