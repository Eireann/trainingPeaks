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
            "click td.lap": "handleLapClickEditable",
            "click :not(td.lap)": "_onClick"
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

            return { lapData: subsetLapData, isCut: this.model.get("isCut") };
        },

        handleLapClickEditable: function(e)
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
            if(this.model.get('deleted'))
            {
                this._markAsDeleted();
            }
            ToolTips.enableTooltips();
        },

        _onClick: function()
        {
            this.stateModel.set("primaryRange", this.model);
        },

        _markAsDeleted: function()
        {
            this.$('td.lap').attr('disabled', true);
            this.undelegateEvents();
            this.$el.addClass('deleted');
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
