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

        initialize: function(options)
        {
            this.selectionManager = options.selectionManager || theMarsApp.selectionManager;

            this.on("render", this._selectSelf, this);
        },

        _doCut: function()
        {
            this.selectionManager.cutSelectionToClipboard();
            this.close();
        },

        _doCopy: function()
        {
            this.selectionManager.copySelectionToClipboard();
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
            this.listenTo(confirmationView, "userConfirmed", function()
            {
                self.model.destroy({ wait: true });
            });

        },

        _selectSelf: function()
        {
            this.selectionManager.setSelection(this.model);
        }

    });

    return MetricTileSettingsView;

});
