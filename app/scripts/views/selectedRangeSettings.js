define(
[
    "TP",
    "setImmediate",
    "jqueryOutside",
    "views/deleteConfirmationView",
    "hbs!templates/views/selectedRangeSettings"
],
function(TP, setImmediate, jqueryOutside, DeleteConfirmationView, selectedRangeSettingsTemplate)
{
    return TP.ItemView.extend(
    {

        modal: true,
        showThrobbers: false,
        tagName: "div",
       

        className: "weekSummarySettings",

        events:
        {
            "click #selectedRangeSettingsDeleteLabel": "onDeleteClicked",
            "click #selectedRangeSettingsCutLabel": "onCutClicked",
            "click #selectedRangeSettingsCopyLabel": "onCopyClicked",
            "click #selectedRangeSettingsShiftLabel": "onShiftClicked"
        },

        initialize: function(options)
        {
            this.selectedRangeCollection = options.collection;
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

        onRender: function()
        {
            this.updatePasteAvailability();
        },

        onDeleteClicked: function()
        {
            this.deleteConfirmationView = new DeleteConfirmationView();
            this.deleteConfirmationView.render();
            this.deleteConfirmationView.on("deleteConfirmed", this.onDeleteRangeConfirmed, this);
        },
        
        onDeleteRangeConfirmed: function()
        {
            this.selectedRangeCollection.deleteWeekItems();
            this.close();
        },
 
        onCopyClicked: function()
        {
            this.selectedRangeCollection.trigger("week:copy", this.selectedRangeCollection);
            this.updatePasteAvailability();
            this.close();
        },

        onCutClicked: function()
        {
            this.selectedRangeCollection.trigger("week:cut", this.selectedRangeCollection);
            this.updatePasteAvailability();
            this.close();
        },

        onShiftClicked: function(e)
        {
            this.close();
            this.selectedRangeCollection.trigger("range:shiftwizard");
        },

        updatePasteAvailability: function()
        {
            this.selectedRangeCollection.trigger("week:pasteMenu", this.selectedRangeCollection.models[0].id);
        }
    });
});