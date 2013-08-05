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
                totalElevationGain: 0,
                distanceByWorkoutType: {},
                durationByWorkoutType: {},
                cumulativeTss: 0,
                completedDays: {},
                completedDaysByWorkoutType: {}
            };
            var plannedValues =
            {
                totalDistance: 0,
                totalTime: 0,
                totalEnergy: 0,
                distanceByWorkoutType: {}   ,
                durationByWorkoutType: {},
                cumulativeTss: 0
            };

            var excludeWorkoutTypes = [7]; // skip Day Off
          
            //iterate over calendarDayModels for the current week (associated with this weekSummaryView)
            this.model.collection.each(function(item)
            {
                //exclude if item is a weekSummaryModel instead of calendarDayModel 
                if (!item.itemsCollection)
                    return;

                //iterate over items (workouts, meals, metrics) for the current day
                item.itemsCollection.each(function(workout)
                {

                    var workoutType = workout.get("workoutTypeValueId");

                    if(_.contains(excludeWorkoutTypes, workoutType))
                        return;

                    if (workout.getCalendarDay && TP.utils.workout.determineCompletedWorkout(workout.attributes))
                    {
                        completedValues.completedDays[workout.getCalendarDay()] = true;
                        if(!completedValues.completedDaysByWorkoutType[workoutType])
                        {
                            completedValues.completedDaysByWorkoutType[workoutType] = {};
                        }
                        completedValues.completedDaysByWorkoutType[workoutType][workout.getCalendarDay()] = true;
                    }

                    if (workout.has("totalTime") && workout.get("totalTime") !== null)
                        completedValues.totalTime += Number(workout.get("totalTime"));
  
                    if (workout.has("totalTimePlanned") && workout.get("totalTimePlanned") !== null)
                        plannedValues.totalTime += Number(workout.get("totalTimePlanned"));

                    if (workout.has("energy") && workout.get("energy") !== null)
                        completedValues.totalEnergy += Number(workout.get("energy"));
  
                    if (workout.has("energyPlanned") && workout.get("energyPlanned") !== null)
                        plannedValues.totalEnergy += Number(workout.get("energyPlanned"));
 
                    if (workout.has("elevationGain") && workout.get("elevationGain") !== null)
                        completedValues.totalElevationGain += Number(workout.get("elevationGain"));                   

                    if (workout.has("tssActual") && workout.get("tssActual") !== null)
                        completedValues.cumulativeTss += Number(workout.get("tssActual"));

                    if (workout.has("tssPlanned") && workout.get("tssPlanned") !== null)
                        plannedValues.cumulativeTss += Number(workout.get("tssPlanned"));

                    if (workout.has("distance") && workout.get("distance") !== null)
                        completedValues.totalDistance += Number(workout.get("distance"));
  
                    if (workout.has("distancePlanned") && workout.get("distancePlanned") !== null)
                        plannedValues.totalDistance += Number(workout.get("distancePlanned"));


                    if(!completedValues.distanceByWorkoutType.hasOwnProperty(workoutType))
                    {
                        completedValues.distanceByWorkoutType[workoutType] = 0;
                        completedValues.durationByWorkoutType[workoutType] = 0;
                        plannedValues.distanceByWorkoutType[workoutType] = 0;
                        plannedValues.durationByWorkoutType[workoutType] = 0;
                    }

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

            var totalsByWorkoutType = [];

            _.each(_.keys(TP.utils.workout.types.typesById), function(typeId)
            {
                totalsByWorkoutType[typeId] =
                {
                    distance: {
                        workoutTypeId: typeId,
                        planned: plannedValues.distanceByWorkoutType[typeId],
                        completed: completedValues.distanceByWorkoutType[typeId],
                        daysCompleted: 0
                    },
                    duration: {
                        workoutTypeId: typeId,
                        planned: plannedValues.durationByWorkoutType[typeId],
                        completed: completedValues.durationByWorkoutType[typeId],
                        daysCompleted: 0
                    }
                };
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
                tssPlanned: plannedValues.cumulativeTss.toFixed(0),
                tssCompleted: completedValues.cumulativeTss.toFixed(0),
                totalElevationGain: completedValues.totalElevationGain,
                totalsByWorkoutType: totalsByWorkoutType,
                totalsByWorkoutTypeCompacted: _.compact(totalsByWorkoutType)
            },
            { silent: true });
        },

        onMouseLeave: function (e)
        {
            var toElement = document.elementFromPoint(e.pageX, e.pageY);
            if (e.toElement === this.el)
                return;


            this.weekSummaryBarGraphLeave(e);
        },

        keepSettingsButtonVisible: function()
        {
            this.$(".summarySettings").addClass("menuOpen");
        },

        allowSettingsButtonToHide: function (e)
        {
            this.$(".summarySettings").removeClass("menuOpen");
        },

        summarySettingsClicked: function (e)
        {
            e.preventDefault();

            var offset = $(e.currentTarget).offset();

            this.keepSettingsButtonVisible(e);

            this.summarySettings = new WeekSummarySettings({ model: this.model });
            this.summarySettings.render().center(offset.left - 7).bottom(offset.top + 15);
            this.summarySettings.on("close", this.onSettingsClosed, this);

            this.summarySettings.once("beforeShift", function()
            {
                this.allowSettingsButtonToHide(e);
                this.summarySettings.off("close", this.onSettingsClosed, this);
            }, this);

            //this.$el.closest(".week").find(".weekSelected").css("display", "block");

            //this.model.trigger("weeksummary:settings:open", this.model.collection);
        },

        onSettingsClosed: function(e)
        {
            this.allowSettingsButtonToHide(e);
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
            this.summaryBarChartHover.on("mouseleave", this.onSummaryBarChartMouseLeave, this);
        },

        buildHoverModel: function (targetDataType)
        {
            var tpModel = new TP.Model();

            switch (targetDataType)
            {
                case "total":
                    tpModel.set({ timePlanned: this.model.get("totalTimePlanned"), timeCompleted: this.model.get("totalTimeCompleted"), displayTime: true });
                    break;

                case "strength duration":
                    tpModel.set({ timePlanned: this.model.get("strengthDurationPlanned"), timeCompleted: this.model.get("strengthDurationCompleted"), displayTime: true });
                    break;

                case "bike duration":
                    tpModel.set({ timePlanned: this.model.get("bikeDurationPlanned"), timeCompleted: this.model.get("bikeDurationCompleted"), displayTime: true });
                    break;

                case "bike distance":
                    tpModel.set({ distancePlanned: this.model.get("bikeDistancePlanned"), distanceCompleted: this.model.get("bikeDistanceCompleted"), displayTime: false });
                    break;

                case "run distance":
                    tpModel.set({ distancePlanned: this.model.get("runDistancePlanned"), distanceCompleted: this.model.get("runDistanceCompleted"), workoutTypeValueId: 3 });
                    break;

                case "run duration":
                    tpModel.set({ timePlanned: this.model.get("runDurationPlanned"), timeCompleted: this.model.get("runDurationCompleted"), workoutTypeValueId: 3, displayTime: true });
                    break;

                case "swim distance":
                    tpModel.set({ distancePlanned: this.model.get("swimDistancePlanned"), distanceCompleted: this.model.get("swimDistanceCompleted"), workoutTypeValueId: 1, displayTime: false});
                    break;

                case "swim duration":
                    tpModel.set({ timePlanned: this.model.get("swimDurationPlanned"), timeCompleted: this.model.get("swimDurationCompleted"), workoutTypeValueId: 1, displayTime: true});
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
        },

        onSummaryBarChartMouseLeave: function(e)
        {
            if (this.summaryBarChartHover)
            {
                this.summaryBarChartHover.close();
                this.summaryBarChartHover = null;
            }
        }
    });
});