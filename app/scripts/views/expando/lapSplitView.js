define(
[
    "underscore",
    "TP",
    "utilities/lapsStats",
    "framework/tooltips",
    "hbs!templates/views/expando/lapSplitTemplate"
],
function(
    _,
    TP, 
    LapsStats,
    ToolTips,
    lapSplitTemplate
    )
{
    return TP.ItemView.extend(
    {

        initialize: function(options)
        {
            this.stateModel = options.stateModel;
        },

        events:
        {
            "click": "_onClick"
        },

        modelEvents:
        {
            "state:change:isDeleted": "_markIfDeleted",
            "state:change:isFocused": "_markIfFocused",
            "change": "render"
        },

        tagName: 'tr',

        template:
        {
            type: "handlebars",
            template: lapSplitTemplate
        },

        serializeData: function()
        {
            var data = [],
                empties = {};
            var obj = this.model.toJSON();

            LapsStats.formatLapObject(obj, this.workoutDefaults, data, empties, this.model.collection.availableDataChannels);

            var allLapData = {};
            _.each(data[0], function(value, key)
            {
                var dataArray = key.split(' ');
                var keyName = [dataArray[0].toLowerCase(), dataArray.slice(1).join('')].join('');

                allLapData[keyName] = value;
            });


            var subsetLapData = [];
            _.each(this.keyNames, function(keyName, index)
                {
                    subsetLapData.push( { key: keyName, value: allLapData[keyName] } );
                }, this);

            return { lapData: subsetLapData, _state: this.model.getState().toJSON() };
        },

        _startEditing: function(e)
        {
            var $currentTarget = $(e.currentTarget);
            if($currentTarget.hasClass('editing')) return false;
            e.preventDefault();

            this.stateModel.set("primaryRange", this.model);
            var $lapName = this.$("td.lap");
            ToolTips.disableTooltips();
            var $input = $('<input type="text"/>');
            $input.val($lapName.text());
            $lapName.empty().append($input).addClass('editing');
            $input.on("change", _.bind(this._onInputChange, this));
            $input.on("blur enter", _.bind(this._stopEditing, this));
            $input.on("cancel", _.bind(this._cancelEditing, this));
            $input.focus().select();
        },

        onRender: function()
        {
            this._markIfDeleted();
            this._markIfFocused();            
            ToolTips.enableTooltips();
        },

        _onClick: function(e)
        {
            // first clicks sets model as focused, second click begins editing
            if(!this.model.getState().get("isFocused"))
            {
                this.stateModel.set("primaryRange", this.model);
            }
            else if(this.model.getState().get("isLap") && !this.model.getState().get("isEditing"))
            {
                this._startEditing(e);
            }
        },

        _markIfDeleted: function()
        {
            if(this.model.getState().get('isDeleted'))
            {
                this.$('td.lap').attr('disabled', true);
                this.undelegateEvents();
                this.$el.addClass('deleted');
            }
        },

        _markIfFocused: function()
        {
            if(this.model.getState().get("isFocused"))
            {
                this.$el.addClass('highlight');
            }
            else
            {
                this.$el.removeClass("highlight");
            }
        },

        _onInputChange: function(e)
        {
            var $input = $(e.currentTarget);
            this.model.set("name", $.trim($input.val()));
        },

        _cancelEditing: function(e)
        {
            this._stopEditing(e, true);
        },

        _stopEditing: function(e, cancel)
        {
            e.preventDefault();
            var $input = $(e.currentTarget);

            if(!cancel)
            {
                this.model.set("name", $.trim($input.val()));
            }
            $input.closest("td").html(this.model.get("name")).removeClass("editing");
            $input.off("change blur enter cancel");
            ToolTips.enableTooltips();
        }

    });
});
