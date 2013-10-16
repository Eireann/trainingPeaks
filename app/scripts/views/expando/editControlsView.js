define(
[
    "TP",
    "utilities/workout/formatLapData",
    "hbs!templates/views/expando/editControlsTemplate"
],
function(
    TP,
    formatLapData,
    editControlsTemplate
    )
{
    return TP.ItemView.extend({

        className: "expandoEditControls",

        template:
        {
            type: "handlebars",
            template: editControlsTemplate
        },

        initialize: function(options)
        {
            this.stateModel = options.stateModel;
            this.listenTo(this.model.get("detailData"), "change", _.bind(this.render, this));
        },

        onRender: function()
        {
            if(this.model.get("detailData").get("channelCuts"))
            {
                this.$el.removeClass("disabled");
            }
            else
            {
                this.$el.addClass("disabled");
            }
        }

    });
});
