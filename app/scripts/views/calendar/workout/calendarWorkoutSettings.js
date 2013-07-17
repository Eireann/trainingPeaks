define(
[
    "TP",
    "setImmediate",
    "jqueryOutside",
    "views/userConfirmationView",
    "utilities/printing/printUtility",
    "hbs!templates/views/calendar/workout/calendarWorkoutSettingsHover",
    "hbs!templates/views/confirmationViews/deleteConfirmationView"
],
function (TP, setImmediate, jqueryOutside, UserConfirmationView, printUtility, calendarWorkoutSettingsHover, deleteConfirmationTemplate)
{
    return TP.ItemView.extend(
    {

        modal: true,
        showThrobbers: false,
        tagName: "div",
        className: "workoutSettingsHover",

        events:
        {
            "click #workoutSettingsLabelDelete": "onDelete",
            "click #workoutSettingsLabelCopy": "onCopyClicked",
            "click #workoutSettingsLabelCut": "onCutClicked",
            "click #workoutSettingsLabelPrint" : "onPrintClicked"
        },

        onCopyClicked: function()
        {
            this.model.trigger("workout:copy", this.model);
            this.close();
        },
        
        onCutClicked: function()
        {
            this.model.trigger("workout:cut", this.model);
            this.close();
        },
        
        onPrintClicked: function()
        {
            var personId = theMarsApp.user.getCurrentAthleteId();
            var workoutId = this.model.id;
            printUtility.printWorkout(personId, workoutId);
        },

        hideWorkoutSettings: function (e)
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
                "id": "workoutSettingsDiv",
                "data-workoutId": this.model.id
            };
        },

        template:
        {
            type: "handlebars",
            template: calendarWorkoutSettingsHover
        },

        onDelete: function()
        {
            this.close();
            
            this.deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationTemplate });
            this.deleteConfirmationView.render();
            var self = this;
            this.deleteConfirmationView.on("userConfirmed", function () { self.model.destroy({ wait: true }); });
        }
    });
});