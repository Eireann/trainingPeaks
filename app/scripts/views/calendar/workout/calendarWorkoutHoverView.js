define(
[
    "TP",
    "hbs!templates/views/calendar/workout/calendarWorkoutHover"
],
function(TP, CalendarWorkoutHoverTemplate)
{
    return TP.ItemView.extend(
    {

        showThrobbers: false,
        tagName: "div",
       
        today: moment().format(TP.utils.datetime.shortDateFormat),

        className: "workoutHover",

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
                "id": "workoutHoverDiv",
                "data-workoutId": this.model.id
            };
        },

        events:
        {
            mouseleave: "onMouseLeave"
        },

        onMouseLeave: function(e)
        {
            this.trigger("mouseleave", e);
        },


        template:
        {
            type: "handlebars",
            template: CalendarWorkoutHoverTemplate
        },

        onRender: function()
        {
            theMarsApp.getBodyElement().append(this.$el);
            this.$el.css("left", this.posX - 15).css("top", this.posY - this.$el.height());
        }

    });
});