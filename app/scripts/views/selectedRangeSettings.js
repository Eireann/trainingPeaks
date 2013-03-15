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

        hideSettings: function (e)
        {
            if (e.isDefaultPrevented())
                return;

            this.close();
            this.trigger("mouseleave", e);
            //delete this;
        },

        initialize: function(options)
        {
            this.posX = options.left;
            this.posY = options.top;
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
            _.bindAll(this, "hideSettings");

            $('body').append(this.$el);
            var self = this;
            setImmediate(function() { self.$el.bind("clickoutside", self.hideSettings); });

            this.$el.css("left", this.posX - 30).css("top", this.posY - this.$el.height());

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
            this.selectedRangeCollection.trigger("range:shiftwizard");
            this.close();
        },

        updatePasteAvailability: function()
        {
            this.selectedRangeCollection.trigger("week:pasteMenu", this.selectedRangeCollection.models[0].id);
        }
    });
});