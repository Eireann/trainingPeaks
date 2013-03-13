define(
[
    "TP",
    "jqueryui/dialog",
    "models/workoutModel",
    "views/workoutQuickView",
    "hbs!templates/views/newItemView"
],
function (TP, dialog, WorkoutModel, WorkoutQuickView, newItemViewTemplate)
{
    return TP.ItemView.extend(
    {
        events:
        {
            "click button": "onNewWorkoutClicked"
        },

        template:
        {
            type: "handlebars",
            template: newItemViewTemplate
        },
        
        onNewWorkoutClicked: function(e)
        {
            if (e.currentTarget.name === "uploadDeviceFile")
            {

            }
            else
            {
                var workoutTypeId = $(e.currentTarget).data("workoutid");
                this.newWorkout = new WorkoutModel(
                {
                    personId: theMarsApp.user.get("userId"),
                    workoutDay: this.model.get("date"),
                    title: "",
                    workoutTypeValueId: workoutTypeId 
                });
                var quickView = new WorkoutQuickView({ model: this.newWorkout });
                quickView.on("discard", this.onNewWorkoutDiscarded, this);
                quickView.on("saveandclose", this.onNewWorkoutSaved, this);
                quickView.render();
            }
        },
        
        onNewWorkoutDiscarded: function()
        {
            delete this.newWorkout;
        },
        
        onNewWorkoutSaved: function()
        {
            // The QuickView already saved the model to the server, let's update our local collections to reflect the change.
            this.model.add(this.newWorkout);
            this.$el.dialog("close");
            this.close();
        },

        onBeforeRender: function ()
        {
            this.$el.dialog(
            {
                autoOpen: false,
                modal: true,
                width: 800,
                height: 250,
                resizable: false
            });
        },

        onRender: function ()
        {
            this.$el.dialog("open");
            this.$el.css("overflow", "hidden");
        }
    });
});