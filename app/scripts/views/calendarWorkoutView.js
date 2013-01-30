define(
[
    "jqueryui/draggable",
    "TP",
    "hbs!templates/views/calendarWorkout"
],
function(draggable, TP, CalendarWorkoutTemplate)
{
    return TP.ItemView.extend(
    {

        tagName: "div",
        className: "workout",

        attributes: function()
        {
            var attributes = {};
            attributes["data-WorkoutId"] = this.model.id;
            return attributes;
        },

        template:
        {
            type: "handlebars",
            template: CalendarWorkoutTemplate
        },

        modelEvents:
        {
            "change": "render"
        },

        initialize: function(options)
        {
            _.bindAll(this);
            if (!this.model)
            {
                throw "Cannot have a CalendarWorkoutView without a model";
            }
            this.model.on("request", this.onWaitStart);
            this.model.on("sync", this.onWaitStop);
            this.model.on("error", this.onWaitStop);
        },

        onWaitStart: function()
        {
            console.log('wait start');
            this.trigger("waitStart");
        },

        onWaitStop: function()
        {
            this.trigger("waitStop");
        },

        onRender: function()
        {
            this.$el.draggable({ appendTo: 'body', helper: 'clone', opacity: 0.7 });
        }
                                                        

    });
});