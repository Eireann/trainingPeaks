﻿define(
[
    "TP",
    "models/commands/saveWorkoutDetailData",
    "views/userConfirmationView",
    "hbs!templates/views/expando/unableToSaveEditsTemplate",
    "hbs!templates/views/expando/editControlsTemplate"
],
function(
    TP,
    SaveWorkoutDetailDataCommand,
    UserConfirmationView,
    unableToSaveEditsTemplate,
    editControlsTemplate
    )
{
    return TP.ItemView.extend({

        className: "expandoEditControls",

        events:
        {
            "click .apply": "_applyEdits",
            "click .cancel": "_cancelEdits"
        },

        template:
        {
            type: "handlebars",
            template: editControlsTemplate
        },

        initialize: function(options)
        {
            this.stateModel = options.stateModel;
            this.listenTo(this.model.get("detailData"), "change", _.bind(this.render, this));
        },

        onRender: function()
        {
            if(this.model.get("detailData").hasEdits())
            {
                this.$el.removeClass("disabled");
            }
            else
            {
                this.$el.addClass("disabled");
            }
        },

        _cancelEdits: function()
        {
            this.model.get("detailData").reset();
        },

        _applyEdits: function()
        {
            var params =
            {
                channelCuts: this.model.get("detailData").getChannelCuts(),
                lapsStats: this.model.get("detailData").getEditedLapsStats()
            }; 

            var command = new SaveWorkoutDetailDataCommand(params);
            command.workoutId = this.model.get('workoutId');
            command.execute()
                .done(_.bind(this._handleApplyDone, this))
                .fail(_.bind(this._handleApplyFail, this));
        },

        _handleApplyDone: function()
        {
             this.model.get("detailData").reset();
            this.model.fetch();
            this.model.get("details").fetch();
            this.model.get("detailData").fetch();
        },

        _handleApplyFail: function()
        {
            var confirmationView = new UserConfirmationView(
            {
                template: unableToSaveEditsTemplate
            });               

            confirmationView.render();
            this.model.get("detailData").reset();
        }
    });
});
