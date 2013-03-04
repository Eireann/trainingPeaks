define(
[
    "TP",
    "hbs!templates/views/weekSummary"
],
function(TP, weekSummaryTemplate)
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
            var workoutTypes = ["", "swim", "bike", "run", "brick", "xTrain", "race", "dayOff", "mtb", "strength"];
            
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
            
            this.model.collection.each(function(item)
            {
                if (!item.itemsCollection)
                    return;

                item.itemsCollection.each(function(workout)
                {
                    var workoutType = workout.get("workoutTypeValueId");

                    if (!workoutType)
                        return;
                    
                    if (workout.has("distance") && workout.get("distance") !== null)
                        completedValues.distanceByWorkoutType[workoutType] += workout.get("distance");

                    if (workout.has("distancePlanned") && workout.get("distancePlanned") !== null)
                        plannedValues.distanceByWorkoutType[workoutType] += workout.get("distancePlanned");

                    if (workout.has("totalTime") && workout.get("totalTime") !== null)
                    {
                        totalTimeCompleted += workout.get("totalTime");
                        completedValues.durationByWorkoutType[workoutType] += workout.get("totalTime");
                    }

                    if (workout.has("totalTimePlanned") && workout.get("totalTimePlanned") !== null)
                    {
                        totalTimePlanned += workout.get("totalTimePlanned");
                        plannedValues.durationByWorkoutType[workoutType] += workout.get("totalTimePlanned");
                    }
                    
                    if (workout.has("tssPlanned") && workout.get("tssPlanned") !== null)
                        plannedValues.cumulativeTss += workout.get("tssPlanned");

                    if (workout.has("tssActual") && workout.get("tssActual") !== null)
                        completedValues.cumulativeTss += workout.get("tssActual");
                });
            });

            this.model.set(
                {
                    totalTimePlanned: plannedValues.totalTime,
                    totalTimeCompleted: completedValues.totalTime,
                    bikeDistancePlanned: plannedValues.distanceByWorkoutType[2],
                    bikeDistanceCompleted: completedValues.distanceByWorkoutType[2],
                    runDistancePlanned: plannedValues.distanceByWorkoutType[3],
                    runDistanceCompleted: completedValues.distanceByWorkoutType[3],
                    swimDistancePlanned: plannedValues.distanceByWorkoutType[1],
                    swimDistanceCompleted: completedValues.distanceByWorkoutType[1],
                    strengthTimePlanned: plannedValues.durationByWorkoutType[9],
                    strengthTimeCompleted: completedValues.durationByWorkoutType[9],
                    tssPlanned: plannedValues.cumulativeTss,
                    tssCompleted: completedValues.cumulativeTss
                },
                { silent: true });
        }
    });
});