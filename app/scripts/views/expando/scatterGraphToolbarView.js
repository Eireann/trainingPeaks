define(
[
    "jquery",
    "underscore",
    "TP",
    "hbs!templates/views/expando/scatterGraphToolbar"
],
function(
         $,
         _,
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
            this.xaxis = options.xaxis;
            this.yaxis = options.yaxis;
            this.listenTo(this.model.get("detailData"), "reset", _.bind(this.render, this));
        },

        events:
        {
            "click button": "onGraphButtonClicked"
        },

        onGraphButtonClicked: function(e)
        {
            var $target = $(e.target);
            $target.siblings().addClass("seriesDisabled");
            $target.removeClass("seriesDisabled");
            this.trigger("scatterGraph:axisChange", {series: $target.data('series'), axis: $target.parent().data('axis')});
        },

        onRender: function()
        {
            this._updateButtonList();
        },

        _updateButtonList: function()
        {
            var self = this;
            var availableChannels = _.clone(this.model.get("detailData").get("availableDataChannels"));
            availableChannels.push("Time");
            this.$(".seriesButtons button").each(function()
            {
                var $button = $(this);
                var axis = $button.parent().data("axis");
                var seriesName = $button.data("series");
                if(!_.contains(availableChannels, seriesName))
                {
                    $button.remove();
                }
                else
                {
                    if(axis === "x")
                    {
                        if(seriesName === self.xaxis)
                        {
                            $button.removeClass("seriesDisabled");
                        }
                    }
                    else
                    {
                        if(seriesName === self.yaxis)
                        {
                            $button.removeClass("seriesDisabled");
                        }
                    }
                }
            });
        },

        serializeData: function()
        {
            // Grab speed label based _on model workout type
            var speedLabel = this.model ? TP.utils.units.getUnitsLabel("speed", this.model.get("workoutTypeValueId")) : "MPH";
            var elevationLabel = this.model ? TP.utils.units.getUnitsLabel("elevation", this.model.get("workoutTypeValueId")) : "FT";
            var cadenceLabel = this.model ? TP.utils.units.getUnitsLabel("cadence", this.model.get("workoutTypeValueId")) : "RPM";
            var tempLabel = this.model ? TP.utils.units.getUnitsLabel("temperature", this.model.get("workoutTypeValueId")) : "F";
            var torqueLabel = this.model ? TP.utils.units.getUnitsLabel("torque", this.model.get("workoutTypeValueId")) : "IN-LBS";

            // Some workout type speeds need to be shown as "pace" units
            if (this.model && _.contains([1,3,12,13], this.model.get("workoutTypeValueId")))
            {
                speedLabel = TP.utils.units.getUnitsLabel("pace", this.model.get("workoutTypeValueId"));
            }
            return {
                speedLabel: speedLabel,
                elevationLabel: elevationLabel,
                cadenceLabel: cadenceLabel,
                torqueLabel: torqueLabel,
                tempLabel: tempLabel
            };
        }
    });
});
