define(
[
    "TP",
    "views/expando/graphSeriesOptionsMenuView",
    "views/userConfirmationView",
    "hbs!templates/views/expando/deleteRangeConfirmationTemplate",
    "hbs!templates/views/expando/graphToolbar"
],
function(
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
        },
        
        events:
        {
            "change input[name=filterPeriod]": "_onFilterPeriodChanged",
            "click button.graphSeriesButton": "_onGraphSeriesButtonClicked",
            "click button.graphZoomButton": "_onZoomClicked",
            "click button.graphResetButton": "_onResetClicked",
            "click button.graphTimeButton": "_onGraphTimeButtonClicked",
            "click button.graphDistanceButton": "_onGraphDistanceButtonClicked",
            "click button.graphCutButton": "_onCutClicked"
        },
 
        modelEvents: {},
        
        ui:
        {
            "zoomResetButton": "button.graphResetButton"
        },
       
        serializeData: function()
        {
            // Grab speed label based _on model workout type
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
        },
 
        setFilterPeriod: function(period)
        {
            this.$("input[name=filterPeriod]").val(period);
        },

        onRender: function()
        {
            this._updateButtonStates();
        },

        _onFilterPeriodChanged: function(event)
        {
            if (!event.target)
                return;

            var period = parseInt(event.target.value, 10);
            this.trigger("filterPeriodChanged", period);
        },

        _onGraphSeriesButtonClicked: function(event)
        {
            var seriesButton = $(event.target);

            var seriesName = seriesButton.data("series");
            this.seriesOptionsMenu = new GraphSeriesOptionsMenuView({ model: this.model, parentEl: this.$el, series: seriesName, stateModel: this.stateModel });
            var offset = seriesButton.offset();
            this.seriesOptionsMenu.render().top(offset.top + seriesButton.height()).left(offset.left - (seriesButton.width() / 2));
        },
        
        _onZoomClicked: function()
        {
            this.trigger("zoom");
        },
        
        _onResetClicked: function()
        {
            this.trigger("reset");
            this._hideZoomButton();
        },

        _hideZoomButton: function ()
        {
            this.ui.zoomResetButton.addClass("hidden");
        },

        _onGraphZoomed: function()
        {
            this.ui.zoomResetButton.removeClass("hidden");
        },

        _onGraphTimeButtonClicked: function ()
        {
            this.$el.find("button.graphTimeButton").addClass("bold");
            this.$el.find("button.graphDistanceButton").removeClass("bold");
            this.trigger("enableTimeAxis");
        },
        
        _onGraphDistanceButtonClicked: function ()
        {
            this.$el.find("button.graphTimeButton").removeClass("bold");
            this.$el.find("button.graphDistanceButton").addClass("bold");
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
            else
            {
                var currentXAxis = this.model.get("detailData").getDataParser().xaxis;
                if(currentXAxis === "distance")
                {
                    this.$(".graphDistanceButton").addClass("bold");
                    this.$(".graphTimeButton").removeClass("bold");
                }
                else
                {
                    this.$(".graphDistanceButton").removeClass("bold");
                    this.$(".graphTimeButton").addClass("bold");
                }
            }
        },

        _onSelectionChange: function()
        {
            if(this.stateModel.has("primaryRange"))
            {
                this.$(".graphCutButton").removeClass("hidden");
            }
            else
            {
                this.$(".graphCutButton").addClass("hidden");
            }
        }
    });
});