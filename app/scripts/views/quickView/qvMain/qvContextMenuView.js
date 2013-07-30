define(
[
    "TP",
    "views/quickView/saveWorkoutToLibrary/saveWorkoutToLibraryConfirmationView",
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

        initialize: function ()
        {
            TP.analytics("send", "event", "quickView", "contextMenuStart");
            
            this.on("before:reposition", this.beforeReposition, this);
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
            TP.analytics("send", "event", "quickView", "contextMenuDeleteWorkout");

            this.trigger("delete");
            this.close();
        },

        onCopyClicked: function()
        {
            TP.analytics("send", "event", "quickView", "contextMenuCopyWorkout");

            this.model.trigger("workout:copy", this.model);
            this.trigger("copy");
            this.close();
        },
        
        onCutClicked: function()
        {
            TP.analytics("send", "event", "quickView", "contextMenuCutWorkout");

            this.model.trigger("workout:cut", this.model);
            this.trigger("cut");
            this.close();
        },

        onSaveToLibraryClicked: function()
        {
            TP.analytics("send", "event", "quickView", "contextMenuSaveToLibrary");

            this.close();
            this.saveToLibraryConfirmationView = new SaveToLibraryConfirmationView({ model: this.model, libraries: theMarsApp.controllers.calendarController.getExerciseLibraries() });
            this.saveToLibraryConfirmationView.render();
        },

        onConfigureClicked: function()
        {
            this.notImplemented();
        },

        onPrintClicked: function()
        {
            this.notImplemented();
        },

        canFitAbove: function(positionTop)
        {
            return (positionTop - this.$el.height()) > 10 ? true : false;
        },

        beforeReposition: function()
        {
            if (!this.positionAttributes)
                return;

            if (!this.originalPositionAttributes)
                this.originalPositionAttributes = this.positionAttributes;

            this.positionAttributes = _.clone(this.originalPositionAttributes);

            if(!this.canFitAbove(this.positionAttributes.fromElement.offset().top))
            {
                delete this.positionAttributes.bottom;
                this.addUpArrow();
            } else
            {
                delete this.positionAttributes.top;
                this.addDownArrow();
            }
        },

        addUpArrow: function()
        {
            var hoverBox = this.$el.find(".hoverBox");
            hoverBox.addClass("uparrow");
            var arrow = this.$el.find(".arrow");
            arrow.detach().prependTo(hoverBox);
        },

        addDownArrow: function()
        {
            var hoverBox = this.$el.find(".hoverBox");
            hoverBox.removeClass("uparrow");
            var arrow = this.$el.find(".arrow");
            arrow.detach().appendTo(hoverBox);
        }

    });
});