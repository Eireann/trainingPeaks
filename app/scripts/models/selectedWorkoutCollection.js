define(
[
    "underscore",
    "TP",
    "./commands/deleteWorkouts"
],
function (_, TP, DeleteWorkoutsCommand)
{
    var _deleteWorkouts = function(workouts)
    {
        if (!workouts || !workouts.length)
        {
            return;
        }
        var workoutsAwaitingDelete = [];
        var workoutIds = [];
        _.each(workouts, function(item)
        {
            workoutsAwaitingDelete.push(item);
            workoutIds.push(item.id);
            // trigger a spinner on the workout
            item.trigger('request', item);
        });

        var deleteCommand = new DeleteWorkoutsCommand({ workoutIds: workoutIds });

        deleteCommand.execute().done(
            // removes from all collections and views
            function()
            {
                _.each(workoutsAwaitingDelete, function(item, index)
                {
                    item.trigger('destroy', item, item.collection);
                });
            }
        ).error(
            // turns off throbbers
             function()
             {
                 _.each(workoutsAwaitingDelete, function(item, index)
                 {
                     item.trigger('error', item);
                 });
             }
        );
    };

    return TP.Collection.extend(
    {
        model: TP.Model,

        deleteSelectedWorkouts: function()
        {
            var maxWorkoutsPerBatch = 100;
            var workouts = [];
            this.each(function(item)
            {
                workouts.push(item);
                if(workouts.length >= maxWorkoutsPerBatch)
                {
                    _deleteWorkouts(workouts);
                    workouts = [];
                }
            });
            _deleteWorkouts(workouts);
        }

    });
});