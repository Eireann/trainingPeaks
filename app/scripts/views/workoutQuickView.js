define(
[
    "jqueryui/datepicker",
    "jqueryTimepicker",
    "underscore",
    "moment",
    "TP",
    "utilities/printDate",
    "utilities/printUnitLabel",
    "utilities/convertToViewUnits",
    "utilities/convertToModelUnits",
    "utilities/printTimeFromDecimalHours",
    "utilities/convertTimeHoursToDecimal",
    "models/workoutFileData",
    "views/deleteConfirmationView",
    "hbs!templates/views/workoutQuickView"
],
function(datepicker, timepicker, _, moment, TP,
    printDate, printUnitLabel,
    convertToViewUnits, convertToModelUnits,
    printTimeFromDecimalHours, convertTimeHoursToDecimal,
    WorkoutFileData,
    DeleteConfirmationView, workoutQuickViewTemplate)
{
    return TP.ItemView.extend(
    {

        modal: {
            mask: true,
            shadow: true
        },

        className: "workoutQuickView",

        showThrobbers: false,

        events:
        {
            "click #breakThrough": "onBreakThroughClicked",
            "click #delete": "onDeleteWorkout",
            "click #discard": "onDiscardClicked",
            "click #saveClose": "onSaveClosedClicked",
            "click #date": "onDateClicked",
            "click #quickViewFileUploadDiv": "onUploadFileClicked",
            "change input[type='file']": "onFileSelected"
        },

        ui:
        {
            "date": "#date",
            "fileinput": "input[type='file']"
        },
        
        initialize: function()
        {
            _.bindAll(this, "onUploadDone", "onUploadFail");
        },

        template:
        {
            type: "handlebars",
            template: workoutQuickViewTemplate
        },

        getDayName: function(value, options)
        {
            return printDate(value, "dddd");
        },

        getCalendarDate: function(value, options)
        {
            return printDate(value, "MMM DD, YYYY");
        },

        getStartTime: function(value, options)
        {
            try
            {
                return moment(value, "HH:mm").format("h:mm a");
            } catch (e)
            {
                return value;
            }
        },

        setStartTime: function(value, options)
        {
            try
            {
                return moment(value, "h:mm a").format("HH:mm");
            } catch(e)
            {
                return value;
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

        getTime: function(value, options)
        {
            return printTimeFromDecimalHours(value);
        },

        setTime: function(value, options)
        {
            return convertTimeHoursToDecimal(value);
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
            "#dayName":
            {
                observe: "workoutDay",
                onGet: "getDayName"
            },
            "#calendarDate":
            {
                observe: "workoutDay",
                onGet: "getCalendarDate"
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
            "#totalTimeCompletedField":
            {
                observe: "totalTime",
                eventsOverride: ["blur"],
                onGet: "getTime",
                onSet: "setTime"
            },
            "#totalTimePlannedField":
            {
                observe: "totalTimePlanned",
                eventsOverride: ["blur"],
                onGet: "getTime",
                onSet: "setTime"
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
            },
            "#startTimeInput":
            {
                observe: "startTime",
                eventsOverride: ["changeTime"],
                onGet: "getStartTime",
                onSet: "setStartTime"
            }
        },

        onDiscardClicked: function ()
        {
            this.trigger("discard");
            this.close();
        },

        onSaveClosedClicked: function ()
        {
            this.model.save();
            this.trigger("saveandclose");
            this.close();
        },

        onDeleteWorkout: function ()
        {
            this.deleteConfirmationView = new DeleteConfirmationView();
            this.deleteConfirmationView.render();
            this.deleteConfirmationView.on("deleteConfirmed", this.onDeleteWorkoutConfirmed, this);    
        },
        
        onDeleteWorkoutConfirmed: function()
        {
            this.close();
            // pass wait here so it won't actually remove the model until the server call returns,
            // which will then remove the view and the waiting indicator
            this.model.destroy({ wait: true });
        },

        onBreakThroughClicked: function ()
        {
            var description = this.model.get("description");

            if (!description)
                description = "";

            if (description.indexOf("BT: ") !== 0)
            {
                this.model.set("description", "BT: " + description);
                this.$("#breakThrough img").attr("src", "assets/images/QVImages/breakThroughFullOpac.png");
            }
            else
            {
                this.$("#breakThrough img").attr("src", "assets/images/QVImages/breakthrough.png");
                description = description.replace(/BT: /, "");
                this.model.set("description", description);
            }
        },

        onRender: function()
        {
            if (!this.stickitInitialized)
            {
                this.model.off("change", this.render);

                // there is no saveWorkout method ...
                //this.model.on("change", this.saveWorkout, this);

                this.stickit();
                this.stickitInitialized = true;

                this.$("#startTimeInput").timepicker({ appendTo: this.$el, 'timeFormat': 'g:i a' });

            }

        },

        onDateClicked: function(e)
        {
            _.bindAll(this, "onDateChanged");
            var position = [this.ui.date.offset().left, this.ui.date.offset().top + this.ui.date.height()];
            var settings = { dateFormat: "yy-mm-dd", firstDay: theMarsApp.controllers.calendarController.startOfWeekDayIndex };
            var widget = this.ui.date.datepicker("dialog", this.model.getCalendarDay(), this.onDateChanged, settings, position).datepicker("widget");

            // because jqueryui sets useless values for these ...
            widget.css("z-index", Number(this.$el.css("z-index") + 1)).css("opacity", 1);
        },

        onDateChanged: function(newDate)
        {
            var newDay = moment(newDate).format(this.model.shortDateFormat);
            this.ui.date.datepicker("hide");
            var oldDay = this.model.getCalendarDay();
            if (newDay !== oldDay)
            {
                var workout = this.model;
                workout.trigger("workout:move", this.model, newDay);
            }
        },
        
        onUploadFileClicked: function()
        {
            this.ui.fileinput.click();
        },
        
        onFileSelected: function()
        {

            this.$el.addClass("waiting");
            this.isNew = this.model.get("workoutId") ? false : true;

            var self = this;

            this.model.save().done(function()
            {
                var interval = setInterval(function()
                {
                    if (self.dataAsString)
                    {
                        clearInterval(interval);
                        self.uploadedFileDataModel = new WorkoutFileData({ workoutId: self.model.get("workoutId"), workoutDay: self.model.get("workoutDay"), startTime: self.model.get("startTime"), data: self.dataAsString });
                        self.uploadedFileDataModel.save().done(self.onUploadDone).fail(self.onUploadFail);
                        self.$el.addClass("waiting"); //temporary
                    }
                }, 100);
            });
            
            var fileList = this.ui.fileinput[0].files;

            var file = fileList[0];

            var reader = new FileReader();

            reader.onload = function (event)
            {
                function uint8ToString(buf)
                {
                    var i, length, out = '';
                    for (i = 0, length = buf.length; i < length; i += 1)
                    {
                        out += String.fromCharCode(buf[i]);
                    }
                    return out;
                }

                var data = new Uint8Array(event.target.result);
                self.dataAsString = btoa(uint8ToString(data));
            };

            reader.readAsArrayBuffer(file);
        },
        
        onUploadDone: function ()
        {
            this.$el.removeClass("waiting");

            this.model.set(this.uploadedFileDataModel.get("workoutModel"));
            if (this.isNew)
                this.trigger("saved");
        },

        onUploadFail: function ()
        {
            this.$el.removeClass("waiting");
        }

    });
});