define(
[
    "underscore",
    "TP",
    "views/quickView/saveWorkoutToLibrary/saveWorkoutToLibraryConfirmationView",
    "hbs!templates/views/quickView/workoutQuickViewMenu"
],
function(_, TP, SaveToLibraryConfirmationView, WorkoutQuickViewMenuTemplate)
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

        initialize: function(options)
        {
            this.selectionManager = options.selectionManager || theMarsApp.selectionManager;
            this.featureAuthorizer = options.featureAuthorizer || theMarsApp.featureAuthorizer;

            TP.analytics("send", { "hitType": "event", "eventCategory": "quickView", "eventAction": "contextMenuOpened", "eventLabel": "" });
            
            this.on("before:reposition", this.beforeReposition, this);
            this.on("render", this._disableLockedFeatures, this);
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
            TP.analytics("send", { "hitType": "event", "eventCategory": "quickView", "eventAction": "contextMenuDeleteWorkoutClicked", "eventLabel": "" });

            this.trigger("delete");
            this.close();
        },

        onCopyClicked: function()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "quickView", "eventAction": "contextMenuCopyWorkoutClicked", "eventLabel": "" });

            this.selectionManager.setSelection(this.model);
            this.selectionManager.copySelectionToClipboard();

            this.close();
        },
        
        onCutClicked: function()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "quickView", "eventAction": "contextMenuCutWorkoutClicked", "eventLabel": "" });

            this.selectionManager.setSelection(this.model);
            this.selectionManager.cutSelectionToClipboard();

            this.close();
        },

        onSaveToLibraryClicked: function()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "quickView", "eventAction": "contextMenuSaveToLibraryClicked", "eventLabel": "" });

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
            /*var personId = theMarsApp.user.getCurrentAthleteId();
            var workoutId = this.model.id;
            var url = "https://www.trainingpeaks.com/ui/Print/default.aspx?personId=" + personId + "&workoutId=" + workoutId;
            window.open(url);
            */
            this.trigger("print");
            this.close();
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
        },

        _disableLockedFeatures: function()
        {
            if (!this.featureAuthorizer.canAccessFeature(this.featureAuthorizer.features.EditLockedWorkout, { workout: this.model }))
            {
                this.$("#workoutQuickViewMenuCutLabel").remove();
                this.$("#workoutQuickViewMenuDeleteLabel").remove();
            }
        }
    });
});
