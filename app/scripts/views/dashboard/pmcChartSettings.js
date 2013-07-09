define(
[
    "jqueryui/datepicker",
    "jqueryui/spinner",
    "setImmediate",
    "underscore",
    "TP",
    "views/dashboard/pmcChartUtils",
    "hbs!templates/views/dashboard/pmcChartSettings"
],
function(
    datepicker,
    spinner,
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

        initialize: function()
        {
            this.model.on("change:settings.dashboard.pmc.*", this.render, this);
        },

        events:
        {
            "click .workoutType input[type=checkbox]": "onWorkoutTypeSelected",
            "change #dateOptions": "onDateOptionsChanged",
            "change #startDate": "onDateOptionsChanged",
            "change #endDate": "onDateOptionsChanged",
            "change input[type=number]": "onNumberOptionsChanged"
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
            this.saveSettings();
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
            pmcSettings.workoutTypes = [];
            _.each(TP.utils.workout.types.typesById, function(typeName, typeId)
            {

                var workoutType = {
                    id: typeId,
                    name: typeName,
                    selected: _.contains(pmcSettings.workoutTypeIds, typeId) ? true : false
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
                     _.each(TP.utils.workout.types.typesById, function(typeName, typeId)
                    {

                         workoutTypeIds.push(typeId);
                     });
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

            this.model.set("settings.dashboard.pmc.workoutTypeIds", workoutTypeIds);
        },

        onDateOptionsChanged: function(e)
        {
            this.focusedInputId = e.target.id;
            var optionId = this.$("#dateOptions").val();

            var pmcOptions = {
                quickDateSelectOption: optionId,
                startDate: this.$("#startDate").val(),
                endDate: this.$("#endDate").val()
            };

            pmcOptions = pmcChartUtils.buildPmcParameters(pmcOptions);

            this.model.set("settings.dashboard.pmc.startDate", pmcOptions.customStartDate ? moment(pmcOptions.startDate).utc().unix() * 1000 : null, { silent: true });
            this.model.set("settings.dashboard.pmc.endDate", pmcOptions.customEndDate ? moment(pmcOptions.endDate).utc().unix() * 1000 : null, { silent: true });
            this.model.set("settings.dashboard.pmc.quickDateSelectOption", optionId);
        },

        onNumberOptionsChanged: function(e)
        {
            var inputId = e.target.id;
            this.focusedInputId = inputId;
            var value = $(e.target).val();
            this.model.set("settings.dashboard.pmc." + inputId, value);
        }

    });
});