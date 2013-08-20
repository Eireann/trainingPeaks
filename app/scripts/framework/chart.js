define(
[
    "backbone.marionette",
    "TP",
    "utilities/charting/jquery.flot.pie",
    "views/dashboard/chartUtils"
],
function(
    Marionette,
    TP,
    flotPiePlugin,
    DashboardChartUtils
)
{   
    var Chart = TP.Model.extend({

        constructor: function(attributes, options)
        {
            if(!options.dataManager)
            {
                throw new Error("Chart requires a reporting datamanager");    
            }
            TP.Model.apply(this, arguments);
            this._setDefaultDateSettings();
            this.dataManager = options.dataManager;
        },

        createChartSettingsView: function()
        {
            if(!this.settingsView)
            {
                throw new Error("TP.Chart requires a settingsView class");
            }
            return new this.settingsView({ model: this });
        },

        // returns a deferred, resolves the deferred with chart options
        buildChart: function()
        {
            this.updateChartTitle();
            var xhr = this.fetchData();
            var deferred = new $.Deferred();

            var self = this;
            xhr.done(function(data)
            {
                deferred.resolve(self.parseData(data));
            }).fail(function()
            {
                deferred.reject();
            });
            
            return deferred; 
        },

        updateChartTitle: function()
        {
            return;
        },

        getChartName: function()
        {
            return "Chart";
        },

        buildWorkoutTypesTitle: function(workoutTypeIds)
        {

            var workoutTypeNames = [];

            if (!workoutTypeIds || !workoutTypeIds.length || workoutTypeIds.length === _.keys(TP.utils.workout.types.typesById).length)
            {
                workoutTypeNames.push("All");
            } else
            {
                _.each(workoutTypeIds, function(item, index)
                {
                    var intItem = parseInt(item, 10);
                    var workoutType = intItem === 0 ? "All" : TP.utils.workout.types.getNameById(intItem);
                    if(workoutType !== "Unknown")
                    {
                        workoutTypeNames.push(workoutType); 
                    }

                }, this);
            }

            var types = workoutTypeNames.join(", ");
            if (!types)
            {
                types = "All Workout Types";
            }
            return types;
        },
        
        _setDefaultDateSettings: function()
        {
            var defaultDateOption = DashboardChartUtils.chartDateOptions.USE_GLOBAL_DATES.id;
            var defaultSettings = { startDate: null, endDate: null, quickDateSelectOption: defaultDateOption };
            var mergedSettings = _.extend(defaultSettings, this.get("dateOptions"));
            if(!mergedSettings.quickDateSelectOption)
            {
                mergedSettings.quickDateSelectOption = defaultDateOption;
            }
            this.set("dateOptions", mergedSettings, { silent: true });
        }

    });

    return Chart;
});