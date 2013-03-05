define(
[
    "TP",
    "hbs!templates/views/calendarWorkoutHover"
],
function(TP, CalendarWorkoutHoverTemplate)
{
    return TP.ItemView.extend(
    {

        showThrobbers: false,
        tagName: "div",
       
        today: moment().format("YYYY-MM-DD"),

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
            mouseleave: "workoutHoverHide"
        },

        workoutHoverHide: function(e)
        {
            if (!$(e.toElement).is(".workoutIcon"))
            {
                this.close();
            }
        },


        template:
        {
            type: "handlebars",
            template: CalendarWorkoutHoverTemplate
        },

        onRender: function()
        {
            $('body').append(this.$el);
            this.$el.css("left", this.posX - 17).css("top", this.posY - this.$el.height() + 5);
        }

    });
});