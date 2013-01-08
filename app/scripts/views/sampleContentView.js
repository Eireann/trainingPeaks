define(
[
    "hbs!templates/sampleContent",
    
    "Backbone.Marionette"
],
function (SampleContentTemplate, Marionette)
{
    return Marionette.View.extend(
    {
        render: function()
        {
            var html = SampleContentTemplate({ Name: "Bernardo" });
            $(this.el).html(html);
            return this;
        }
    });
});