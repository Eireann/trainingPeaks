define(
[
    "underscore",
    "TP",
    "models/workoutModel",
    "shared/models/metricModel",
    "shared/models/activityModel" 
],
function (
          _,
          TP,
          WorkoutModel,
          MetricModel,
          ActivityModel
        )
{

    function getIdsByActivityType(activities)
    {

        var postData = 
        {
            workoutIds: [],
            metricIds: []
        };

        _.each(activities, function(model)
        {
            if(model instanceof MetricModel)
            {
                postData.metricIds.push(model.id);
            }
            else if(model instanceof WorkoutModel)
            {
                postData.workoutIds.push(model.id);
            }
            else
            {
                throw new Error("Invalid model for SelectedActivitiesCollection.deleteActivities: " + JSON.stringify(model.attributes));
            }
        });

        return postData;
    }

    function deleteActivities(activities)
    {
        if (!activities || !activities.length)
        {
            return;
        }

        var unwrappedActivities = _.map(activities, ActivityModel.unwrap);

        var athleteId = unwrappedActivities[0].get("athleteId");

        if(!athleteId)
        {
            athleteId = theMarsApp.user.getCurrentAthleteId();
        }

        var commandUrl = theMarsApp.apiRoot + "/baseactivity/v1/athletes/" + athleteId + "/commands/deleteactivities";

        var postData = getIdsByActivityType(unwrappedActivities);

        var ajaxOptions = 
        {
            url: commandUrl,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(postData)
        };

        var trigger = function(eventName)
        {
            _.each(unwrappedActivities, function(item, index)
            {
                item.trigger(eventName, item);
            });
        };

        Backbone.ajax(ajaxOptions).done(function(){trigger('destroy');}).fail(function(){trigger('error');});

    }

    return TP.Collection.extend(
    {
        deleteSelectedItems: function()
        {
            return deleteActivities(this.models);
        }
    });
});