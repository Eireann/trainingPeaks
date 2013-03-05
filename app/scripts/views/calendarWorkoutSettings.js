define(
[
    "TP",
    "hbs!templates/views/calendarWorkoutSettingsHover"
],
function (TP, calendarWorkoutSettingsHover)
{
    return TP.ItemView.extend(
    {

        showThrobbers: false,
        tagName: "div",
       

        className: "workoutSettingsHover",

        events:
        {
            mouseleave: "hideWorkoutSettings"
        },

        hideWorkoutSettings: function ()
        {
            this.close();
            delete this;
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
                "id": "workoutSettingsDiv",
                "data-workoutId": this.model.id
            };
        },

        template:
        {
            type: "handlebars",
            template: calendarWorkoutSettingsHover
        },

        onRender: function()
        {
            $('body').append(this.$el);
            //this.$el.attr("class", this.$el.attr("class") + " " + this.inheritedClassNames);
            this.$el.css("left", this.posX - Math.round(this.$el.width() / 2)).css("top", this.posY - this.$el.height());
        }

    });
});