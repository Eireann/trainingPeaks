define(
[
    "TP",
    "hbs!templates/views/workoutCommentsEditor/workoutComments"
],
function(TP, workoutCommentsTemplate)
{
    var CommentItemView = TP.ItemView.extend(
    {
        className: "comment",

        template:
        {
            type: "handlebars",
            template: workoutCommentsTemplate
        }
    });

    return TP.CollectionView.extend(
    {
        className: "workoutComments",
        itemView: CommentItemView
    });
});