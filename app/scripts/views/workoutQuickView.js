define(
[
    "TP",
    "jqueryui/dialog",
    "hbs!templates/views/workoutQuickView"

],
function(TP, dialog, workoutQuickView)
{
    "use strict";

    var PlannedCompletedLabelText;
    var minMaxAvgLabelText;

    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: workoutQuickView
        },

        ui:
        {
        },
        
        events:
        {
        },

        onBeforeRender: function ()
        {
            var self = this;
           
            this.$el.dialog(
            {
                autoOpen: false,
                modal: true,
                width: 800,
                height: 600,
                buttons:
                {
                    "Save": function ()
                    {
                        self.$el.dialog("close");
                        self.close();
                    },
                    "Cancel": function ()
                    {
                        self.$el.dialog("close");
                        self.close();
                    }
                }
            });

            
        },
        onRender: function ()
        {
            this.$el.dialog("open");
            this.setupPlannedCompletedView();
            this.setupMinMaxAvgView();
        },

        setupPlannedCompletedView: function()
        {
            var workoutStatsPlannedCompleted = ["Distance",
                                                "NormalizedPace",
                                                "AveragePace",
                                                "AverageSpeed",
                                                "Calories",
                                                "ElevationGain",
                                                "ElevationLoss",
                                                "TSS",
                                                "IF",
                                                "Energy"
            ];

            if (workoutStatsPlannedCompleted.length > 0)
            {
                $("<div/>", { "class": "plannedCompletedHeader" }).append($("<label/>", { "class": "plannedCompletedLabel", text: "Planned" })).append($("<label/>", { "class": "plannedCompletedLabel", text: "Completed" })).appendTo("#workoutPlannedCompletedStats");
            }

            for (var i = 0; i < workoutStatsPlannedCompleted.length; i++)
            {
                this.getPlannedCompletedLabel(i);
                $("<div/>", { id: workoutStatsPlannedCompleted[i] }).append($("<label/>", { id: workoutStatsPlannedCompleted[i] + "Label", text: PlannedCompletedLabelText })).append($("<input/>", { type: "text", id: workoutStatsPlannedCompleted[i] + "Planned" })).append($("<input/>", { type: "text", id: workoutStatsPlannedCompleted[i] + "completed" })).appendTo("#workoutPlannedCompletedStats");

            }
        },

        setupMinMaxAvgView: function()
        {
            var workoutStatsMinMaxAvg = ["NormalizedPower", "Power", "Torque", "Elevation", "Cadence", "Speed", "Pace", "HeartRate", "Temp"];

            if (workoutStatsMinMaxAvg.length > 0)
            {
                $("<div/>", { "class": "minMaxAvgHeader" }).append($("<label/>", { "class": "minMaxAvg", text: "Min" })).append($("<label/>", { "class": "minMaxAvg", text: "Avg" })).append($("<label/>", { "class": "minMaxAvg", text: "Max" })).appendTo("#workoutMinMaxAvgStats");
            }

            for (var i = 0; i < workoutStatsMinMaxAvg.length; i++)
            {
                this.getMinMaxAvgLabel(i);
                $("<div/>", { id: workoutStatsMinMaxAvg[i] }).append($("<label/>", { id: workoutStatsMinMaxAvg[i] + "Label", text: minMaxAvgLabelText })).append($("<input/>", { type: "text", id: workoutStatsMinMaxAvg[i] + "Min" })).append($("<input/>", { type: "text", id: workoutStatsMinMaxAvg[i] + "Max" })).append($("<input/>", { type: "text", id: workoutStatsMinMaxAvg[i] + "Avg" })).appendTo("#workoutMinMaxAvgStats");

            }
        },

        getPlannedCompletedLabel: function (i)
        {
            switch (i)
            {
                case 0:
                    PlannedCompletedLabelText = "Distance";
                    break;
                case 1:
                    PlannedCompletedLabelText = "Normalized Pace";
                    break;
                case 2:
                    PlannedCompletedLabelText = "Average Pace";
                    break;
                case 3:
                    PlannedCompletedLabelText = "Average Speed";
                    break;
                case 4:
                    PlannedCompletedLabelText = "Calories";
                    break;
                case 5:
                    PlannedCompletedLabelText = "Elevation Gain";
                    break;
                case 6:
                    PlannedCompletedLabelText = "Elevation Loss";
                    break;
                case 7:
                    PlannedCompletedLabelText = "TSS";
                    break;
                case 8:
                    PlannedCompletedLabelText = "IF";
                    break;
                case 9:
                    PlannedCompletedLabelText = "Energy";
                    break;
            }
        },

        getMinMaxAvgLabel: function (i)
        {
            switch (i)
            {
                case 0:
                    minMaxAvgLabelText = "Normalized Power";
                    break;
                case 1:
                    minMaxAvgLabelText = "Power";
                    break;
                case 2:
                    minMaxAvgLabelText = "Torque";
                    break;
                case 3:
                    minMaxAvgLabelText = "Elevation";
                    break;
                case 4:
                    minMaxAvgLabelText = "Cadence";
                    break;
                case 5:
                    minMaxAvgLabelText = "Speed";
                    break;
                case 6:
                    minMaxAvgLabelText = "Pace";
                    break;
                case 7:
                    minMaxAvgLabelText = "HeartRate";
                    break;
                case 8:
                    minMaxAvgLabelText = "Temp";
                    break;
            }
        }

    });
});