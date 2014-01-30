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

        className: function()
        {
            if(this.model.getState().get("temporary"))
            {
                return "lap selection";
            }
            else if(this.model.getState().get("isLap"))
            {
                return "lap";
            }
            else if(this.model.getState().get("isTotal"))
            {
                return "lap total";
            }
            else
            {
                return "peak";
            }
        },

        template:
        {
            type: "handlebars",
            template: lapTemplate,
        },

        modelEvents: _.defaults({
            "state:change:isSelected": "_onSelectedChange",
            "change:name": "_onNameChange",
            "state:change:isLap change:totalTime state:change:isCut": "render",
            "state:change:hasLoaded": "_toggleAdd"
        }, EditableLapView.prototype.modelEvents),

        events: _.defaults({
            "click .add": "_onClickAdd",
            "change input[type=checkbox]": "_onCheckboxChange"
        }, EditableLapView.prototype.events),

        onRender: function()
        {
            this.constructor.__super__.onRender.apply(this, arguments);
            this._toggleAdd();
            this._onSelectedChange();
        },

        serializeData: function()
        {
            var data = this.constructor.__super__.serializeData.apply(this, arguments);
            /*if(data.formattedValue)
            {
                data.name += " (" + data.formattedValue + ")";
            }*/
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
            var self = this;
            this.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                this.featureAuthorizer.features.ViewGraphRanges,
                function()
                {
                    if(self.$("input").is(":checked"))
                    {
                        self.stateModel.addRange(self.model);
                    }
                    else
                    {
                        self.stateModel.removeRange(self.model);
                    }
                }
            );

            if(!this.featureAuthorizer.canAccessFeature(this.featureAuthorizer.features.ViewGraphRanges))
            {
                self.$("input[type=checkbox]").attr("checked", false);
            }
        },

        _toggleAdd: function()
        {
            this.$(".add").toggle(!!this.model.getState().get("hasLoaded")); 
        }


    });

});
