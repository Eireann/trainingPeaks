define(
[
    "moment",
    "TP",
    "views/workoutQuickView",
    "utilities/workoutTypeName",
    "hbs!templates/views/calendarWorkout"
],
function(moment, TP, WorkoutQuickView, workoutTypeName, CalendarWorkoutTemplate)
{
    return TP.ItemView.extend(
    {

        showThrobbers: false,
        tagName: "div",
       
        today: moment().format("YYYY-MM-DD"),

        className: function()
        {
            return "workout " +
                this.getWorkoutTypeCssClassName() + " " +
                this.getComplianceCssClassName() + " " +
                this.getPastOrCompletedCssClassName();
        },

        getWorkoutTypeCssClassName: function()
        {
            return workoutTypeName(this.model.get("workoutTypeValueId"));
        },

        getComplianceCssClassName: function()
        {

            var totalTimePlanned = this.model.get("totalTimePlanned") ? this.model.get("totalTimePlanned") : 0;
            var totalTime = this.model.get("totalTime") ? this.model.get("totalTime") : 0;

            if ((totalTimePlanned * 0.8) <= totalTime && totalTime <= (totalTimePlanned * 1.2))
            {
                return "ComplianceGreen";
            }
            else if ((totalTimePlanned * 0.5) <= totalTime && totalTime <= (totalTimePlanned * 1.5))
            {
                return "ComplianceYellow";
            }
            else
            {
                return "ComplianceRed";
            }
        },

        getPastOrCompletedCssClassName: function()
        {
            if (this.model.get("totalTime"))
            {
                return "past";
            } else if (this.model.getCalendarDay() < this.today)
            {
                return "past";
            } else
            {
                return "future";
            }
        },

        attributes: function()
        {
            return {
                "data-workoutId": this.model.id
            };
        },

        template:
        {
            type: "handlebars",
            template: CalendarWorkoutTemplate
        },

        initialize: function(options)
        {
            if (!this.model)
                throw "Cannot have a CalendarWorkoutView without a model";
        },

        events: { click: "workoutClicked" },

        workoutClicked: function () 
        {
            var view = new WorkoutQuickView({ model: this.model });
            view.render();
            
        },

        onRender: function()
        {
            if (!this.$el.data('workoutId'))
            {
                this.$el.attr(this.attributes());
            }

            this.makeDraggable();

            this.$el.attr("class", this.className());
        },

        makeDraggable: function()
        {
            this.$el.data("ItemId", this.model.id);
            this.$el.data("ItemType", this.model.webAPIModelName);
            this.$el.data("DropEvent", "itemMoved");
            this.$el.draggable({ appendTo: 'body', helper: 'clone', opacity: 0.7 });
        }
    });
});