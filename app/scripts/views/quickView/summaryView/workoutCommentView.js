define(
[
    "TP",
    "hbs!templates/views/quickView/workoutComments"
],
function(TP, WorkoutCommentsTemplate)
{
    return TP.ItemView.extend(
    {
        showThrobbers: false,
        tagName: "div",
        className: "comment",

        template:
        {
            type: "handlebars",
            template: WorkoutCommentsTemplate
        }
    });
});