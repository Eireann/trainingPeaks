define(
[
    "TP",
    "views/workout/workoutBarView",
    "views/dayBarView"
],
function (TP, WorkoutBarView, DayBarView)
{
    return TP.CollectionView.extend(
    {
        tagName: "div",
        className: "activityCollection",
        //itemView: WorkoutBarView
        
        getItemView: function(item)
        {
            if (item.isDay)
                return DayBarView;
            else if (item.isWorkout)
                return WorkoutBarView;
            else
                throw "not implemented";
        }
    });
});