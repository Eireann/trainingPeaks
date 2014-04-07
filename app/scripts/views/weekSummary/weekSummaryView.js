define(
[
    "jquery",
    "underscore",
    "TP",
    "models/workoutModel",
    "views/weekSummary/weekSummarySettings",
    "views/weekSummary/weekSummaryBarChartHover",
    "shared/models/activityModel",
    "shared/misc/calendarDaySelection",
    "hbs!templates/views/weekSummary/weekSummary"
],
function(
    $,
    _,
    TP,
    WorkoutModel,
    WeekSummarySettings,
    barChartHover,
    ActivityModel,
    CalendarDaySelection,
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

            // We would like to limit the frequency of renders, but due to the
            // current setup of views it seems to break occasionally.
            // this.render = _.debounce(_.bind(this.render, this), 100, {leading: true, trailing: true, maxWait: 500});

            this.listenTo(theMarsApp.user, "change:units", _.bind(this.render, this));
            

            var self = this;
            this.model.collection.each(function(item)
            {
                if (item.itemsCollection)
                {
                    item.listenTo(item.itemsCollection, "change add remove", _.bind(self.render, this));
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
          
            //iterate over calendarDayModels for the current week (associated with this weekSummaryView)
            this.model.collection.each(function(item)
            {
                //exclude if item is a weekSummaryModel instead of calendarDayModel 
                if (!item.itemsCollection)
                    return;

                //iterate over items (workouts, meals, metrics) for the current day
                item.itemsCollection.each(function(workout)
                {
                    // Note, you might get a metric or other model
                    workout = ActivityModel.unwrap(workout);

                    if(!(workout instanceof WorkoutModel))
                    {
                        return;
                    }

                    var workoutType = workout.get("workoutTypeValueId");

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
                totalEnergyPlanned: Math.round(plannedValues.totalEnergy),
                totalEnergyCompleted: Math.round(completedValues.totalEnergy),
                tssPlanned: Math.round(plannedValues.cumulativeTss),
                tssCompleted: Math.round(completedValues.cumulativeTss),
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
            this.summarySettings.render().center(offset.left - 6).bottom(offset.top + 15);
            this.listenTo(this.summarySettings, "close", _.bind(this.onSettingsClosed, this));

            this.summarySettings.once("beforeShift", function()
            {
                this.allowSettingsButtonToHide(e);
            }, this);

            theMarsApp.selectionManager.setMultiSelection(this.model.collection.models, e, CalendarDaySelection);
        },

        onSettingsClosed: function(e)
        {
            this.allowSettingsButtonToHide(e);
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
            this.listenTo(this.summaryBarChartHover, "mouseleave", _.bind(this.onSummaryBarChartMouseLeave, this));
        },

        buildHoverModel: function (targetDataType)
        {
            var tpModel = new TP.Model();

            if(targetDataType === "total duration")
            {
                if(this.model.get("totalTimePlanned"))
                {
                    tpModel.set({ timePlanned: this.model.get("totalTimePlanned"), timeCompleted: this.model.get("totalTimeCompleted"), displayTime: true });
                }
                else
                {
                    tpModel.set({ daysPlanned: 7, daysCompleted: this.model.get("totalDaysCompleted"), displayDays: true });
                }
            } else if (targetDataType === "total tss")
            {
                tpModel.set({tssPlanned: this.model.get("tssPlanned"), tssCompleted: this.model.get("tssCompleted"), displayTSS: true});
            } else {
                var parts = targetDataType.split(" ");
                var workoutTypeId = Number(parts.shift());
                var workoutTypeName = parts.shift();
                var distanceOrDuration = parts.shift();
                var workoutTotals = this.model.get("totalsByWorkoutType")[workoutTypeId];
                if(distanceOrDuration === "distance")
                {
                    tpModel.set({
                        workoutTypeValueId: workoutTypeId,
                        distancePlanned: workoutTotals.distance.planned,
                        distanceCompleted: workoutTotals.distance.completed,
                        displayTime: false
                    });
                }
                else
                {
                    tpModel.set({
                        workoutTypeValueId: workoutTypeId,
                        timePlanned: workoutTotals.duration.planned,
                        timeCompleted: workoutTotals.duration.completed,
                        displayTime: true 
                    });
                }
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
