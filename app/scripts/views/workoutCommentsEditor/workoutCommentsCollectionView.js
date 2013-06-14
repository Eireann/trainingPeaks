define(
[
    "TP",
    "./workoutCommentView"
],
function(TP, WorkoutCommentView)
{
    return TP.CollectionView.extend(
    {
        tagName: "div",
        className: "workoutCommentsCollection",
        itemView: WorkoutCommentView
    });
});