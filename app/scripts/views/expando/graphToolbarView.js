define(
[
    "jquery",
    "underscore",
    "TP",
    "views/expando/graphSeriesOptionsMenuView",
    "views/userConfirmationView",
    "hbs!templates/views/expando/deleteRangeConfirmationTemplate",
    "hbs!templates/views/expando/graphToolbar"
],
function($,
         _,
         TP,
         GraphSeriesOptionsMenuView,
         UserConfirmationView,
         deleteConfirmationTemplate,
         graphToolbarTemplate)
{
    return TP.ItemView.extend(
    {
        className: "graphToolbar cf",

        template:
        {
            type: "handlebars",
            template: graphToolbarTemplate
        },

        initialize: function(options)
        {

            if (!options.stateModel)
                throw new Error("stateModel is required for expando graph toolbar view");

            this.stateModel = options.stateModel;

            this.listenTo(this.stateModel, "change:primaryRange", _.bind(this._onSelectionChange, this));
            this.listenTo(this.model.get("detailData"), "change:disabledDataChannels", _.bind(this._updateButtonStates, this));
            this.listenTo(this.model.get("detailData"), "change:availableDataChannels", _.bind(this._updateButtonStates, this));
            this.listenTo(this.model.get("detailData"), "reset", _.bind(this.render, this));
            this.listenTo(this.model, "change:workoutTypeValueId", _.bind(this.render, this));
            this.featureAuthorizer = options.featureAuthorizer ? options.featureAuthorizer : theMarsApp.featureAuthorizer;
        },

        events:
        {
            "change input[name=filterPeriod]": "_onFilterPeriodChanged",
            "mouseover button[data-series]": "_onGraphSeriesButtonHover",
            "mouseout button[data-series]": "_onGraphSeriesButtonMouseOut",
            "click button[data-series]": "_onGraphSeriesButtonClicked",
            "click .zoom": "_onZoomClicked",
            "click .reset": "_onResetClicked",
            "click .time": "_onGraphTimeButtonClicked",
            "click .distance": "_onGraphDistanceButtonClicked",
            "click .cut": "_onCutClicked"
        },

        modelEvents: {},

        ui:
        {
            "zoomResetButton": ".reset"
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
        },

        setFilterPeriod: function(period)
        {
            this.$("input[name=filterPeriod]").val(period);
        },

        onRender: function()
        {
            this._updateButtonStates();
        },

        onGraphZoomed: function()
        {
            this.ui.zoomResetButton.removeClass("hidden");
        },

        _onFilterPeriodChanged: function(event)
        {
            if (!event.target)
                return;

            var period = parseInt(event.target.value, 10);
            this.trigger("filterPeriodChanged", period);
        },

        _onGraphSeriesButtonHover: function(event)
        {
            this.mouseOverTarget = $(event.target);
            this._openSeriesOptionsMenuWithDelay({
                modal: {
                    overlayClass: "hidden"
                }
            });
        },

        _openSeriesOptionsMenuWithDelay: _.debounce(function(options)
        {
            if(this.mouseOverTarget && !this.seriesOptionsMenu)
            {
                this.seriesOptionsMenuFromMouseover = this._openSeriesOptionsMenu(this.mouseOverTarget, options);
            }
        }, 500),

        _onGraphSeriesButtonMouseOut: function(event)
        {
            this.mouseOverTarget = null;
            if(this.seriesOptionsMenuFromMouseover)
            {
                this.seriesOptionsMenuFromMouseover.close();
                this.seriesOptionsMenuFromMouseover = null;
                this.seriesOptionsMenu = null;
            }
        },

        _onGraphSeriesButtonClicked: function(event)
        {
            var self = this;

            this.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                this.featureAuthorizer.features.ViewGraphRanges,
                function()
                {
                    var seriesButton = $(event.target);
                    self._openSeriesOptionsMenu(seriesButton);
                }
            );
        },

        _openSeriesOptionsMenu: function(seriesButton, additionalOptions)
        {
            var tomahawkOptions = {
                model: new TP.Model({
                    series: seriesButton.data("series"),
                    title: seriesButton.data("title")}),
                detailDataModel: this.model.get("detailData"),
                featureAuthorizer: this.featureAuthorizer,
                target: seriesButton,
                offset: "top"
            };

            if(additionalOptions)
            {
                tomahawkOptions = _.defaults(additionalOptions, tomahawkOptions);
            }

            this.seriesOptionsMenu = new GraphSeriesOptionsMenuView.Tomahawk(tomahawkOptions);

            this.seriesOptionsMenu.render();

            this.listenTo(this.seriesOptionsMenu, "close", _.bind(function()
            {
                this.seriesOptionsMenu = null;
            }, this));

            return this.seriesOptionsMenu;
        },

        _onZoomClicked: function()
        {
            this.trigger("zoom");
        },

        _onResetClicked: function()
        {
            this.trigger("reset");
            this._hideZoomResetButton();
        },

        _hideZoomResetButton: function ()
        {
            this.ui.zoomResetButton.addClass("hidden");
        },

        _onGraphTimeButtonClicked: function ()
        {
            this.$(".time").addClass("bold");
            this.$(".distance").removeClass("bold");
            this.trigger("enableTimeAxis");
        },

        _onGraphDistanceButtonClicked: function ()
        {
            this.$(".time").removeClass("bold");
            this.$(".distance").addClass("bold");
            this.trigger("enableDistanceAxis");
        },

        _onCutClicked: function(e)
        {
            this.confirmationView = new UserConfirmationView(
            {
                template: deleteConfirmationTemplate,
                model: new TP.Model({ series: this.series })
            });

            this.confirmationView.render();

            this.listenTo(this.confirmationView, "userConfirmed", _.bind(this._onCutConfirmed, this));
        },

        _onCutConfirmed: function(e)
        {
            var selection = this.stateModel.get("primaryRange");
            if(!selection)
            {
                return;
            }
            this.model.get("detailData").cutAllChannelsForRange(selection.get("begin"), selection.get("end"));
            this.stateModel.set("primaryRange", null);
        },

        _updateButtonStates: function()
        {
            var availableChannels = this.model.get("detailData").get("availableDataChannels");
            this.$(".seriesButtons button").each(function()
            {
                var $self = $(this);
                var seriesName = $self.data("series");
                if(!_.contains(availableChannels, seriesName))
                {
                    $self.remove();
                }
            });

            this.$(".seriesDisabled").removeClass("seriesDisabled");
            _.each(this.model.get("detailData").get("disabledDataChannels"), function(channel)
            {
                this.$("button[data-series=" + channel + "]").addClass("seriesDisabled");
            }, this);

            if(!_.contains(availableChannels, "Distance"))
            {
                this.$(".distance").remove();
                this.$(".time").remove();
            }
            else
            {
                var currentXAxis = this.model.get("detailData").graphData.xaxis;
                if(currentXAxis === "distance")
                {
                    this.$(".distance").addClass("bold");
                    this.$(".time").removeClass("bold");
                }

                {
                    this.$(".distance").removeClass("bold");
                    this.$(".time").addClass("bold");
                }            }
        },

        _onSelectionChange: function()
        {
            if(this.stateModel.has("primaryRange") && this.featureAuthorizer.canAccessFeature(this.featureAuthorizer.features.ExpandoDataEditing))
            {
                this.$(".cut").removeClass("hidden");
                this.$(".zoom").removeClass("hidden");
            }
            else
            {
                this.$(".cut").addClass("hidden");
                this.$(".zoom").addClass("hidden");
            }
        }
    });
});
