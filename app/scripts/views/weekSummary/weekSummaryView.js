define(
[
    "TP",
    "views/weekSummary/weekSummarySettings",
    "views/weekSummary/weekSummaryBarChartHover",
    "hbs!templates/views/weekSummary/weekSummary"
],
function(
    TP,
    WeekSummarySettings,
    barChartHover,
    weekSummaryTemplate)
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

        events:
        {
            "mouseenter": "onMouseEnter",
            "mouseleave": "onMouseLeave",
            "click .summarySettings": "summarySettingsClicked",

            "mouseleave .weekSummaryBarGraphItem": "weekSummaryBarGraphLeave",
            "mouseenter .weekSummaryBarGraphItem": "weekSummaryBarGraphHover"
            
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
            var completedValues =
            {
                totalDistance: 0,
                totalTime: 0,
                totalEnergy: 0,
                distanceByWorkoutType: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
                durationByWorkoutType: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
                cumulativeTss: 0,
                completedDays: {},
                completedDaysByWorkoutType: {}
            };
            var plannedValues =
            {
                totalDistance: 0,
                totalTime: 0,
                totalEnergy: 0,
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
                    if (workout.getCalendarDay && TP.utils.workout.determineCompletedWorkout(workout.attributes))
                    {
                        completedValues.completedDays[workout.getCalendarDay()] = true;
                        if(!completedValues.completedDaysByWorkoutType[workout.get("workoutTypeValueId")])
                        {
                            completedValues.completedDaysByWorkoutType[workout.get("workoutTypeValueId")] = {};
                        }
                        completedValues.completedDaysByWorkoutType[workout.get("workoutTypeValueId")][workout.getCalendarDay()] = true;
                    }

                    if (workout.has("totalTime") && workout.get("totalTime") !== null)
                        completedValues.totalTime += Number(workout.get("totalTime"));
  
                    if (workout.has("totalTimePlanned") && workout.get("totalTimePlanned") !== null)
                        plannedValues.totalTime += Number(workout.get("totalTimePlanned"));

                    if (workout.has("energy") && workout.get("energy") !== null)
                        completedValues.totalEnergy += Number(workout.get("energy"));
  
                    if (workout.has("energyPlanned") && workout.get("energyPlanned") !== null)
                        plannedValues.totalEnergy += Number(workout.get("energyPlanned"));
                    
                    if (workout.has("tssActual") && workout.get("tssActual") !== null)
                        completedValues.cumulativeTss += Number(workout.get("tssActual"));

                    if (workout.has("tssPlanned") && workout.get("tssPlanned") !== null)
                        plannedValues.cumulativeTss += Number(workout.get("tssPlanned"));

                    if (workout.has("distance") && workout.get("distance") !== null)
                        completedValues.totalDistance += Number(workout.get("distance"));
  
                    if (workout.has("distancePlanned") && workout.get("distancePlanned") !== null)
                        plannedValues.totalDistance += Number(workout.get("distancePlanned"));

                    var workoutType = workout.get("workoutTypeValueId");

                    // Always aggregate total time independently of workoutType
                    // Only aggregate specifics for Swim, Bike, Run, Strength
                    if (!workoutType || 
                        workoutType !== TP.utils.workout.types.getIdByName("Swim") &&
                        workoutType !== TP.utils.workout.types.getIdByName("Bike") &&
                        workoutType !== TP.utils.workout.types.getIdByName("Run") &&
                        workoutType !== TP.utils.workout.types.getIdByName("Strength"))
                        return;

                    if (workout.has("distance") && workout.get("distance") !== null)
                        completedValues.distanceByWorkoutType[workoutType] += Number(workout.get("distance"));

                    if (workout.has("distancePlanned") && workout.get("distancePlanned") !== null)
                        plannedValues.distanceByWorkoutType[workoutType] += Number(workout.get("distancePlanned"));

                    if (workout.has("totalTime") && workout.get("totalTime") !== null)
                        completedValues.durationByWorkoutType[workoutType] += Number(workout.get("totalTime"));

                    if (workout.has("totalTimePlanned") && workout.get("totalTimePlanned") !== null)
                        plannedValues.durationByWorkoutType[workoutType] += Number(workout.get("totalTimePlanned"));
                });
            });

            this.model.set(
            {
                totalTimePlanned: plannedValues.totalTime,
                totalTimeCompleted: completedValues.totalTime,
                totalDaysCompleted: _.keys(completedValues.completedDays).length,
                totalDistancePlanned: plannedValues.totalDistance,
                totalDistanceCompleted: completedValues.totalDistance,
                totalEnergyPlanned: plannedValues.totalEnergy.toFixed(0),
                totalEnergyCompleted: completedValues.totalEnergy.toFixed(0),
                bikeDistancePlanned: plannedValues.distanceByWorkoutType[TP.utils.workout.types.getIdByName("Bike")],
                bikeDistanceCompleted: completedValues.distanceByWorkoutType[TP.utils.workout.types.getIdByName("Bike")],
                runDistancePlanned: plannedValues.distanceByWorkoutType[TP.utils.workout.types.getIdByName("Run")],
                runDistanceCompleted: completedValues.distanceByWorkoutType[TP.utils.workout.types.getIdByName("Run")],
                swimDistancePlanned: plannedValues.distanceByWorkoutType[TP.utils.workout.types.getIdByName("Swim")],
                swimDistanceCompleted: completedValues.distanceByWorkoutType[TP.utils.workout.types.getIdByName("Swim")],
                bikeDurationPlanned: plannedValues.durationByWorkoutType[TP.utils.workout.types.getIdByName("Bike")],
                bikeDurationCompleted: completedValues.durationByWorkoutType[TP.utils.workout.types.getIdByName("Bike")],
                bikeDaysCompleted: _.keys(completedValues.completedDaysByWorkoutType[TP.utils.workout.types.getIdByName("Bike")]).length,
                runDurationPlanned: plannedValues.durationByWorkoutType[TP.utils.workout.types.getIdByName("Run")],
                runDurationCompleted: completedValues.durationByWorkoutType[TP.utils.workout.types.getIdByName("Run")],
                runDaysCompleted: _.keys(completedValues.completedDaysByWorkoutType[TP.utils.workout.types.getIdByName("Run")]).length,
                swimDurationPlanned: plannedValues.durationByWorkoutType[TP.utils.workout.types.getIdByName("Swim")],
                swimDurationCompleted: completedValues.durationByWorkoutType[TP.utils.workout.types.getIdByName("Swim")],
                swimDaysCompleted: _.keys(completedValues.completedDaysByWorkoutType[TP.utils.workout.types.getIdByName("Swim")]).length,
                swimFormatOptions: { workoutTypeValueId: 1 },
                strengthDurationPlanned: plannedValues.durationByWorkoutType[TP.utils.workout.types.getIdByName("Strength")],
                strengthDurationCompleted: completedValues.durationByWorkoutType[TP.utils.workout.types.getIdByName("Strength")],
                strengthDaysCompleted: _.keys(completedValues.completedDaysByWorkoutType[TP.utils.workout.types.getIdByName("Strength")]).length,
                tssPlanned: plannedValues.cumulativeTss.toFixed(0),
                tssCompleted: completedValues.cumulativeTss.toFixed(0)
            },
            { silent: true });
        },

        onMouseEnter: function (e)
        {
            this.showSettingsButton(e);
        },

        onMouseLeave: function (e)
        {
            var toElement = document.elementFromPoint(e.pageX, e.pageY);
            if (e.toElement === this.el)
                return;

            this.removeSettingsButton(e);

            this.weekSummaryBarGraphLeave(e);
        },

        showSettingsButton: function ()
        {
            this.$(".summarySettings").css('display', "block");
        },

        removeSettingsButton: function (e)
        {

            if (!e)
            {
                this.$(".summarySettings").css('display', "none");
                return;
            }

            var toElement = $(document.elementFromPoint(e.pageX, e.pageY));
            if (!toElement.is(".summarySettings") && !toElement.is("#summarySettingsDiv") && !toElement.is(".hoverBox") && !toElement.is(".modal") && !toElement.is(".modalOverlay"))
            {
                this.$(".summarySettings").css('display', "none");
            }
        },

        summarySettingsClicked: function (e)
        {
            e.preventDefault();

            var offset = $(e.currentTarget).offset();

            this.summarySettings = new WeekSummarySettings({ model: this.model });
            this.summarySettings.render().center(offset.left - 7).bottom(offset.top + 15);
            this.summarySettings.on("close", this.onSettingsClosed, this);

            this.summarySettings.once("beforeShift", function()
            {
                this.removeSettingsButton(e);
                this.summarySettings.off("close", this.onSettingsClosed, this);
            }, this);

            //this.$el.closest(".week").find(".weekSelected").css("display", "block");

            //this.model.trigger("weeksummary:settings:open", this.model.collection);
        },

        onSettingsClosed: function(e)
        {
            this.removeSettingsButton(e);
            this.model.collection.trigger("week:unselect", this.model.collection, e);
            //this.$el.closest(".week").find(".weekSelected").css("display", "none");
            //this.model.trigger("weeksummary:settings:close", this.model.collection);
        },

        weekSummaryBarGraphHover: function (e)
        {
            if (this.summaryBarChartHover)
            {
                return;
            }
            e.preventDefault();
            var target = $(e.currentTarget);
            var offset = target.offset();
            var centerPoint = target.width() / 2;
            var targetDataType = target.data("type");
            var hoverModel = this.buildHoverModel(targetDataType);

            this.summaryBarChartHover = new barChartHover({model: hoverModel});
            this.summaryBarChartHover.render().bottom(offset.top + 20).center(offset.left + centerPoint);
            this.summaryBarChartHover.$el.css('padding', "0px");
        },

        buildHoverModel: function (targetDataType)
        {
            var tpModel = new TP.Model();

            switch (targetDataType)
            {
                case "total":
                    tpModel.set({ timePlanned: this.model.get("totalTimePlanned"), timeCompleted: this.model.get("totalTimeCompleted"), displayTime: true });
                    break;

                case "strength":
                    tpModel.set({ timePlanned: this.model.get("strengthDurationPlanned"), timeCompleted: this.model.get("strengthDurationCompleted"), displayTime: true });
                    break;

                case "bike":
                    tpModel.set({ timePlanned: this.model.get("bikeDurationPlanned"), timeCompleted: this.model.get("bikeDurationCompleted"), displayTime: true });
                    break;

                case "run":
                    tpModel.set({ distancePlanned: this.model.get("runDistancePlanned"), distanceCompleted: this.model.get("runDistanceCompleted"), workoutTypeValueId: 3 });
                    break;

                case "swim":
                    tpModel.set({ distancePlanned: this.model.get("swimDistancePlanned"), distanceCompleted: this.model.get("swimDistanceCompleted"), workoutTypeValueId: 1 });
                    break;
            }

            return tpModel;
        },

        weekSummaryBarGraphLeave: function (e)
        {
            if (e.toElement && ($(e.toElement).is(".weekSummaryBarChartHover") || $(e.toElement).is(".hoverBox")))
            {
                return;
            }
            if (this.summaryBarChartHover)
            {
                this.summaryBarChartHover.close();
                this.summaryBarChartHover = null;
            }
        }
    });
});