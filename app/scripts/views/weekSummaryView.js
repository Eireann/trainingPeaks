define(
[
    "TP",
    "utilities/workoutTypeEnum",
    "hbs!templates/views/weekSummary"
],
function(TP, workoutTypeEnum, weekSummaryTemplate)
{
    return TP.ItemView.extend(
    {
        tagName: "div",
        className: "weekSummary",

        template:
        {
            type: "handlebars",
            template: weekSummaryTemplate
        },

        initialize: function()
        {
            if (!this.model || !this.model.collection)
                throw "WeekSummaryView requires a WeekSummaryModel which in turn needs to be inside a WeekCollection";

            theMarsApp.user.on("change", this.render, this);
            
            var self = this;
            this.model.collection.each(function(item)
            {
                if (item.itemsCollection)
                {
                    item.itemsCollection.on("change", self.render, this);
                    item.itemsCollection.on("add", self.render, this);
                    item.itemsCollection.on("remove", self.render, this);
                }
            });
        },

        onBeforeRender: function()
        {
            var totalTimeCompleted = 0;
            var totalTimePlanned = 0;
            var completedValues =
            {
                totalTime: 0,
                distanceByWorkoutType: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
                durationByWorkoutType: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
                cumulativeTss: 0
            };
            var plannedValues =
            {
                totalTime: 0,
                distanceByWorkoutType: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
                durationByWorkoutType: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
                cumulativeTss: 0
            };
            
            //iterate over calendarDayModels for the current week (associated with this weekSummaryView)
            this.model.collection.each(function(item)
            {
                //exclude if item is a weekSummaryModel instead of calendarDayModel 
                if (!item.itemsCollection)
                    return;
                
                //iterate over items (workouts, meals, metrics) for the current day
                item.itemsCollection.each(function(workout)
                {
                    if (workout.has("totalTime") && workout.get("totalTime") !== null)
                        totalTimeCompleted += workout.get("totalTime");
  
                    if (workout.has("totalTimePlanned") && workout.get("totalTimePlanned") !== null)
                        totalTimePlanned += workout.get("totalTimePlanned");

                    if (workout.has("tssPlanned") && workout.get("tssPlanned") !== null)
                        plannedValues.cumulativeTss += workout.get("tssPlanned");

                    if (workout.has("tssActual") && workout.get("tssActual") !== null)
                        completedValues.cumulativeTss += workout.get("tssActual");
                    
                    var workoutType = workout.get("workoutTypeValueId");

                    // Always aggregate total time independently of workoutType
                    // Only aggregate specifics for Swim, Bike, Run, Strength
                    if (!workoutType ||
                        workoutType !== workoutTypeEnum["Swim"] ||
                        workoutType !== workoutTypeEnum["Bike"] ||
                        workoutType !== workoutTypeEnum["Run"] ||
                        workoutType !== workoutTypeEnum["Strength"])
                        return;

                    if (workout.has("distance") && workout.get("distance") !== null)
                        completedValues.distanceByWorkoutType[workoutType] += workout.get("distance");

                    if (workout.has("distancePlanned") && workout.get("distancePlanned") !== null)
                        plannedValues.distanceByWorkoutType[workoutType] += workout.get("distancePlanned");

                    if (workout.has("totalTime") && workout.get("totalTime") !== null)
                        completedValues.durationByWorkoutType[workoutType] += workout.get("totalTime");

                    if (workout.has("totalTimePlanned") && workout.get("totalTimePlanned") !== null)
                        plannedValues.durationByWorkoutType[workoutType] += workout.get("totalTimePlanned");
                });
            });

            this.model.set(
            {
                totalTimePlanned: plannedValues.totalTime,
                totalTimeCompleted: completedValues.totalTime,
                bikeDistancePlanned: plannedValues.distanceByWorkoutType[workoutTypeEnum["Bike"]],
                bikeDistanceCompleted: completedValues.distanceByWorkoutType[workoutTypeEnum["Bike"]],
                runDistancePlanned: plannedValues.distanceByWorkoutType[workoutTypeEnum["Run"]],
                runDistanceCompleted: completedValues.distanceByWorkoutType[workoutTypeEnum["Run"]],
                swimDistancePlanned: plannedValues.distanceByWorkoutType[workoutTypeEnum["Swim"]],
                swimDistanceCompleted: completedValues.distanceByWorkoutType[workoutTypeEnum["Swim"]],
                strengthTimePlanned: plannedValues.durationByWorkoutType[workoutTypeEnum["Strength"]],
                strengthTimeCompleted: completedValues.durationByWorkoutType[workoutTypeEnum["Strength"]],
                tssPlanned: plannedValues.cumulativeTss,
                tssCompleted: completedValues.cumulativeTss
            },
            { silent: true });
        }
    });
});