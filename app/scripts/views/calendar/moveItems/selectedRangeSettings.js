define(
[
    "TP",
    "setImmediate",
    "jqueryOutside",
    "views/userConfirmationView",
    "hbs!templates/views/calendar/moveItems/selectedRangeSettings",
    "hbs!templates/views/confirmationViews/deleteConfirmationView"
],
function(TP, setImmediate, jqueryOutside, UserConfirmationView, selectedRangeSettingsTemplate, deleteConfirmationTemplate)
{
    return TP.ItemView.extend(
    {

        modal: true,
        showThrobbers: false,
        tagName: "div",
       

        className: "selectedRangeSettings",

        events:
        {
            "click #selectedRangeSettingsDeleteLabel": "onDeleteClicked",
            "click #selectedRangeSettingsCutLabel": "onCutClicked",
            "click #selectedRangeSettingsCopyLabel": "onCopyClicked",
            "click #selectedRangeSettingsShiftLabel": "onShiftClicked"
        },

        initialize: function(options)
        {
            options = options || {};
            this.selectionManager = options.selectionManager || theMarsApp.selectionManager;
        },

        attributes:
        {
            "id": "selectedRangeSettingsDiv"
        },

        template:
        {
            type: "handlebars",
            template: selectedRangeSettingsTemplate
        },

        onDeleteClicked: function()
        {
            this.deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationTemplate });
            this.deleteConfirmationView.render();
            this.listenTo(this.deleteConfirmationView, "userConfirmed", this.onDeleteRangeConfirmed);
        },
        
        onDeleteRangeConfirmed: function()
        {
            this.selectionManager.execute("delete");
            this.close();
        },
 
        onCopyClicked: function()
        {
            this.selectionManager.copySelectionToClipboard();
            this.close();
        },

        onCutClicked: function()
        {
            this.selectionManager.cutSelectionToClipboard();
            this.close();
        },

        onShiftClicked: function(e)
        {
            this.selectionManager.execute("shift");
            this.close();
        }
    });
});
