define(
[
    "underscore",
    "TP",
    "hbs!templates/views/workoutLibrary"
],
function(_, TP, workoutLibraryTemplate)
{
    return TP.ItemView.extend(
    {

        template:
        {
            type: "handlebars",
            template: workoutLibraryTemplate
        },

        collectionEvents:
        {
            "reset": "render"
        }

    });
});