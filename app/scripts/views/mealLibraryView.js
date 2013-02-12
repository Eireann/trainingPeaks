define(
[
    "underscore",
    "TP",
    "hbs!templates/views/mealLibrary"
],
function(_, TP, mealLibraryTemplate)
{
    return TP.ItemView.extend(
    {

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