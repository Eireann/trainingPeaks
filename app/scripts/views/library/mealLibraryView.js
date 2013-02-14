define(
[
    "underscore",
    "TP",
    "hbs!templates/views/library/mealLibrary"
],
function(_, TP, mealLibraryTemplate)
{
    return TP.ItemView.extend(
    {

        libraryName: 'mealLibrary',

        template:
        {
            type: "handlebars",
            template: mealLibraryTemplate
        },

        collectionEvents:
        {
            "reset": "render"
        }

    });
});