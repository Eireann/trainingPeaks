define(
[
    "TP",
    "setImmediate",
    "jqueryOutside",
    "views/newItemView",
    "views/userConfirmationView",
    "hbs!templates/views/calendarDaySettings",
    "hbs!templates/views/deleteConfirmationView"
],
function(TP, setImmediate, jqueryOutside, NewItemView, UserConfirmationView, calendarDaySettingsTemplate, deleteConfirmationView)
{
    return TP.ItemView.extend(
    {

        modal: true,
        showThrobbers: false,
        tagName: "div",
        className: "calendarDaySettings",
        
        events:
        {
            "click #calendarDaySettingsAddLabel": "onAddClicked",
            "click #calendarDaySettingsDeleteLabel": "onDeleteClicked",
            "click #calendarDaySettingsCutLabel": "onCutClicked",
            "click #calendarDaySettingsCopyLabel": "onCopyClicked",
            "click #calendarDaySettingsPasteLabel": "onPasteClicked",
            "click #calendarDaySettingsShiftLabel": "onShiftClicked"
        },
        
        onAddClicked: function(e)
        {
            var newItemView = new NewItemView({ model: this.model });
            newItemView.render();
            this.hideSettings(e);
        },

        hideSettings: function (e)
        {

            this.parentEl.find(".daySelected").css("display", "none");

            if (!this.closed)
                this.close();
        },

        initialize: function(options)
        {
            _.bindAll(this, "hideSettings");

            this.parentEl = options.parentEl;
            this.inheritedClassNames = options.className;
        },

        attributes: function()
        {
            return {
                "id": "daySettingsDiv"
            };
        },

        template:
        {
            type: "handlebars",
            template: calendarDaySettingsTemplate
        },

        onRender: function()
        {
            this.on("close", this.hideSettings, this);

            // highlight the day
            var today = moment();
            var weekDate = moment(this.model.id);

            if (weekDate.week() === today.week() && weekDate.year() === today.year())
                this.$el.find(".hoverBox").addClass("thisWeek");

            this.updatePasteAvailability();
        },

        onDeleteClicked: function(e)
        {
            this.hideSettings(e);

            this.deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationView });
            this.deleteConfirmationView.render();
            this.deleteConfirmationView.on("userConfirmed", this.onDeleteDayConfirmed, this);
        },
        
        onDeleteDayConfirmed: function()
        {
            this.model.deleteDayItems();
        },

        onCopyClicked: function(e)
        {
            this.model.trigger("day:copy", this.model);
            this.updatePasteAvailability();
            this.hideSettings(e);
        },
        
        onCutClicked: function(e)
        {
            this.model.trigger("day:cut", this.model);
            this.updatePasteAvailability();
            this.hideSettings(e);
        },

        onPasteClicked: function(e)
        {
            this.model.trigger("day:paste", this.model.id);
            this.hideSettings(e);
        },

        onShiftClicked: function (e)
        {
            this.hideSettings(e);
            this.model.trigger("day:shiftwizard");
        },

        updatePasteAvailability: function()
        {
            this.model.trigger("day:pasteMenu", this.model.id);
        }

    });
});