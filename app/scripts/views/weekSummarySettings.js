define(
[
    "TP",
    "setImmediate",
    "jqueryOutside",
    "views/deleteConfirmationView",
    "hbs!templates/views/calendarWeekSummarySettings"
],
function (TP, setImmediate, jqueryOutside, DeleteConfirmationView, calendarWeekSummarySettings)
{
    return TP.ItemView.extend(
    {

        showThrobbers: false,
        tagName: "div",
       

        className: "weekSummarySettings",

        events:
        {
            "click #calendarWeekSummarySettingsDeleteLabel": "onDeleteClicked",
            "click #calendarWeekSummarySettingsCutLabel": "onCutClicked",
            "click #calendarWeekSummarySettingsCopyLabel": "onCopyClicked",
            "click #calendarWeekSummarySettingsPasteLabel": "onPasteClicked"
        },

        hideSettings: function (e)
        {
            this.close();
            this.trigger("mouseleave", e);
            //delete this;
        },

        initialize: function(options)
        {
            this.posX = options.left;
            this.posY = options.top;
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
            _.bindAll(this, "hideSettings");


            $('body').append(this.$el);
            var self = this;
            setImmediate(function () { self.$el.bind("clickoutside", self.hideSettings); });

            this.$el.css("width", "105px");
            this.$el.css("z-index", 99).css("position", "absolute");
            this.$el.css("left", this.posX - Math.round(this.$el.width() / 2 + 20)).css("top", this.posY - this.$el.height());
            this.$el.find(".arrow").css("margin-left", "65px");

            var today = moment();
            var weekDate = moment(this.model.get("date"));

            if (weekDate.week() === today.week() && weekDate.year() === today.year())
            {
                this.$el.find(".hoverBox").addClass("thisWeek");
            }
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
            this.model.collection.deleteWeekItems();
        },

        onCopyClicked: function()
        {
            this.model.trigger("week:copy", this.model.collection);
            this.close();
        },

        onCutClicked: function()
        {
            this.model.trigger("week:cut", this.model.collection);
            this.close();
        },

        onPasteClicked: function()
        {
            this.model.trigger("week:paste", this.model.get("date"));
            this.close();
        }
    });
});