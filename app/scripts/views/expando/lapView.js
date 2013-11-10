define(
[
    "underscore",
    "views/expando/editableLapView",
    "hbs!templates/views/expando/lapTemplate"
],
function(
    _,
    EditableLapView,
    lapTemplate
)
{

    return EditableLapView.extend(
    {

        tagName: "li",

        template:
        {
            type: "handlebars",
            template: lapTemplate,
        },

        modelEvents: _.defaults({
            "state:change:isSelected": "_onSelectedChange",
            "change:name": "_onNameChange",
            "state:change:isLap change:totalTime state:change:isCut": "render"
        }, EditableLapView.prototype.modelEvents),

        events: _.defaults({
            "click .add": "_onClickAdd",
            "change input[type=checkbox]": "_onCheckboxChange"
        }, EditableLapView.prototype.events),

        onRender: function()
        {
            this.constructor.__super__.onRender.apply(this, arguments);
            this._onSelectedChange();
        },

        serializeData: function()
        {
            var data = this.constructor.__super__.serializeData.apply(this, arguments);
            if(data.formattedValue)
            {
                data.name += " (" + data.formattedValue + ")";
            }
            data._state = this.model.getState().toJSON();
            return data;
        },

        _onNameChange: function()
        {
            this.render();

            if(this.model.getState().get("isFocused"))
            {
                this.stateModel.trigger('change:primaryRange', this.stateModel, this.model);
            }
        },

        _onSelectedChange: function()
        {
            this.$("input[type=checkbox]").attr("checked", !!this.model.getState().get("isSelected"));
        },

        _onClickAdd: function(e)
        {
            e.preventDefault();
            this.model.getState().set({temporary: false, isLap: true });
            this._startEditing(e);
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

});
