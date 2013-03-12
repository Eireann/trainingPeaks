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
            "click #calendarWeekSummarySettingsDeleteLabel": "onDeleteClicked"
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

            this.$el.css("width", "100px");
            this.$el.css("z-index", 99).css("position", "absolute");
            this.$el.css("left", this.posX - Math.round(this.$el.width() / 2 + 20)).css("top", this.posY - this.$el.height());

            var today = moment();
            var weekDate = moment(this.model.id);

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
        }
    });
});