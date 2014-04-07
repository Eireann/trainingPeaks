define(
[
    "underscore",
    "TP",
    "shared/views/tomahawkView",
    "views/userConfirmationView",
    "hbs!templates/views/expando/deleteSeriesConfirmationTemplate",
    "hbs!templates/views/expando/graphSeriesOptionsMenuTemplate",
],
function(_,
         TP,
         TomahawkView,
         UserConfirmationView,
         deleteConfirmationTemplate,
         optionsMenuTemplate)
{
    var GraphSeriesOptionsMenuView = TP.ItemView.extend(
    {
        showThrobbers: false,
        tagName: "div",

        className: "expandoGraphSeriesOptionsMenu",

        initialize: function(options)
        {
            this.detailDataModel = options.detailDataModel;
            this.featureAuthorizer = options.featureAuthorizer ? options.featureAuthorizer : theMarsApp.featureAuthorizer;
        },

        events:
        {
            "click .showSeries": "_showSeries",
            "click .hideSeries": "_hideSeries",
            "click .deleteSeries": "_deleteSeries"
        },

        template:
        {
            type: "handlebars",
            template: optionsMenuTemplate
        },

        onRender: function()
        {
            if(_.contains(this.detailDataModel.get("disabledDataChannels"), this.model.get("series")))
            {
                this.$(".hideSeries").remove();
            }
            else
            {
                this.$(".showSeries").remove();
            }

            if(this.featureAuthorizer.canAccessFeature(this.featureAuthorizer.features.ExpandoDataEditing))
            {
                this.$(".deleteSeries").removeClass("hidden");
            }
        },

        _showSeries: function()
        {
            this.close();
            this.detailDataModel.enableChannel(this.model.get("series"));
            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "graphSeriesEnabled", "eventLabel": this.model.get("series") });
        },

        _hideSeries: function()
        {
            this.close();
            this.detailDataModel.disableChannel(this.model.get("series"));
            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "graphSeriesEnabled", "eventLabel": this.model.get("series") });
        },

        _deleteSeries: function()
        {
            this.close();
            this.confirmationView = new UserConfirmationView(
            {
                template: deleteConfirmationTemplate,
                model: new TP.Model({ series: this.model.get("series") })
            });

            this.confirmationView.render();

            var self = this;
            this.listenTo(this.confirmationView, "userConfirmed", function()
            {
                self.detailDataModel.cutChannel(self.model.get("series"));
            });

        }

    });

    TomahawkView.wrap(GraphSeriesOptionsMenuView, {
        style: "list"
    });

    return GraphSeriesOptionsMenuView;
});
