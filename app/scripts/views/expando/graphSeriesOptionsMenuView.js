define(
[
    "TP",
    "views/userConfirmationView",
    "hbs!templates/views/expando/deleteSeriesConfirmationTemplate",
    "hbs!templates/views/expando/graphSeriesOptionsMenuTemplate",
],
function(
         TP,
         UserConfirmationView,
         deleteConfirmationTemplate,
         optionsMenuTemplate)
{
    return TP.ItemView.extend(
    {
        modal: true,
        showThrobbers: false,
        tagName: "div",

        className: "expandoGraphSeriesOptionsMenu",

        initialize: function(options)
        {
            this.detailDataModel = this.model.get("detailData");
            this.series = options.series;
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
            if(_.contains(this.detailDataModel.get("disabledDataChannels"), this.series))
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
            this.detailDataModel.enableChannel(this.series);
            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "graphSeriesEnabled", "eventLabel": this.series });
        },

        _hideSeries: function()
        {
            this.close();
            this.detailDataModel.disableChannel(this.series);
            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "graphSeriesEnabled", "eventLabel": this.series });
        },

        _deleteSeries: function()
        {
            this.close();
            this.confirmationView = new UserConfirmationView(
            {
                template: deleteConfirmationTemplate,
                model: new TP.Model({ series: this.series })
            });

            this.confirmationView.render();

            var self = this;
            this.confirmationView.on("userConfirmed", function()
            {
                self.detailDataModel.cutChannel(self.series);
            });

        }

    });
});