define(
[
    "jqueryui/spinner",
    "underscore",
    "TP",
    "backbone",
    "dashboard/views/chartSettingsView",
    "views/dashboard/dashboardDatePicker",
    "dashboard/views/chartWorkoutOptionsView",
    "hbs!dashboard/templates/peaksChartSettings"
],
function(
    spinner,
    _,
    TP,
    Backbone,
    ChartSettingsView,
    DashboardDatePicker,
    ChartWorkoutOptionsView,
    peaksChartSettingsTemplate
    )
{

    var PeaksChartSettingsView = ChartSettingsView.extend({

        className: ChartSettingsView.prototype.className + " peaksChartSettings",

        template:
        {
            type: "handlebars",
            template: peaksChartSettingsTemplate
        },

        events: _.extend(
        {
            "change input.auto": "_onInputsChanged"
        }, ChartSettingsView.prototype.events),

        modelEvents:
        {
            "change": "_refreshView"
        },

        onRender: function()
        {
            var self = this;

            this._addView(".dateOptionsRegion", new DashboardDatePicker({
                model: this.model
            }));
            this.comparisonDatePicker = new DashboardDatePicker({
                model: this.model,
                key: "comparisonDateOptions"
            });
            this._addView(".comparisonDateOptionsRegion", this.comparisonDatePicker);
            this._addView(".workoutTypesRegion", new ChartWorkoutOptionsView({
                model: this.model
            }));

            this.children.call("render");

            this.$('input.auto[type="checkbox"]').each(function(i, el)
            {
                var $el = $(el);
                $el.attr("checked", self.model.get($el.attr("name")));
            });

            this.$('input.auto[type="text"]').each(function(i, el)
            {
                var $el = $(el);
                $el.val(self.model.get($el.attr("name")));
            });

            this._refreshView();
        },

        _onInputsChanged: function()
        {
            var self = this;

            this.$('input.auto[type="checkbox"]').each(function(i, el)
            {
                var $el = $(el);
                self.model.set($el.attr("name"), $el.prop("checked"));
            });

            this.$('input.auto[type="text"]').each(function(i, el)
            {
                var $el = $(el);
                self.model.set($el.attr("name"), $el.val());
            });
        },

        _refreshView: function()
        {
            if(this.model.get("useComparison"))
            {
                this.comparisonDatePicker.enable();
            }
            else
            {
                this.comparisonDatePicker.disable();
            }

            this.$(".defaultTitle").text(_.result(this.model, "defaultTitle"));
        }
    });

    return PeaksChartSettingsView;

});
