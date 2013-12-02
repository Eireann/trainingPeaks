define(
[
    "jquery",
    "underscore",
    "TP"
],
function(
    $,
    _,
    TP
)
{

    var MultiSelectView = TP.ItemView.extend(
    {

        template: _.template(""),

        events:
        {
            "change input": "_updateState"
        },

        initialize: function(options)
        {
            this.items = options.items;
            this.attribute = options.attribute;

            this.allValues = _.pluck(this.items, "value");
        },

        onRender: function()
        {
            this.$el.append("<label><input type='checkbox' class='all'> All</label>");

            _.each(this.items, function(item)
            {
                var $label = $("<label/>").text(" " + item.label);
                var $input = $("<input type='checkbox'>").data("value", item.value);

                $input.prop("checked", _.contains(this.model.get(this.attribute), item.value));

                $label.prepend($input);

                this.$el.append($label);
            }, this);

            this._updateState();
        },

        _updateState: function(e)
        {
            if(e && $(e.target).hasClass("all"))
            {
                this.$("input[type=checkbox]:not(.all)").prop("checked", $(e.target).is(":checked"));
            }

            var values = _.map(this.$("input[type=checkbox]:checked"), function(element)
            {
                return $(element).data("value");
            });

            values = _.intersection(this.allValues, values);
            var all = values.length === this.items.length;

            this.model.set(this.attribute, all ? this.allValues : values);
            this.$("input[type=checkbox].all").prop("checked", all);
        }

    });

    return MultiSelectView;

});
