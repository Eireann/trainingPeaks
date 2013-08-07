define(
[
    "jqueryui/datepicker",
    "jquerySelectBox",
    "setImmediate",
    "underscore",
    "TP",
    "views/dashboard/chartUtils",
    "hbs!templates/views/dashboard/dashboardDatePicker"
],
function(
    datepicker,
    jquerySelectBox,
    setImmediate,
    _,
    TP,
    chartUtils,
    datepickerTemplate
    )
{
    return TP.ItemView.extend(
    {
        tagName: "div",
        className: "dashboardDatePicker",

        template:
        {
            type: "handlebars",
            template: datepickerTemplate
        },

        initialize: function(options)
        {
            if(!options.hasOwnProperty("settingsKey") || !theMarsApp.user.has(options.settingsKey))
            {
                throw "Dashboard Date Picker requires a valid settings key";
            }

            this.watchForDateOptionChanges();
        },

        watchForDateOptionChanges: function()
        {
            this.model.on("change:" + this.settingsKey + ".startDate", this.render, this);
            this.model.on("change:" + this.settingsKey + ".endDate", this.render, this);
            this.model.on("change:" + this.settingsKey + ".quickDateSelectOption", this.render, this);

            this.on("close", function()
            {
                this.model.off("change:" + this.settingsKey + ".startDate", this.render, this);
                this.model.off("change:" + this.settingsKey + ".endDate", this.render, this);
                this.model.off("change:" + this.settingsKey + ".quickDateSelectOption", this.render, this);
            }, this);
        }

        events:
        {
            "change #dateOptions": "onDateOptionsChanged",
            "change #startDate": "onDateOptionsChanged",
            "change #endDate": "onDateOptionsChanged"
        },

        onRender: function()
        {
            this.model.off("change", this.render);

            var self = this;
            setImmediate(function()
            {
                self.$(".datepicker").css("position", "relative").css("z-index", self.$el.css("z-index"));
                self.$(".datepicker").datepicker({ dateFormat: "yy-mm-dd", firstDay: theMarsApp.controllers.calendarController.startOfWeekDayIndex });
                self.$("#dateOptions").selectBoxIt({dynamicPositioning: false});
            });

            if(this.focusedInputId)
            {
                setImmediate(function()
                {
                    self.$("#" + self.focusedInputId).focus();
                    self.focusedInputId = null;
                });
            }

        },

        serializeData: function()
        {
            var dateSettings = this.model.has(this.settingsKey) ? this.model.toJSON().settings.dashboard.pods[this.index] : {};
            
            pmcSettings = chartUtils.buildChartParameters(pmcSettings);

            var allSelected = true;
            var forceAllSelected = _.contains(pmcSettings.workoutTypeIds, 0) || _.contains(pmcSettings.workoutTypeIds, "0") ? true : false;

            pmcSettings.workoutTypes = [];
            _.each(TP.utils.workout.types.typesById, function(typeName, typeId)
            {

                var workoutType = {
                    id: typeId,
                    name: typeName,
                    selected: forceAllSelected || _.contains(pmcSettings.workoutTypeIds, typeId) ? true : false
                };
                pmcSettings.workoutTypes.push(workoutType);

                if(!workoutType.selected)
                {
                    allSelected = false;
                }
            });

            pmcSettings.workoutTypes.push({
                id: 0,
                name: "Select All",
                selected: allSelected ? true : false
            });

            pmcSettings.dateOptions = [];
            var selectedOptionId = Number(pmcSettings.quickDateSelectOption);
            _.each(chartUtils.chartDateOptions, function(option)
            {
                pmcSettings.dateOptions.push({
                    id: option.id,
                    label: option.label,
                    selected: option.id === selectedOptionId
                });
            });

            return pmcSettings;
        },

        onWorkoutTypeSelected: function(e)
        {
            this.hasChangedSettings = true;
            var checkbox = $(e.target);

            // the current settings are strings, but somehow checkbox.data gives us an int
            var workoutTypeId = "" + checkbox.data("workouttypeid");
            var checked = checkbox.is(":checked");
            
            var workoutTypeIds = [];
          
            // select all
            if (workoutTypeId === "0")
            {
                if(checked)
                {
                    workoutTypeIds.push("0");
                }
            } else
            {
                workoutTypeIds = _.clone(this.model.get(this.settingsKey + ".workoutTypeIds"));
                var inList = _.contains(workoutTypeIds, workoutTypeId);

                if (checked && !inList)
                {
                    workoutTypeIds.push(workoutTypeId);
                } else if (!checked && inList)
                {
                    workoutTypeIds = _.without(workoutTypeIds, workoutTypeId);
                }
            }

            if (workoutTypeIds.length === TP.utils.workout.types.typesById.length)
            {
                workoutTypeIds = ["0"];
            }

            this.model.set(this.settingsKey + ".workoutTypeIds", workoutTypeIds);
        },

        onDateOptionsChanged: function(e)
        {
            this.hasChangedSettings = true;
            this.focusedInputId = e.target.id;
            var optionId = this.$("#dateOptions").val();

            var pmcOptions = {
                quickDateSelectOption: optionId,
                startDate: this.$("#startDate").val(),
                endDate: this.$("#endDate").val()
            };

            pmcOptions = chartUtils.buildChartParameters(pmcOptions);

            this.model.set(this.settingsKey + ".startDate", pmcOptions.customStartDate ? moment(pmcOptions.startDate).format("YYYY-MM-DD") + "T00:00:00Z" : null, { silent: true });
            this.model.set(this.settingsKey + ".endDate", pmcOptions.customEndDate ? moment(pmcOptions.endDate).format("YYYY-MM-DD") + "T00:00:00Z" : null, { silent: true });
            this.model.set(this.settingsKey + ".quickDateSelectOption", optionId);
        },

        onNumberOptionsChanged: function(e)
        {
            var inputId = e.target.id;

            if (e.type !== "blur" && e.type !== "focusout")
            {
                this.focusedInputId = inputId;
            }

            var modelKey = this.settingsKey + "." + inputId;
            var newValue = $(e.target).val();
            var existingValue = this.model.get(modelKey);
            var adjustedValue = this.adjustNumericInput(inputId, newValue, existingValue);

            console.log(inputId + " changed to " + adjustedValue);
            if(adjustedValue === existingValue)
            {
                $(e.target).val(adjustedValue);
            } else
            {
                this.hasChangedSettings = true;
                this.model.set(modelKey, adjustedValue);
            }
        },

        numericRanges: {
            ctlConstant: {
                min: 7,
                max: 200
            },
            ctlStartValue: {
                min: 0,
                max: 500
            },
            atlConstant: {
                min: 1,
                max: 40
            },
            atlStartValue: {
                min: 0,
                max: 500
            }
        },

        adjustNumericInput: function(inputId, newValue, oldValue)
        {
            var numberValue = Number(newValue);

            if(_.isNaN(numberValue))
            {
                return oldValue;
            }

            if(numberValue < this.numericRanges[inputId].min)
            {
                return this.numericRanges[inputId].min;
            }

            if (numberValue > this.numericRanges[inputId].max)
            {
                return this.numericRanges[inputId].max;
            }

            return numberValue;
        },

        onChartSeriesOptionChanged: function(e)
        {
            var checkbox = $(e.target);

            // the current settings are strings, but somehow checkbox.data gives us an int
            var optionId = checkbox.attr("id");
            var checked = checkbox.is(":checked");
           
            this.model.set(this.settingsKey + "." + optionId, checked);
        },

        setDirection: function(direction)
        {
            this.$el.removeClass("left").removeClass("right").addClass(direction);
        }

    });
});