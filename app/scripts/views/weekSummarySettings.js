define(
[
    "TP",
    "views/deleteConfirmationView",
    "hbs!templates/views/calendarWeekSummarySettings"
],
function(TP, DeleteConfirmationView, calendarWeekSummarySettings)
{
    return TP.ItemView.extend(
    {

        modal: true,
        showThrobbers: false,
        tagName: "div",

        className: "weekSummarySettings",

        events:
        {
            "click #calendarWeekSummarySettingsDeleteLabel": "onDeleteClicked",
            "click #calendarWeekSummarySettingsCutLabel": "onCutClicked",
            "click #calendarWeekSummarySettingsCopyLabel": "onCopyClicked",
            "click #calendarWeekSummarySettingsPasteLabel": "onPasteClicked",
            "click #calendarWeekSummarySettingsShiftLabel": "onShiftClicked"
        },

        hideSettings: function(e)
        {
            this.close();
        },

        initialize: function(options)
        {
            this.parentEl = options.parentEl;
            this.inheritedClassNames = options.className;
        },

        attributes: function()
        {
            return {
                "id": "summarySettingsDiv",
                "data-workoutId": this.model.id
            };
        },

        template:
        {
            type: "handlebars",
            template: calendarWeekSummarySettings
        },

        onRender: function()
        {

            var today = moment();
            var weekDate = moment(this.model.get("date"));

            if (weekDate.week() === today.week() && weekDate.year() === today.year())
            {
                this.$el.find(".hoverBox").addClass("thisWeek");
            }

            this.model.collection.trigger("week:select", this.model.collection);
            this.updatePasteAvailability();
        },

        onDeleteClicked: function(e)
        {
            this.hideSettings(e);
            
            this.deleteConfirmationView = new DeleteConfirmationView();
            this.deleteConfirmationView.render();
            this.deleteConfirmationView.on("deleteConfirmed", this.onDeleteDayConfirmed, this);
        },
        
        onDeleteDayConfirmed: function()
        {
            this.model.collection.deleteWeekItems();
        },

        onCopyClicked: function(e)
        {
            this.model.collection.trigger("week:copy", this.model.collection);
            this.updatePasteAvailability();
            //theMarsApp.logger.debug("Copy from week");
            this.hideSettings(e);
        },

        onCutClicked: function(e)
        {
            this.model.trigger("week:cut", this.model.collection);
            this.updatePasteAvailability();
            //theMarsApp.logger.debug("Cut from week");
            this.hideSettings(e);
        },

        onPasteClicked: function(e)
        {
            this.model.trigger("week:paste", this.model.get("date"));
            //theMarsApp.logger.debug("Paste from week");
            this.hideSettings(e);
        },

        updatePasteAvailability: function()
        {
            this.model.trigger("week:pasteMenu", this.model.get("date"));
        },

        onShiftClicked: function (e)
        {
            this.hideSettings(e);
            this.model.trigger("week:shiftwizard");
        }

    });
});