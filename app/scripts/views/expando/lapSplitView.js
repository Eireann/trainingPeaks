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
            "click td.lap": "handleLapClickEditable"
        },

        tagName: 'tr',
        template:
        {
            type: "handlebars",
            template: lapSplitTemplate
        },

        serializeData: function()
        {
            var data = [];
            var obj = this.model.toJSON();

            for (var keyName in obj) data.push({key:keyName, value:obj[keyName]});

            return { lapData: data, customTagName: this.customTagName };
        },

        handleLapClickEditable: function(e)
        {
            if($(e.target).hasClass('editing')) return false;
            e.preventDefault();
            $(e.target).html('<input type=text autofocus=true />').addClass('editing');
            this.model.trigger('expando:lapEdit');
        }
    });
});
