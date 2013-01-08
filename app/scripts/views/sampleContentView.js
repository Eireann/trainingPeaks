define(
[
    "backbone.marionette",
    "Backbone.Marionette.Handlebars",
    "hbs!templates/sampleContent"
],
function (Marionette, MarionetteHandlebars, SampleContentTemplate)
{
    return Marionette.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: SampleContentTemplate
        }
    });
});