define(
[
    "underscore",
    "TP",
    "utilities/stickitMixin"
],
function(
    _,
    TP,
    stickitUtilsMixin
)
{

    var stickitBindingsMixin = {

        initializeStickit: function()
        {
            this.on("render", this.stickitOnRender, this);
        },

        stickitOnRender: function()
        {
            if (!this.stickitInitialized)
            {
                this.buildTimeInZonesBindings();
                this.buildPeaksBindings();
                this.stickit();
                this.stickitInitialized = true;
            }
        },

        bindings: {

        },

        buildTimeInZonesBindings: function()
        {
            var timeInZones = this.getOrCreateTimeInZones();
            _.each(timeInZones.timeInZones, function(timeInZone, index)
            {
                var inputFieldCssId = "#timeInZone" + index;
                var modelFieldName = "timeInHeartRateZones.timeInZones." + index + ".seconds";

                this.bindings[inputFieldCssId] =
                {
                    observe: modelFieldName,
                    onGet: "formatDurationFromSeconds",
                    onSet: "parseDurationAsSeconds",
                    updateModel: "updateModel"
                };
            }, this);
        },

        buildPeaksBindings: function()
        {
            var peaks = this.getPeaksData();
            _.each(peaks, function(peak, index)
            {
                var inputFieldCssId = "#" + peak.id;
                var modelFieldName = "meanMaxHeartRate." + peak.modelArrayIndex + ".value";

                this.bindings[inputFieldCssId] =
                {
                    observe: modelFieldName,
                    onGet: "formatInteger",
                    onSet: "parseInteger",
                    updateModel: "updateModel"
                };
            }, this);
        }

    };

    _.extend(stickitBindingsMixin, stickitUtilsMixin);
    return stickitBindingsMixin;

});