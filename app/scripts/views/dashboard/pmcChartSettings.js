define(
[
    "jqueryui/datepicker",
    "jqueryui/spinner",
    "jquerySelectBox",
    "setImmediate",
    "underscore",
    "TP",
    "views/dashboard/pmcChartUtils",
    "hbs!templates/views/dashboard/pmcChartSettings"
],
function(
    datepicker,
    spinner,
    jquerySelectBox,
    setImmediate,
    _,
    TP,
    pmcChartUtils,
    pmcChartSettingsTemplate
    )
{
    return TP.ItemView.extend(
    {

        modal: true,
        showThrobbers: false,
        tagName: "div",
        className: "pmcChartSettings",

        template:
        {
            type: "handlebars",
            template: pmcChartSettingsTemplate
        },

        initialize: function(options)
        {
            this.model.on("change:settings.dashboard.pmc.*", this.render, this);

            this.$el.addClass(options.direction);
        },

        events:
        {
            "click .workoutType input[type=checkbox]": "onWorkoutTypeSelected",
            "change #dateOptions": "onDateOptionsChanged",
            "change #startDate": "onDateOptionsChanged",
            "change #endDate": "onDateOptionsChanged",
            "change input[type=number]": "onNumberOptionsChanged",
            "blur input[type=number]": "onNumberOptionsChanged",
            "click input[type=checkbox].chartSeriesOption": "onChartSeriesOptionChanged",
            "click #closeIcon": "close"
        },

        onRender: function()
        {
            this.model.off("change", this.render);

            var self = this;
            setImmediate(function()
            {
                self.$(".datepicker").css("position", "relative").css("z-index", self.$el.css("z-index"));
                self.$(".datepicker").datepicker({ dateFormat: "yy-mm-dd", firstDay: theMarsApp.controllers.calendarController.startOfWeekDayIndex });
            });

            // setup number picker, and make sure it fires a change event
            this.$("input[type=number]").spinner().on("spinstop", function(event, ui) { $(this).trigger("change", event, ui); });

            // setup dropdown styling
            this.$("#dateOptions").selectBoxIt({
                dynamicPositioning: false
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

        onClose: function()
        {
            this.model.off("change:settings.dashboard.pmc.*", this.render, this);
            if(this.hasChangedSettings)
            {
                this.saveSettings();
                this.trigger("change:settings");
            }
        },

        saveSettings: function()
        {
            this.model.save();
        },

        serializeData: function()
        {
            var pmcSettings = this.model.has("settings.dashboard.pmc") ? this.model.toJSON().settings.dashboard.pmc : {};
            pmcSettings = pmcChartUtils.buildPmcParameters(pmcSettings);

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
            _.each(pmcChartUtils.pmcDateOptions, function(option)
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
                workoutTypeIds = _.clone(this.model.get("settings.dashboard.pmc.workoutTypeIds"));
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

            this.model.set("settings.dashboard.pmc.workoutTypeIds", workoutTypeIds);
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

            pmcOptions = pmcChartUtils.buildPmcParameters(pmcOptions);

            this.model.set("settings.dashboard.pmc.startDate", pmcOptions.customStartDate ? moment(pmcOptions.startDate).format("YYYY-MM-DD") + "T00:00:00Z" : null, { silent: true });
            this.model.set("settings.dashboard.pmc.endDate", pmcOptions.customEndDate ? moment(pmcOptions.endDate).format("YYYY-MM-DD") + "T00:00:00Z" : null, { silent: true });
            this.model.set("settings.dashboard.pmc.quickDateSelectOption", optionId);
        },

        onNumberOptionsChanged: function(e)
        {
            var inputId = e.target.id;

            if (e.type !== "blur" && e.type !== "focusout")
            {
                this.focusedInputId = inputId;
            }

            var modelKey = "settings.dashboard.pmc." + inputId;
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
           
            this.model.set("settings.dashboard.pmc." + optionId, checked);
        },

        setDirection: function(direction)
        {
            this.$el.removeClass("left").removeClass("right").addClass(direction);
        }

    });
});