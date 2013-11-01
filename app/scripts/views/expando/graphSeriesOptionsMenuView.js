define(
[
    "TP",
    "shared/views/tomahawkView",
    "views/userConfirmationView",
    "hbs!templates/views/expando/deleteSeriesConfirmationTemplate",
    "hbs!templates/views/expando/graphSeriesOptionsMenuTemplate",
],
function(
         TP,
         TomahawkView,
         UserConfirmationView,
         deleteConfirmationTemplate,
         optionsMenuTemplate)
{
    GraphSeriesOptionsMenuView = TP.ItemView.extend(
    {
        showThrobbers: false,
        tagName: "div",

        className: "expandoGraphSeriesOptionsMenu",

        initialize: function(options)
        {
            this.detailDataModel = options.detailDataModel;
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
            this.confirmationView.on("userConfirmed", function()
            {
                self.detailDataModel.cutChannel(self.series);
            });

        }

    });

    TomahawkView.wrap(GraphSeriesOptionsMenuView, {
        style: "list"
    });

    return GraphSeriesOptionsMenuView;
});