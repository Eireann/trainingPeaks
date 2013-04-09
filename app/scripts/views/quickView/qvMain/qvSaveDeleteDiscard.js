define(
[
    "underscore",
    "views/userConfirmationView",
    "hbs!templates/views/deleteConfirmationView",
    "hbs!templates/views/discardConfirmationView"
],
function(
    _,
    UserConfirmationView,
    deleteConfirmationTemplate,
    discardConfirmationTemplate
)
{
    var qvSaveDeleteDiscard = {

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
        },

        saveDeleteDiscardOnRender: function()
        {
            if(!this.saveDeleteDiscardInitialized)
            {
                this.model.checkpoint();
                this.model.on("change", this.saveOnModelChange, this);
                this.discardButtonColor = this.$("button#discard").css("color");
                this.$("button#discard").css("color", "grey");
                this.saveDeleteDiscardInitialized = true;
            }
        },

        removeSaveOnModelChange: function()
        {
            this.model.off("change", this.saveOnModelChange);
        },

        saveOnModelChange: function()
        {
            if (!_.isEmpty(this.model.changed))
            {
                this.enableDiscardButton();

                if (_.has(this.model.changed, "description") || _.has(this.model.changed, "title") ||
                    _.has(this.model.changed, "coachComments") || _.has(this.model.changed, "workoutComment") ||
                    _.has(this.model.changed, "newComment") || _.has(this.model.changed, "workoutTypeValueId"))
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
            // Only discard changes and save if we already have an id (if the workout is not new)
            if (this.model.id)
                this.model.revert();

            this.trigger("discard");
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
            this.close();
            // pass wait here so it won't actually remove the model until the server call returns,
            // which will then remove the view and the waiting indicator
            this.model.destroy({ wait: true });
        },

        onCloseClicked: function()
        {
            this.trigger("close");
            this.close();
        }

    };

    return qvSaveDeleteDiscard;

});