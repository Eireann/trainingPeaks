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
            this.on("close", this.cleanupStickitOnClose, this);
        },

        stickitOnRender: function()
        {
            if (!this.stickitInitialized)
            {
                this.bindings = {};
                this.buildTimeInZonesBindings();
                this.buildPeaksBindings();
                this.stickit();
                this.stickitInitialized = true;
                this.model.on("change", this.triggerChangeForDiscardButton, this);
            }
        },

        cleanupStickitOnClose: function()
        {
            this.model.off("change", this.triggerChangeForDiscardButton, this);
        },

        buildTimeInZonesBindings: function()
        {
            var timeInZones = this.getOrCreateTimeInZones();
            _.each(timeInZones.timeInZones, function(timeInZone, index)
            {
                var inputFieldCssId = "#timeInZone" + index;
                var modelFieldName = "timeIn" + this.metric + "Zones.timeInZones." + index + ".seconds";

                var binding = {
                    observe: modelFieldName,
                    updateModel: "updateModel"
                };

                this.trigger("buildTimeInZoneStickitBinding", binding, timeInZone);

                this.bindings[inputFieldCssId] = binding;

            }, this);
        },

        buildPeaksBindings: function()
        {
            var peaks = this.getPeaksData();
            _.each(peaks, function(peak, index)
            {
                var inputFieldCssId = "#" + peak.id;
                var modelFieldName = "meanMax" + this.metric + "." + peak.modelArrayIndex + ".value";

                var binding = {
                    observe: modelFieldName,
                    updateModel: "updateModel"
                };

                this.trigger("buildPeakStickitBinding", binding, peak);

                this.bindings[inputFieldCssId] = binding;
            }, this);
        }

    };

    var stickitUtilsOverrides = {

        saveModel: function()
        {
            // existing workout? just save as usual
            if (this.model.get("workoutId"))
            {
                this.model.save();

                // new workout? save the workout first, then save the details
            } else
            {
                var self = this;
                this.workoutModel.save().done(function()
                {
                    self.model.save();
                });
            }
        }
    };

    _.extend(stickitBindingsMixin, stickitUtilsMixin);
    _.extend(stickitBindingsMixin, stickitUtilsOverrides);
    return stickitBindingsMixin;

});