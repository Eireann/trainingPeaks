define(
[
    "TP",
    "views/quickView/summaryView/workoutCommentView"
],
function(TP, WorkoutCommentView)
{

    return TP.CollectionView.extend(
    {
        tagName: "div",
        className: "workoutCommentsCollection",

        getItemView: function(item)
        {
            return WorkoutCommentView;
        }

    });
});