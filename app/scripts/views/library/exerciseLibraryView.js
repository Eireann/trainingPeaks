define(
[
    "underscore",
    "backbone.marionette",
    "TP",
    "views/library/exerciseLibraryItemView",
    "views/library/exerciseLibraryAddItemView",
    "hbs!templates/views/library/exerciseLibraryView"
],
function(_, Marionette, TP, ExerciseLibraryItemView, ExerciseLibraryAddItemView, exerciseLibraryViewTemplate)
{
    return TP.CompositeView.extend(
    {
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