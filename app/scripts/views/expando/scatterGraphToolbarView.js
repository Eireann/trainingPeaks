define(
[
    "TP",
    "hbs!templates/views/expando/scatterGraphToolbar"
],
function(
         TP,
         scatterGraphToolbarTemplate)
{
    return TP.ItemView.extend(
    {
        className: "graphToolbar cf",

        template:
        {
            type: "handlebars",
            template: scatterGraphToolbarTemplate
        },

        initialize: function(options)
        {
            if (!options.stateModel)
                throw new Error("stateModel is required for expando graph toolbar view");

            this.stateModel = options.stateModel;

            this.listenTo(this.model.get("detailData"), "change:disabledDataChannels", _.bind(this._updateButtonStates, this));
            this.listenTo(this.model.get("detailData"), "change:availableDataChannels", _.bind(this._updateButtonStates, this));
            this.listenTo(this.model.get("detailData"), "reset", _.bind(this.render, this));
        },

        events:
        {
            "click .graphXAxisButton": "onGraphButtonClicked",
            "click .graphYAxisButton": "onGraphButtonClicked"
        },

        onGraphDistanceButtonClicked: function ()
        {
            this.$el.find("button.graphTimeButton").removeClass("bold");
            this.$el.find("button.graphDistanceButton").addClass("bold");
            this.trigger("enableDistanceAxis");
        },

        onRender: function()
        {
            this._updateButtonStates();
        },

        _updateButtonStates: function()
        {

            var availableChannels = this.model.get("detailData").get("availableDataChannels");
            this.$(".graphSeriesButton").each(function()
            {
                var $self = $(this);
                var seriesName = $self.data("series");
                if(!_.contains(availableChannels, seriesName))
                {
                    $self.remove();
                }
            });

            this.$(".graphSeriesDisabled").removeClass("graphSeriesDisabled");
            _.each(this.model.get("detailData").get("disabledDataChannels"), function(channel)
            {
                this.$("button.graphSeriesButton[data-series=" + channel + "]").addClass("graphSeriesDisabled");
            }, this);

            if(!_.contains(availableChannels, "Distance"))
            {
                this.$(".graphDistanceButton").remove();
                this.$(".graphTimeButton").remove();
            }
        },

        serializeData: function()
        {
            // Grab speed label based on model workout type
            var speedLabel = this.model ? TP.utils.units.getUnitsLabel("speed", this.model.get("workoutTypeValueId")) : "MPH";
            var elevationlabel = this.model ? TP.utils.units.getUnitsLabel("elevation") : "FT";

            // Some workout type speeds need to be shown as "pace" units
            if (this.model && _.contains([1,3,12,13], this.model.get("workoutTypeValueId")))
            {
                speedLabel = TP.utils.units.getUnitsLabel("pace", this.model.get("workoutTypeValueId"));
            }
            return {
                speedLabel: speedLabel,
                elevationLabel: elevationlabel
            };
        }
    });
});