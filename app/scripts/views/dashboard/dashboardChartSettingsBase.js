define(
[
    "jqueryui/datepicker",
    "jquerySelectBox",
    "setImmediate",
    "underscore",
    "TP",
    "./dashboardDatePicker",
    "views/dashboard/chartUtils",
    "hbs!templates/views/dashboard/dashboardChartSettings"
],
function(
    datepicker,
    jquerySelectBox,
    setImmediate,
    _,
    TP,
    DashboardDatePicker,
    chartUtils,
    dashboardChartSettingsTemplate
    )
{
    var DashboardChartSettingsBase = {

        modal: true,
        showThrobbers: false,
        tagName: "div",
        className: "dashboardChartSettings",
        index: 0,
        showDatePicker: true,

        template:
        {
            type: "handlebars",
            template: dashboardChartSettingsTemplate
        },

        initialize: function(options)
        {
            this.setTomahawkDirection(options.direction);
            this.index = options && options.hasOwnProperty("index") ? options.index : 0;
            this.settingsKey = "settings.dashboard.pods." + this.index;
            this.model.on("change:" + this.settingsKey + ".*", this.onSettingsChange, this);

            this.on("render", this.setupDatePicker, this);
            this.on("render", this.refocusLastInput, this);
            this.once("render", this.stopWatchingChanges, this);
            this.on("close", this.cleanupDatePicker, this);
            this.on("close", this.saveIfSettingsHaveChanged, this);

            this.setDefaultSettings();
        },

        events:
        {
            "click #closeIcon": "close"
        },

        setupDatePicker: function()
        {
            if(this.showDatePicker)
            {
                if(!this.datepickerView)
                {
                    this.datepickerView = new DashboardDatePicker({ model: this.model, settingsKey: this.settingsKey });
                }
                this.datepickerView.setElement(this.$(".datepickerContainer")).render();
            }
        },

        cleanupDatePicker: function()
        {
            if(this.datepickerView)
            {
                this.datepickerView.close();
            }
        },

        stopWatchingChanges: function()
        {
            this.model.off("change", this.render);
        },

        refocusLastInput: function()
        {
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

        saveIfSettingsHaveChanged: function()
        {
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
            var dashboardChartSettings = this.model.has(this.settingsKey) ? _.clone(this.model.get(this.settingsKey)) : {};
            dashboardChartSettings = chartUtils.buildChartParameters(dashboardChartSettings);

            var allSelected = true;
            var forceAllSelected = _.contains(dashboardChartSettings.workoutTypeIds, 0) || _.contains(dashboardChartSettings.workoutTypeIds, "0") ? true : false;

            dashboardChartSettings.workoutTypes = [];
            _.each(TP.utils.workout.types.typesById, function(typeName, typeId)
            {

                var workoutType = {
                    id: typeId,
                    name: typeName,
                    selected: forceAllSelected || _.contains(dashboardChartSettings.workoutTypeIds, typeId) ? true : false
                };
                dashboardChartSettings.workoutTypes.push(workoutType);

                if(!workoutType.selected)
                {
                    allSelected = false;
                }
            });

            dashboardChartSettings.workoutTypes.push({
                id: 0,
                name: "Select All",
                selected: allSelected ? true : false
            });

            return dashboardChartSettings;
        },

        setTomahawkDirection: function(direction)
        {
            this.$el.removeClass("left").removeClass("right").addClass(direction);
        },

        setDefaultSettings: function()
        {
            return; 
        }

    };

    return DashboardChartSettingsBase;
});