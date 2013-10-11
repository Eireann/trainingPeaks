define(
[
    "underscore",

    "TP",

    "hbs!templates/views/expando/lapSplitTemplate"
],
function(
    _,
    TP,
    lapSplitTemplate
    )
{
    return TP.ItemView.extend(
    {
        events:
        {
            "click td.edit": "handleLapClickEditable"
        },

        tagName: 'tr',
        template:
        {
            type: "handlebars",
            template: lapSplitTemplate
        },

        serializeData: function()
        {
            return _.extend({}, this.model.toJSON(), { customTagName: this.customTagName });
        },

        handleLapClickEditable: function(e)
        {
            e.preventDefault();
            $(e.target).html('<input type=text autofocus=true />');
            this.model.trigger('expando:lapEdit');
            this.$('.edit').removeClass('edit');
        }
    });
});
