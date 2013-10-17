define(
[
    "TP",
    "models/commands/saveWorkoutDetailData",
    "hbs!templates/views/expando/editControlsTemplate"
],
function(
    TP,
    SaveWorkoutDetailDataCommand,
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
            if(this.model.get("detailData").get("channelCuts"))
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
            alert("Not Implemented");
        },

        _applyEdits: function()
        {
            var params =
            {
                channelCuts: this.model.get("detailData").get("channelCuts")
            }; 
            var command = new SaveWorkoutDetailDataCommand(params);
            command.workoutId = this.model.get('workoutId');
            command.execute()
                .done(_.bind(this._handleApplyDone, this))
                .fail(_.bind(this._handleApplyFail, this));
        },

        _handleApplyDone: function()
        {
            this._resetModels();
        },

        _handleApplyFail: function()
        {
            alert('failed');
            this.trigger("reset");
        },

        _resetModels: function()
        {
            this.model.fetch();
            this.model.get("details").fetch();
            this.model.get("detailData").fetch();
        }

    });
});
