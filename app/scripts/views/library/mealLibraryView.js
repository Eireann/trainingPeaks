define(
[
    "underscore",
    "TP",
    "hbs!templates/views/library/mealLibraryView"
],
function(_, TP, mealLibraryViewTemplate)
{
    return TP.ItemView.extend(
    {

        libraryName: 'mealLibrary',

        template:
        {
            type: "handlebars",
            template: mealLibraryViewTemplate
        },

        collectionEvents:
        {
            "reset": "render"
        }

    });
});