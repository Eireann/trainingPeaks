define(
[
    "jqueryui/datepicker",
    "jqueryui/spinner",
    "jquerySelectBox",
    "setImmediate",
    "underscore",
    "TP",
    "./dashboardDatePicker",
    "views/dashboard/chartUtils",
    "hbs!templates/views/dashboard/pmcChartSettings"
],
function(
    datepicker,
    spinner,
    jquerySelectBox,
    setImmediate,
    _,
    TP,
    DashboardDatePicker,
    chartUtils,
    pmcChartSettingsTemplate
    )
{
    return TP.ItemView.extend(
    {

        modal: true,
        showThrobbers: false,
        tagName: "div",
        className: "pmcChartSettings",
        index: 0,

        template:
        {
            type: "handlebars",
            template: pmcChartSettingsTemplate
        },

        initialize: function(options)
        {
            this.setTomahawkDirection(options.direction);
            this.index = options && options.hasOwnProperty("index") ? options.index : 0;
            this.settingsKey = "settings.dashboard.pods." + this.index;
            this.model.on("change:" + this.settingsKey + ".*", this.onSettingsChange, this);

            this.datepickerView = new DashboardDatePicker({ model: this.model, settingsKey: this.settingsKey });
        },

        events:
        {
            "click .workoutType input[type=checkbox]": "onWorkoutTypeSelected",
            "change input[type=number]": "onNumberOptionsChanged",
            "blur input[type=number]": "onNumberOptionsChanged",
            "click input[type=checkbox].chartSeriesOption": "onChartSeriesOptionChanged",
            "click #closeIcon": "close"
        },

        onRender: function()
        {
            this.model.off("change", this.render);
            this.datepickerView.setElement(this.$(".datepickerContainer")).render();

            // setup number picker, and make sure it fires a change event
            this.$("input[type=number]").spinner().on("spinstop", function(event, ui) { $(this).trigger("change", event, ui); });

            if(this.focusedInputId)
            {
                var self = this;
                setImmediate(function()
                {
                    self.$("#" + self.focusedInputId).focus();
                    self.focusedInputId = null;
                });
            }

        },

        onSettingsChange: function()
        {
            this.hasChangedSettings = true;
            this.render();
        },

        onClose: function()
        {
            this.datepickerView.close();
            this.model.off("change:" + this.settingsKey + ".*", this.onSettingsChange, this);
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
            var pmcSettings = this.model.has(this.settingsKey) ? this.model.toJSON().settings.dashboard.pods[this.index] : {};
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

        setTomahawkDirection: function(direction)
        {
            this.$el.removeClass("left").removeClass("right").addClass(direction);
        }

    });
});