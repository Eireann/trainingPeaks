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
            _.extend(this.events, this.saveDeleteDiscardEvents);

            this.on("render", this.saveDeleteDiscardOnRender, this);
            this.on("close", this.removeSaveOnModelChange, this);

            if (this.isNewWorkout)
                this.model.on("sync", this.addWorkoutToDay, this);
        },

        addWorkoutToDay: function()
        {
            this.model.off("sync", this.addWorkoutToDay);
            this.dayModel.trigger("workout:added", this.model);
        },

        saveDeleteDiscardOnRender: function()
        {
            if(!this.saveDeleteDiscardInitialized)
            {
                this.model.checkpoint();
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
            if (!_.isEmpty(this.model.changed))
            {

                // The model properties we are checking for here are not bound via StickIt, so
                // they have to be saved manually when the model changes.
                if(_.has(this.model.changed, "coachComments") || _.has(this.model.changed, "workoutComment") ||
                    _.has(this.model.changed, "workoutTypeValueId") || _.has(this.model.changed, "startTime"))
                {
                    this.model.save();
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
                this.model.destroy();
            else if (this.model.id)
                this.model.revert();

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
            if (this.isNewWorkout)
                this.dayModel.trigger("workout:added", this.model);

            this.close();
        }
    };

    return qvSaveDeleteDiscard;

});