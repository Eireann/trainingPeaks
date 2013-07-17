define(
[
    "TP",
    "views/workout/workoutBarView"
],
function (TP, WorkoutBarView)
{
    return TP.CollectionView.extend(
    {
        tagName: "div",
        className: "activityCollection",
        itemView: WorkoutBarView
    });
});