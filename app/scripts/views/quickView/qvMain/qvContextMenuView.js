define(
[
    "TP",
    "views/saveWorkoutToLibraryConfirmationView",
    "hbs!templates/views/quickView/workoutQuickViewMenu"
],
function(TP, SaveToLibraryConfirmationView, WorkoutQuickViewMenuTemplate)
{
    return TP.ItemView.extend(
    {

        modal: true,
        showThrobbers: false,
        tagName: "div",

        className: "workoutQuickViewMenu",

        events:
        {
            "click #workoutQuickViewMenuDeleteLabel": "onDeleteClicked",
            "click #workoutQuickViewMenuCutLabel": "onCutClicked",
            "click #workoutQuickViewMenuCopyLabel": "onCopyClicked",
            "click #workoutQuickViewMenuSaveToLibraryLabel": "onSaveToLibraryClicked",
            "click #workoutQuickViewMenuConfigureLabel": "onConfigureClicked",
            "click #workoutQuickViewMenuPrintLabel": "onPrintClicked"
        },

        attributes: function()
        {
            return {
                "id": "workoutQuickViewMenuDiv",
                "data-workoutId": this.model.id
            };
        },

        template:
        {
            type: "handlebars",
            template: WorkoutQuickViewMenuTemplate
        },

        onDeleteClicked: function()
        {
            this.trigger("delete");
            this.close();
        },

        onCopyClicked: function()
        {
            this.model.trigger("workout:copy", this.model);
            this.trigger("copy");
            this.close();
        },
        
        onCutClicked: function()
        {
            this.model.trigger("workout:cut", this.model);
            this.trigger("cut");
            this.close();
        },

        onSaveToLibraryClicked: function()
        {
            this.close();
            this.saveToLibraryConfirmationView = new SaveToLibraryConfirmationView({ model: this.model, libraries: theMarsApp.controllers.calendarController.getExerciseLibraries() });
            this.saveToLibraryConfirmationView.render();
        },

        onConfigureClicked: function()
        {
            alert('fixme');
        },

        onPrintClicked: function()
        {
            alert('fixme');
        }

    });
});