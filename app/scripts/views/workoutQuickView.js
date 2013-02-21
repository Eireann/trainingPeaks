﻿define(
[
    "TP",
    "jqueryui/dialog",
    "helpers/printUnitLabel",
    "helpers/convertToViewUnits",
    "helpers/convertToModelUnits",
    "hbs!templates/views/workoutQuickView"

],
function(TP, dialog, printUnitLabel, convertToViewUnits, convertToModelUnits, workoutQuickViewTemplate)
{
    return TP.ItemView.extend(
    {
        events:
        {
            "click #breakThrough": "onbreakThroughClicked"
        },

        template:
        {
            type: "handlebars",
            template: workoutQuickViewTemplate
        },

        onbreakThroughClicked: function()
        {
            var description = this.model.get("Description");

            if (!description)
                description = "";

            if(description.indexOf("BT: ") !== 0)
            {
                this.model.set("Description", "BT: " + description);
                this.$("#breakThrough img").attr("src", "assets/images/QVImages/breakthroughClicked.jpg");
            }
            else
            {
                this.$("#breakThrough img").attr("src", "assets/images/QVImages/breakthrough.jpg");
                description = description.replace(/BT: /, "");
                this.model.set("Description", description);
            }
        },

        getDistance: function(value, options)
        {
            return convertToViewUnits(value, "distance");
        },
        
        setDistance: function(value, options)
        {
            return convertToModelUnits(value, "distance");
        },

        getPace: function(value, options)
        {
            return convertToViewUnits(value, "pace");
        },
        
        setPace: function(value, options)
        {
            return convertToModelUnits(value, "pace");
        },

        getSpeed: function(value, options)
        {
            return convertToViewUnits(value, "speed");
        },
        
        setSpeed: function(value, options)
        {
            return convertToModelUnits(value, "speed");
        },
        
        getElevation: function(value, options)
        {
            return convertToViewUnits(value, "elevation");
        },
        
        setElevation: function(value, options)
        {
            return convertToModelUnits(value, "elevation");
        },
        
        bindings:
        {
            "#workoutTitleField":
            {
                observe: "title",
                eventsOverride: ["blur"]
            },
            "#distanceCompletedField":
            {
                observe: "distance",
                eventsOverride: [ "blur" ],
                onGet: "getDistance",
                onSet: "setDistance"
            },
            "#distancePlannedField":
            {
                observe: "distancePlanned",
                eventsOverride: ["blur"],
                onGet: "getDistance",
                onSet: "setDistance"
            },
            "#tssPlannedField":
            {
                observe: "tssPlanned",
                eventsOverride: ["blur"]
            },
            "#tssCompletedField":
            {
                observe: "tssActual",
                eventsOverride: ["blur"]
            },
            "#normalizedPacePlannedField":
            {
                observe: "normalizedSpeedActual",
                eventsOverride: ["blur"],
                onGet: "getPace",
                onSet: "setPace"
            },
            "#averagePacePlannedField":
            {
                observe: "velocityPlanned",
                eventsOverride: ["blur"],
                onGet: "getPace",
                onSet: "setPace"
            },
            "#averagePaceCompletedField":
            {
                observe: "velocityAverage",
                eventsOverride: ["blur"],
                onGet: "getPace",
                onSet: "setPace"
            },
            "#averageSpeedPlannedField":
            {
                observe: "velocityPlanned",
                eventsOverride: ["blur"],
                onGet: "getSpeed",
                onSet: "setSpeed"
            },
            "#averageSpeedCompletedField":
            {
                observe: "velocityAverage",
                eventsOverride: ["blur"],
                onGet: "getSpeed",
                onSet: "setSpeed"
            },
            "#caloriesPlannedField":
            {
                observe: "caloriesPlanned",
                eventsOverride: ["blur"]
            },
            "#caloriesCompletedField":
            {
                observe: "calories",
                eventsOverride: ["blur"]
            },
            "#elevationGainPlannedField":
            {
                observe: "elevationGainPlanned",
                eventsOverride: ["blur"],
                onGet: "getElevation",
                onSet: "setElevation"
            },
            "#elevationGainCompletedField":
            {
                observe: "elevationGain",
                eventsOverride: ["blur"],
                onGet: "getElevation",
                onSet: "setElevation"
            },
            "#elevationLossCompletedField":
            {
                observe: "elevationLoss",
                eventsOverride: ["blur"],
                onGet: "getElevation",
                onSet: "setElevation"
            },
            "#ifPlannedField":
            {
                observe: "ifPlanned",
                eventsOverride: ["blur"]
            },
            "#ifCompletedField":
            {
                observe: "if",
                eventsOverride: ["blur"]
            },
            "#energyPlannedField":
            {
                observe: "energyPlanned",
                eventsOverride: ["blur"]
            },
            "#energyCompletedField":
            {
                observe: "energy",
                eventsOverride: ["blur"]
            },
            "#powerAvgField":
            {
                observe: "powerAverage",
                eventsOverride: ["blur"]
            },
            "#powerMaxField":
            {
                observe: "powerMaximum",
                eventsOverride: ["blur"]
            },
            "#torqueAvgField":
            {
                observe: "torqueAverage",
                eventsOverride: ["blur"]
            },
            "#torqueMaxField":
            {
                observe: "torqueMaximum",
                eventsOverride: ["blur"]
            },
            "#elevationMinField":
            {
                observe: "elevationMinimum",
                eventsOverride: ["blur"]
            },
            "#elevationAvgField":
            {
                observe: "elevationAverage",
                eventsOverride: ["blur"]
            },
            "#elevationMaxField":
            {
                observe: "elevationMaximum",
                eventsOverride: ["blur"]
            },
            "#cadenceAvgField":
            {
                observe: "cadenceAverage",
                eventsOverride: ["blur"]
            },
            "#cadenceMaxField":
            {
                observe: "cadenceMaximum",
                eventsOverride: ["blur"]
            },
            "#speedAvgField":
            {
                observe: "velocityAverage",
                eventsOverride: ["blur"]
            },
            "#speedMaxField":
            {
                observe: "velocityMaximum",
                eventsOverride: ["blur"]
            },
            "#paceMinField":
            {
                //TODO Find the right field to observe
                observe: "velocityAverage",
                eventsOverride: ["blur"]
            },
            "#paceAvgField":
            {
                observe: "velocityAverage",
                eventsOverride: ["blur"]
            },
            "#paceMaxField":
            {
                observe: "velocityMaximum",
                eventsOverride: ["blur"]
            },
            "#hrMinField":
            {
                observe: "heartRateMinimum",
                eventsOverride: ["blur"]
            },
            "#hrAvgField":
            {
                observe: "heartRateAverage",
                eventsOverride: ["blur"]
            },
            "#hrMaxField":
            {
                observe: "heartRateMaximum",
                eventsOverride: ["blur"]
            },
            "#tempMinField":
            {
                observe: "tempMin",
                eventsOverride: ["blur"]
            },
            "#tempAvgField":
            {
                observe: "tempAvg",
                eventsOverride: ["blur"]
            },
            "#tempMaxField":
            {
                observe: "tempMax",
                eventsOverride: ["blur"]
            },
            "#descriptionInput":
            {
                observe: "description",
                eventsOverride: [ "blur" ]
            }
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
                resizable: false,

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
                    },
                    "Delete": function ()
                    {
                        self.deleteWorkout();
                    }

                }
            });
 
        },

        deleteWorkout: function ()
        {
            this.$el.dialog("close");
            this.close();
            // pass wait here so it won't actually remove the model until the server call returns,
            // which will then remove the view and the waiting indicator
            this.model.destroy({ wait: true });
        },

        onRender: function ()
        {
            this.$el.dialog("open");
            this.stickit();
        }
    });
});