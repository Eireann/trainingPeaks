define(
[
    "TP",
    "hbs!templates/views/expando/graphSeriesOptionsMenuTemplate"
],
function(TP, optionsMenuTemplate)
{
    return TP.ItemView.extend(
    {
        modal: true,
        showThrobbers: false,
        tagName: "div",

        className: "expandoGraphSeriesOptionsMenu",

        initialize: function(options)
        {
            this.stateModel = options.stateModel;
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
            if(_.contains(this.stateModel.get("disabledDataChannels"), this.series))
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
            var disabledSeries = _.clone(this.stateModel.get("disabledDataChannels"));
            disabledSeries = _.without(disabledSeries, this.series);
            this.stateModel.set("disabledDataChannels", disabledSeries);
            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "graphSeriesEnabled", "eventLabel": this.series });
        },

        _hideSeries: function()
        {
            this.close();
            var disabledSeries = _.clone(this.stateModel.get("disabledDataChannels"));
            if(!_.contains(disabledSeries, this.series))
            {
                disabledSeries.push(this.series);
            }
            this.stateModel.set("disabledDataChannels", disabledSeries);
            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "graphSeriesEnabled", "eventLabel": this.series });
        },

        _deleteSeries: function()
        {
            this.close();
            this.dataParser.cutChannel(this.series);
            this.stateModel.set("availableDataChannels", _.clone(this.dataParser.getAvailableChannels()));
        }

    });
});