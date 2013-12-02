define(
[
    "jquery",
    "underscore",
    "backbone.marionette",
    "TP",
    "utilities/charting/jquery.flot.pie",
    "jquery.flot.orderBars",
    "views/dashboard/chartUtils",
    "dashboard/views/dashboardChartPodView"
],
function(
    $,
    _,
    Marionette,
    TP,
    flotPiePlugin,
    flotOrderBarsPlugin,
    DashboardChartUtils,
    DashboardChartPodView
)
{   
    var Chart = TP.Model.extend(
    {
        constructor: function(attributes, options)
        {
            if(!options.dataManager)
            {
                throw new Error("Chart requires a reporting datamanager");    
            }
            TP.Model.apply(this, arguments);
            this.initializeDateSettings();
            this.dataManager = options.dataManager;
            this.listenTo(this.dataManager, "reset", _.bind(function(){
                this.trigger("dataManagerReset");
            }, this));
        },

        createSettingsView: function()
        {
            if(!this.settingsView)
            {
                throw new Error("TP.Chart requires a settingsView class");
            }
            return new this.settingsView({ model: this });
        },

        createContentView: function(options)
        {
            return new DashboardChartPodView(_.extend({ model: this }, options));
        },

        /*
            Optional
            Should return a modal view or other view that positions itself and closes itself as needed
        */
        createItemDetailView: function(item)
        {
            return null;
        },

        // returns a deferred, resolves the deferred with chart options
        buildChart: function()
        {
            var xhr = this.fetchData();
            var deferred = new $.Deferred();

            var self = this;
            $.when(xhr).done(function(data) // Might be more than one argument...
            {
                deferred.resolve(self.parseData.apply(self, arguments));
            }).fail(function()
            {
                deferred.reject();
            });
            
            return deferred; 
        },

        // Should be overridden to fetch data from server.
        // Should return a jquery deferred/jqXHR.
        fetchData: function()
        {
            return;
        },

        // Takes the results of fetchData.
        // Should return the flot data and options or null if no data is
        // available.
        parseData: function(data)
        {
            return;
        },

        defaultTitle: function()
        {
            return "";
        },

        getChartName: function()
        {
            return "Chart";
        },

        initializeDateSettings: function(key)
        {
            key = key || "dateOptions";
            var defaultDateOption = DashboardChartUtils.chartDateOptions.USE_GLOBAL_DATES.id;
            var defaultSettings = { startDate: null, endDate: null, quickDateSelectOption: defaultDateOption };
            var mergedSettings = _.extend(defaultSettings, this.get(key));
            if(!mergedSettings.quickDateSelectOption)
            {
                mergedSettings.quickDateSelectOption = defaultDateOption;
            }
            this.set(key, mergedSettings, { silent: true });
        }

    });

    return Chart;
});
