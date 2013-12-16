define(
[
    "underscore",
    "views/userConfirmationView",
    "hbs!templates/views/confirmationViews/deleteConfirmationView",
    "hbs!templates/views/confirmationViews/discardConfirmationView"
],
function(
    _,
    UserConfirmationView,
    deleteConfirmationTemplate,
    discardConfirmationTemplate
)
{
    var qvSaveDeleteDiscard =
    {
        saveDeleteDiscardEvents:
        {
            "click #delete": "onDeleteWorkout",
            "click #discard": "onDiscardClicked",
            "click #close": "onCloseClicked",
            "click #closeIcon": "onCloseClicked"
        },

        initializeSaveDeleteDiscard: function()
        {
            var self = this;
            
            _.extend(this.events, this.saveDeleteDiscardEvents);

            this.on("render", this.saveDeleteDiscardOnRender, this);
            this.on("close", this.removeSaveOnModelChange, this);

            if (this.isNewWorkout)
            {
                var dayToAddTo = this.dayModel;
                var newWorkoutModel = this.model;

                var onSyncNewWorkout = function()
                {
                    self.initializeTimePicker();
                    theMarsApp.calendarManager.addItem(newWorkoutModel);
                    theMarsApp.selectionManager.setSelection(newWorkoutModel);
                };

                this.model.once("sync", onSyncNewWorkout);
            }
        },

        saveDeleteDiscardOnRender: function()
        {
            if(!this.saveDeleteDiscardInitialized)
            {
                this.model.checkpoint();
                var details = this.model.get("details");
                details.getFetchPromise().done(function() {
                    details.checkpoint();
                });
                this.model.on("change", this.saveOnModelChange, this);
                this.model.on("change", this.enableDiscardButtonOnModelChange, this);
                this.on("change:details", this.enableDiscardButtonOnModelChange, this);
                this.discardButtonColor = this.$("button#discard").css("color");
                this.$("button#discard").css("color", "grey");
                this.saveDeleteDiscardInitialized = true;
            }
        },

        removeSaveOnModelChange: function()
        {
            this.model.off("change", this.saveOnModelChange);
            this.model.off("change", this.enableDiscardButtonOnModelChange);
            this.off("change:details", this.enableDiscardButtonOnModelChange);
        },

        enableDiscardButtonOnModelChange: function(model)
        {
            if (!_.isEmpty(model.changed) && !_.has(model.changed, "workoutDay"))
                this.enableDiscardButton();
        },

        saveOnModelChange: function()
        {
            // if this change was triggered by a fetch, don't save
            if(arguments.length === 2)
            {
                var options = arguments[1];
                if(options && options.xhr)
                {
                    return;
                }
            }

            if (!_.isEmpty(this.model.changed))
            {
                // The model properties we are checking for here are not bound via StickIt, so
                // they have to be saved manually when the model changes.
                if(_.has(this.model.changed, "workoutComment") ||
                   _.has(this.model.changed, "workoutTypeValueId") ||
                   _.has(this.model.changed, "startTime") || _.has(this.model.changed, "startTimePlanned"))
                {
                    this.model.autosave();
                }
            }
        },

        enableDiscardButton: function()
        {
            this.$("button#discard").removeAttr("disabled");
            this.$("button#discard").css("color", this.discardButtonColor);
        },

        onDiscardClicked: function()
        {
            this.discardConfirmation = new UserConfirmationView({ template: discardConfirmationTemplate });
            this.discardConfirmation.render();
            this.discardConfirmation.on("userConfirmed", this.onDiscardChangesConfirmed, this);
        },

        onDiscardChangesConfirmed: function()
        {
            if (this.isNewWorkout)
            {
                this.model.destroy();
            }
            else if (this.model.id)
            {
                this.model.revert();
                this.model.get("details").revert();
            }

            this.close();
        },

        onDeleteWorkout: function()
        {
            this.deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationTemplate });
            this.deleteConfirmationView.render();
            this.deleteConfirmationView.on("userConfirmed", this.onDeleteWorkoutConfirmed, this);
        },

        onDeleteWorkoutConfirmed: function()
        {
            // pass wait here so it won't actually remove the model until the server call returns,
            // which will then remove the view and the waiting indicator
            this.model.destroy({ wait: true });
            this.close();
        },

        onCloseClicked: function()
        {
            this.close();
        }
    };

    return qvSaveDeleteDiscard;

});
