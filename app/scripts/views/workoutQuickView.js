define(
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
            console.log("Distance from model: " + value);
            return convertToViewUnits(value, "distance");
        },
        
        setDistance: function(value, options)
        {
            console.log("Distance from view: " + value);
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
                observe: "Title",
                eventsOverride: [ "blur" ]
            },
            "#distanceCompletedField":
            {
                observe: "Distance",
                eventsOverride: [ "blur" ],
                onGet: "getDistance",
                onSet: "setDistance"
            },
            "#distancePlannedField":
            {
                observe: "DistancePlanned",
                eventsOverride: ["blur"],
                onGet: "getDistance",
                onSet: "setDistance"
            },
            "#tssPlannedField":
            {
                observe: "TSSPlanned",
                eventsOverride: ["blur"]
            },
            "#tssCompletedField":
            {
                observe: "TSSActual",
                eventsOverride: ["blur"]
            },
            "#normalizedPacePlannedField":
            {
                observe: "NormalizedSpeedActual",
                eventsOverride: ["blur"],
                onGet: "getPace",
                onSet: "setPace"
            },
            "#averagePacePlannedField":
            {
                observe: "VelocityPlanned",
                eventsOverride: ["blur"],
                onGet: "getPace",
                onSet: "setPace"
            },
            "#averagePaceCompletedField":
            {
                observe: "VelocityAverage",
                eventsOverride: ["blur"],
                onGet: "getPace",
                onSet: "setPace"
            },
            "#averageSpeedPlannedField":
            {
                observe: "VelocityPlanned",
                eventsOverride: ["blur"],
                onGet: "getSpeed",
                onSet: "setSpeed"
            },
            "#averageSpeedCompletedField":
            {
                observe: "VelocityAverage",
                eventsOverride: ["blur"],
                onGet: "getSpeed",
                onSet: "setSpeed"
            },
            "#caloriesPlannedField":
            {
                observe: "CaloriesPlanned",
                eventsOverride: ["blur"]
            },
            "#caloriesCompletedField":
            {
                observe: "Calories",
                eventsOverride: ["blur"]
            },
            "#elevationGainPlannedField":
            {
                observe: "ElevationGainPlanned",
                eventsOverride: ["blur"],
                onGet: "getElevation",
                onSet: "setElevation"
            },
            "#elevationGainCompletedField":
            {
                observe: "ElevationGain",
                eventsOverride: ["blur"],
                onGet: "getElevation",
                onSet: "setElevation"
            },
            "#elevationLossCompletedField":
            {
                observe: "ElevationLoss",
                eventsOverride: ["blur"],
                onGet: "getElevation",
                onSet: "setElevation"
            },
            "#ifPlannedField":
            {
                observe: "IFPlanned",
                eventsOverride: ["blur"]
            },
            "#ifCompletedField":
            {
                observe: "IF",
                eventsOverride: ["blur"]
            },
            "#energyPlannedField":
            {
                observe: "EnergyPlanned",
                eventsOverride: ["blur"]
            },
            "#energyCompletedField":
            {
                observe: "Energy",
                eventsOverride: ["blur"]
            },
            "#powerAvgField":
            {
                observe: "PowerAverage",
                eventsOverride: ["blur"]
            },
            "#powerMaxField":
            {
                observe: "PowerMaximum",
                eventsOverride: ["blur"]
            },
            "#torqueAvgField":
            {
                observe: "TorqueAverage",
                eventsOverride: ["blur"]
            },
            "#torqueMaxField":
            {
                observe: "TorqueMaximum",
                eventsOverride: ["blur"]
            },
            "#elevationMinField":
            {
                observe: "ElevationMinimum",
                eventsOverride: ["blur"]
            },
            "#elevationAvgField":
            {
                observe: "ElevationAverage",
                eventsOverride: ["blur"]
            },
            "#elevationMaxField":
            {
                observe: "ElevationMaximum",
                eventsOverride: ["blur"]
            },
            "#cadenceAvgField":
            {
                observe: "CadenceAverage",
                eventsOverride: ["blur"]
            },
            "#cadenceMaxField":
            {
                observe: "CadenceMaximum",
                eventsOverride: ["blur"]
            },
            "#speedAvgField":
            {
                observe: "VelocityAverage",
                eventsOverride: ["blur"]
            },
            "#speedMaxField":
            {
                observe: "VelocityMaximum",
                eventsOverride: ["blur"]
            },
            "#paceMinField":
            {
                observe: "IF",
                eventsOverride: ["blur"]
            },
            "#paceAvgField":
            {
                observe: "VelocityAverage",
                eventsOverride: ["blur"]
            },
            "#paceMaxField":
            {
                observe: "VelocityMaximum",
                eventsOverride: ["blur"]
            },
            "#hrMinField":
            {
                observe: "HeartRateMinimum",
                eventsOverride: ["blur"]
            },
            "#hrAvgField":
            {
                observe: "HeartRateAverage",
                eventsOverride: ["blur"]
            },
            "#hrMaxField":
            {
                observe: "HeartRateMaximum",
                eventsOverride: ["blur"]
            },
            "#tempMinField":
            {
                observe: "TempMin",
                eventsOverride: ["blur"]
            },
            "#tempAvgField":
            {
                observe: "TempAvg",
                eventsOverride: ["blur"]
            },
            "#tempMaxField":
            {
                observe: "TempMax",
                eventsOverride: ["blur"]
            },
            "#descriptionInput":
            {
                observe: "Description",
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