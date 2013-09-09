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
        showDatePicker: true,

        template:
        {
            type: "handlebars",
            template: dashboardChartSettingsTemplate
        },

        initialize: function(options)
        {
            this.on("render", this.setupDatePicker, this);
            this.once("render", this.stopWatchingModelChanges, this);
            this.on("close", this.cleanupDatePicker, this);
            this.on("close", this.saveOnClose, this);
        },

        events:
        {
            "click .closeIcon": "close"
        },

        setupDatePicker: function()
        {
            if(this.showDatePicker)
            {
                if(!this.datepickerView)
                {
                    this.datepickerView = new DashboardDatePicker({ model: this.model });
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
        },

        saveSettings: function()
        {
            this.model.save();
        },

        serializeData: function()
        {
            var dashboardChartSettings = _.clone(this.model.attributes);
            //dashboardChartSettings = chartUtils.buildChartParameters(dashboardChartSettings);
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

            // if we're at the top of the screen, adjust down by a couple px
            if(top < 25)
            {
                this.top(2);
                this.$(".arrow").css("top", "26px");
            } else {
                // make sure we're fully on the screen and align the arrow
                this.top(top - 25);
                
                var myBottom = this.$el.offset().top + this.$el.height();

                var windowBottom = $(window).height() - 10;
                if(myBottom > windowBottom)
                {
                    var arrowOffset = (myBottom - windowBottom) + 31;
                    this.top(windowBottom - this.$el.height());
                    this.$(".arrow").css("top", arrowOffset + "px");
                }
            }
        },

        setSetting: function(key, value, options)
        {
            return this.model.set(key, value, options);
        },

        getSetting: function(key)
        {
            return this.model.get(key);
        }

    };

    return DashboardChartSettingsBase;
});