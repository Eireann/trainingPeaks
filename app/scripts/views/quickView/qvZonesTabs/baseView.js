define(
[
    "underscore",
    "./timeInZones",
    "./peaks",
    "./stickitBindings",
    "hbs!templates/views/quickView/zonesTab/zonesTabView"
],
function(
    _,
    timeInZonesMixin,
    peaksMixin,
    stickitMixin,
    zonesTabTemplate
)
{
    var zonesViewBase =
    {

        template:
        {
            type: "handlebars",
            template: zonesTabTemplate
        },

        events: 
        {
            "click .chart.disabled": "_showUpgradePrompt"
        },

        initialEvents: function()
        {
            this.model.off("change", this.render);
        },

        initializeBaseView: function(options)
        {
            this.workoutModel = options.workoutModel;
            this.initializeTimeInZones();
            this.initializePeaks();
            this.initializeStickit();
            this.once("render", this.onInitialRender, this);
        },

        onInitialRender: function()
        {
            this.watchForWorkoutTypeChange();
        },

        // only on full update from server, won't happen on every small stickit change
        reRenderOnChange: function(model, updateData, options)
        {
            if (!options["alreadyRendered" + this.metric + "Tab"])
            {
                this.reRender();
                options["alreadyRendered" + this.metric + "Tab"] = true;
            }
        },

        watchForWorkoutTypeChange: function()
        {
            this.workoutModel.on("change:workoutTypeValueId", this.onWorkoutTypeChange, this);
            this.on("close", function() { this.workoutModel.off("change:workoutTypeValueId", this.onWorkoutTypeChange); }, this);
        },

        onWorkoutTypeChange: function()
        {
            // after it changes and saves, update our details
            this.workoutModel.once("sync", function()
            {
                var self = this;
                this.model.fetch().always(function(){self.reRender();});
            }, this);
        },

        reRender: function()
        {
            this.unstickit();
            this.stickitInitialized = false;
            this.render();
        },

        serializeData: function()
        {
            return {
                graphClass: this.graphTitle.replace(/\s/g,""),
                graphTitle: this.graphTitle
            };
        },

        _showUpgradePrompt: function()
        {
            theMarsApp.featureAuthorizer.showUpgradeMessage({ slideId: "enhanced-analysis" });
        }

    };
    _.extend(zonesViewBase, timeInZonesMixin);
    _.extend(zonesViewBase, peaksMixin);
    _.extend(zonesViewBase, stickitMixin);
    return zonesViewBase;
});
