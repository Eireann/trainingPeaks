define(
[
    "TP",
    "setImmediate",
    "jqueryOutside",
    "hbs!templates/views/calendarDaySettings"
],
function (TP, setImmediate, jqueryOutside, CalendarDaySettings)
{
    return TP.ItemView.extend(
    {

        showThrobbers: false,
        tagName: "div",
       

        className: "calendarDaySettings",

        events:
        {
           // mouseleave: "hideWorkoutSettings"
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
                "id": "daySettingsDiv"
            };
        },

        template:
        {
            type: "handlebars",
            template: CalendarDaySettings
        },

        onRender: function()
        {
            $('body').append(this.$el);
            _.bindAll(this, "hideSettings");
            var theView = this;
            setImmediate(function () { theView.$el.bind("clickoutside", theView.hideSettings); });
            this.$el.css("width", "75px");
            this.$el.css("z-index", 99).css("position", "absolute");
            this.$el.css("left", this.posX - Math.round(this.$el.width() / 2 - 10)).css("top", this.posY - this.$el.height());

            var today = moment();
            var weekDate = moment(this.model.id);
            if (weekDate.week() === today.week() && weekDate.year() === today.year())
            {
                this.$el.find(".hoverBox").addClass("thisWeek");
            }
        }

    });
});