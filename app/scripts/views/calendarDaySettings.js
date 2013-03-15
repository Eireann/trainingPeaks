define(
[
    "TP",
    "setImmediate",
    "jqueryOutside",
    "views/newItemView",
    "views/deleteConfirmationView",
    "hbs!templates/views/calendarDaySettings"
],
function(TP, setImmediate, jqueryOutside, NewItemView, DeleteConfirmationView, calendarDaySettingsTemplate)
{
    return TP.ItemView.extend(
    {

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
            this.close();
            this.trigger("mouseleave", e);
            this.parentEl.find(".daySelected").css("display", "none");
        },

        initialize: function(options)
        {
            _.bindAll(this, "hideSettings");
            
            this.posX = options.left;
            this.posY = options.top;
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
            _.bindAll(this, "hideSettings");


            $('body').append(this.$el);
            var self = this;
            setImmediate(function ()
            {
                self.$el.bind("clickoutside", self.hideSettings);
            });

            this.$el.css("width", "75px");
            this.$el.css("z-index", 99).css("position", "absolute");
            this.$el.css("left", this.posX - Math.round(this.$el.width() / 2 - 10)).css("top", this.posY - this.$el.height());

            var today = moment();
            var weekDate = moment(this.model.id);

            if (weekDate.week() === today.week() && weekDate.year() === today.year())
                this.$el.find(".hoverBox").addClass("thisWeek");
        },

        onDeleteClicked: function()
        {
            this.close();
            
            this.deleteConfirmationView = new DeleteConfirmationView();
            this.deleteConfirmationView.render();
            this.deleteConfirmationView.on("deleteConfirmed", this.onDeleteDayConfirmed, this);
        },
        
        onDeleteDayConfirmed: function()
        {
            this.model.deleteDayItems();
        },

        onCopyClicked: function(e)
        {
            this.model.trigger("day:copy", this.model);
            this.hideSettings(e);
        },
        
        onCutClicked: function(e)
        {
            this.model.trigger("day:cut", this.model);
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
        }

    });
});