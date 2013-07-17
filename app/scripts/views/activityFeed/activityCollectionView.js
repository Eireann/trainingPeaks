define(
[
    "TP",
    "models/workoutModel",
    "views/workout/workoutBarView",
    "views/dayBarView"
],
function (TP, WorkoutModel, WorkoutBarView, DayBarView)
{
    return TP.CollectionView.extend(
    {
        tagName: "div",
        className: "activityCollection",

        getItemView: function(item)
        {
            if (item instanceof WorkoutModel)
                return WorkoutBarView;
            else if (item.isDay)
                return DayBarView;
            else
                throw "not implemented";
        }
    });
});