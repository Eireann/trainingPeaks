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
            this.index = options && options.hasOwnProperty("index") ? options.index : 0;
            this.settingsKey = "settings.dashboard.pods." + this.index;

            this.on("render", this.setupDatePicker, this);
            this.once("render", this.stopWatchingModelChanges, this);
            this.on("close", this.cleanupDatePicker, this);
            this.on("close", this.saveOnClose, this);
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

        stopWatchingModelChanges: function()
        {
            this.model.off("change", this.render);
        },

        saveOnClose: function()
        {
            this.saveSettings();
            this.trigger("change:settings");
        },

        saveSettings: function()
        {
            this.model.save();
        },

        serializeData: function()
        {
            var dashboardChartSettings = this.model.has(this.settingsKey) ? _.clone(this.model.get(this.settingsKey)) : {};
            dashboardChartSettings = chartUtils.buildChartParameters(dashboardChartSettings);
            this.addWorkoutTypesToData(dashboardChartSettings);
            return dashboardChartSettings;
        },

        addWorkoutTypesToData: function(dashboardChartSettings)
        {
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

        },

        setTomahawkDirection: function(direction)
        {
            this.$el.removeClass("left").removeClass("right").addClass(direction);
        },

        alignArrowTo: function(top)
        {

            // make sure we're fully on the screen
            var windowBottom = $(window).height() - 10;
            this.top(top - 25);
            var myBottom = this.$el.offset().top + this.$el.height();

            if(myBottom > windowBottom)
            {
                var arrowOffset = (myBottom - windowBottom) + 30;
                this.top(windowBottom - this.$el.height());
                this.$(".arrow").css("top", arrowOffset + "px");
            }
        }

    };

    return DashboardChartSettingsBase;
});