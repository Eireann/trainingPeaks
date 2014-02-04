define(
[
    "jquery",
    "underscore",
    "TP"
],
function (
    $,
    _,
    TP
)
{

    var summaryViewUserCustomization = {

        initializeUserCustomization: function ()
        {
            this.model.on("change:workoutDay change:workoutTypeValueId", this.updateUICustomization, this);
            this.on("close", this.userCustomizationOnClose, this);
            this.on("render", this.userCustomizationOnRender, this);
        },

        userCustomizationOnClose: function ()
        {
            this.model.off("change:workoutDay change:workoutTypeValueId", this.updateUICustomization);
        },

        userCustomizationOnRender: function ()
        {
            if (!this.userCustomizationInitialized)
            {
                this.applyUICustomization();
                this.userCustomizationInitialized = true;
            }
        },

        updateUICustomization: function ()
        {
            this.unstickit();
            this.applyUICustomization();
            this.stickit();
        },

        applyUICustomization: function ()
        {
            this.applyGhostingForFuture();
            this.applyUserPreferences();
        },

        applyGhostingForFuture: function ()
        {
            if (TP.utils.datetime.isFuture(this.model.getCalendarDay()))
            {
                this.$(".workoutStatsCompleted input").attr("disabled", true);
                this.$("#workoutMinMaxAvgStats input").attr("disabled", true);
                //apply ghost css attribute
                //this all needs refactored
                this.$("label.workoutStatsCompleted").addClass("ghosted");
                this.$(".columnLabelsMinMaxAvg label").addClass("ghosted");
                this.$("#workoutMinMaxAvgStats label").addClass("ghosted");
                this.$("#workoutMinMaxAvgStats").addClass("ghosted");
            }
            else
            {
                this.$(".workoutStatsCompleted input").attr("disabled", false);
                this.$("#workoutMinMaxAvgStats input:not(.alwaysDisabled)").attr("disabled", false);
                //apply ghost css attribute
                //this all needs refactored
                this.$("label.workoutStatsCompleted").removeClass("ghosted");
                this.$(".columnLabelsMinMaxAvg label").removeClass("ghosted");
                this.$("#workoutMinMaxAvgStats label").removeClass("ghosted");
                this.$("#workoutMinMaxAvgStats").removeClass("ghosted");
            }
        },

        applyUserPreferences: function ()
        {
            this.saveFocusedInputId();

            var statsTree = this.$("#workoutPlannedCompletedStats");
            var summaryTree = this.$("#workoutMinMaxAvgStats");

            var statsTreeClone = statsTree.clone();
            var summaryTreeClone = summaryTree.clone();

            this.applyPreferencesSort(statsTreeClone, summaryTreeClone);
            this.applyPlannedFieldOverrides(statsTreeClone);

            statsTree.replaceWith(statsTreeClone);
            summaryTree.replaceWith(summaryTreeClone);

            this.refocusLastInput();
        },

        saveFocusedInputId: function()
        {
            // don't lose focus for edit/tab
            this.focusedInputId = this.$("input:focus").length ? this.$("input:focus").attr("id") : null;
        },

        refocusLastInput: function()
        {
            if(this.focusedInputId)
            {
                this.$("#" + this.focusedInputId).focus();
            }
        },

        applyPreferencesSort: function (statsTree, summaryTree)
        {

            var workoutOrderPreferences = theMarsApp.user.getWorkoutSettings().get("layout")[this.model.get("workoutTypeValueId")];

            //Reset visibility
            statsTree.find(".workoutStatsRow").addClass("hide");
            summaryTree.find(".workoutStatsRow").addClass("hide");

            //Process stats and summary order area
            var statsAnchor = statsTree.find("#workoutStatsAnchor");
            var summaryAnchor = summaryTree.find("#workoutSummaryAnchor");
            var summaryRowCount = 0;
            _.each(workoutOrderPreferences, function (orderPreference, index)
            {
                var stat = TP.utils.workout.layoutFormatter.quickViewLayout[orderPreference];
                var statRow = statsTree.find("." + stat + "StatsRow");

                if (statRow.length)
                {
                    statRow.insertBefore(statsAnchor).removeClass("hide");
                }

                var summaryRow = summaryTree.find("." + stat + "SummaryRow");
                
                if (summaryRow.length)
                {
                    summaryRow.insertBefore(summaryAnchor).removeClass("hide");
                    summaryRowCount++;
                }

                
            }, this);

            if (summaryRowCount === 0)
            {
                this.$(".columnLabelsMinMaxAvg").addClass("hide");
            }
        },

        applyPlannedFieldOverrides: function (statsTree)
        {
            var inputsStillHidden = statsTree.find(".workoutStatsRow.hide .workoutStatsPlanned input");

            var self = this;
            inputsStillHidden.each(function ()
            {
                var binding = self.bindings["#" + this.id];
                if (binding)
                {
                    var modelValue = self.model.get(binding.observe);
                    if (modelValue)
                    {
                        $(this).closest(".workoutStatsRow").removeClass("hide");
                    }
                }
            });
        }

    };

    return summaryViewUserCustomization;
});
