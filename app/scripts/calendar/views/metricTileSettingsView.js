define(
[
    "underscore",
    "TP",
    "views/userConfirmationView",
    "hbs!templates/views/confirmationViews/deleteConfirmationView",
    "hbs!calendar/templates/metricTileSettingsTemplate"
],
function(
    _,
    TP,
    UserConfirmationView,
    deleteConfirmationTemplate,
    metricTileSettingsTemplate
)
{

    var MetricTileSettingsView = TP.ItemView.extend(
    {

        modal: true,
        showThrobbers: false,
        className: "metricTileSettings",

        template:
        {
            type: "handlebars",
            template: metricTileSettingsTemplate
        },

        events:
        {
            "click .actionCut": "_doCut",
            "click .actionCopy": "_doCopy",
            "click .actionDelete": "_doDelete"
        },

        _doCut: function()
        {
            this.model.trigger("workout:cut", this.model);
            this.close();
        },

        _doCopy: function()
        {
            this.model.trigger("workout:copy", this.model);
            this.close();
        },

        _doDelete: function()
        {
            var self = this;

            this.close();

            var confirmationView = new UserConfirmationView(
            {
                template: deleteConfirmationTemplate
            });

            confirmationView.render();
            confirmationView.on("userConfirmed", function()
            {
                self.model.destroy({ wait: true });
            });

        }

    });

    return MetricTileSettingsView;

});
