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
            this.dataParser = options.dataParser;
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
                this.$(".hideSeries").addClass("hide");
            }
            else
            {
                this.$(".showSeries").addClass("hide");
            }
        },

        _showSeries: function()
        {
            this.close();
            var disabledSeries = _.clone(this.detailDataModel.get("disabledDataChannels"));
            disabledSeries = _.without(disabledSeries, this.series);
            this.detailDataModel.set("disabledDataChannels", disabledSeries);
            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "graphSeriesEnabled", "eventLabel": this.series });
        },

        _hideSeries: function()
        {
            this.close();
            var disabledSeries = _.clone(this.detailDataModel.get("disabledDataChannels"));
            if(!_.contains(disabledSeries, this.series))
            {
                disabledSeries.push(this.series);
            }
            this.detailDataModel.set("disabledDataChannels", disabledSeries);
            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "graphSeriesEnabled", "eventLabel": this.series });
        },

        _deleteSeries: function()
        {
            this.close();
            var confirmationView = new UserConfirmationView(
            {
                template: deleteConfirmationTemplate,
                model: new TP.Model({ series: this.series })
            });

            confirmationView.render();

            var self = this;
            confirmationView.on("userConfirmed", function()
            {
                var channelCutDetails = self.dataParser.cutChannel(self.series);
                self.detailDataModel.addChannelCut(self.series, channelCutDetails);
            });

        }

    });
});