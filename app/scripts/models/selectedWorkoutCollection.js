define(
[
    "TP"
],
function (TP)
{
    var WorkoutDeleteModel = TP.Model.extend(
        {
            defaults:
            {
                workoutIdList: null
            },
            
            url: function ()
            {
                var athleteId = theMarsApp.user.get("athletes.0.athleteId");
                return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/workouts/" + this.get("workoutIdList");
            },
            
            isNew: function () { return false; }
        }
    );
    return TP.Collection.extend(
    {
        model: TP.Model,
        
        getWorkoutsList: function()
        {
            var workoutIds = [];
            this.each(function (item, index)
            {
                workoutIds.push(item.id);
            });

            return workoutIds.join(',');
        },
        
        deleteWorkouts: function()
        {
            var deleteModel = new WorkoutDeleteModel({ workoutIdList: this.getWorkoutsList() });

            var trackingList = [];
            this.each(function (item, index)
            {
                trackingList.push(item);
                item.trigger('request', item, item.collection);
            });
            
            deleteModel.destroy({
                success: function()
                {
                    _.each(trackingList, function(item, index)
                    {
                        item.trigger('destroy', item, item.collection);
                    });
                }
            });
        }
    });
});