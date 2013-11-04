define(
[
    "underscore",

    "TP",
    "framework/tooltips",
    "views/userConfirmationView",

    "hbs!templates/views/expando/lapTemplate",
    "hbs!templates/views/confirmationViews/deleteLapTemplate"
],
function(
    _,
    TP,
    ToolTips,
    UserConfirmationView,
    lapTemplate,
    deleteLapTemplate
)
{

    var LapView = TP.ItemView.extend(
    {

        tagName: "li",
        className: "lap clickable",

        template:
        {
            type: "handlebars",
            template: lapTemplate,
        },

        modelEvents:
        {
            "change:isFocused": "_onFocusedChange",
            "change:isSelected": "_onSelectedChange",
            "change:name": "_onNameChange",
            "change:isLap change:totalTime change:isCut": "render"
        },

        events:
        {
            "click .lapDescription": "_onClick",
            "click .delete": "_onClickDelete",
            "click .add": "_onClickAdd",
            "change input[type=checkbox]": "_onCheckboxChange"
        },

        initialize: function(options)
        {
            this.stateModel = options.stateModel;
        },

        onRender: function()
        {
            this._onFocusedChange();
            this._onSelectedChange();

            if(this.model.get("isEditing"))
            {
                this._startEditing();
            }
        },

        serializeData: function()
        {
            var data = LapView.__super__.serializeData.apply(this, arguments);
            if(data.formattedValue)
            {
                data.name += " (" + data.formattedValue + ")";
            }
            return data;
        },

        _onNameChange: function()
        {
            this.render();

            if(this.model.get("isFocused"))
            {
                this.stateModel.trigger('change:primaryRange', this.stateModel, this.model);
            }
        },

        _onFocusedChange: function()
        {
            var focused = !!this.model.get("isFocused");
            this.$el.toggleClass("highlight", focused);
        },

        _onSelectedChange: function()
        {
            this.$("input[type=checkbox]").attr("checked", !!this.model.get("isSelected"));
        },

        _onClick: function(e)
        {
            // first clicks sets model as focused, second click begins editing
            if(!this.model.get("isFocused"))
            {
                this.stateModel.set("primaryRange", this.model);
            }
            else if(this.model.get("isLap") && !this.model.get("isEditing"))
            {
                this._startEditing();
            }
        },

        _startEditing: function()
        {
            if(this.model.get("isLap"))
            {

                this.model.set("isEditing", true);
                var $container = this.$(".editLapName");
                var $input = $('<input type="text"/>');
                $input.val(this.model.get("name"));

                ToolTips.disableTooltips();

                $container.empty().append($input);
                this.$el.addClass('editing');
                $input.on("blur enter", _.bind(this._stopEditing, this));
                $input.on("cancel", _.bind(this._cancelEditing, this));
                $input.focus().select();
            }
        },

        _cancelEditing: function(e)
        {
            e.preventDefault();
            this._stopEditing(e, true);
        },

        _stopEditing: function(e, cancel)
        {
            if(this.model.get("isLap"))
            {

                this.model.set("isEditing", false);

                var $input = this.$("input[type=text]");

                if($input && $input.length)
                {
                    var name = $input.val();
                    this.$("input[type=text]").off("blur enter");
                    this.$(".editLapName").empty().text(this.model.get("name"));
                    this.$el.removeClass("editing");
                    ToolTips.enableTooltips();

                    if(!cancel)
                    {
                        this.model.set("name", name);
                    }
                }

            }
        },

        _onClickDelete: function(e)
        {
            this.deleteConfirmationView = new UserConfirmationView({ template: deleteLapTemplate });
            this.deleteConfirmationView.render();
            this.listenTo(this.deleteConfirmationView, "userConfirmed", _.bind(this._deleteLap, this));
        },

        _onClickAdd: function(e)
        {
            this.model.set({temporary: false, isLap: true, isEditing: true});
        },

        _deleteLap: function()
        {
            if(this.model.get("isFocused"))
            {
                this.stateModel.set("primaryRange", null);
            }
            this.model.set({ deleted: true, isFocused: false });
            this.$el.addClass('deleted');
            this.model.trigger('lap:markedAsDeleted', this.model);
            this.undelegateEvents();
            this.$('input').attr('disabled', true);
            this.stateModel.removeRange(this.model);
        },

        _onCheckboxChange: function(e)
        {
            if(this.$("input").is(":checked"))
            {
                this.stateModel.addRange(this.model);
            }
            else
            {
                this.stateModel.removeRange(this.model);
            }
        }

    });

    return LapView;

});
