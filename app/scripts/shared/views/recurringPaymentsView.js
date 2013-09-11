define(
[
    "TP",
    "shared/views/recurringPaymentsItemView",
    "hbs!shared/templates/recurringPaymentsTemplate"
],
function(
    TP,
    RecurringPaymentsItemView,
    recurringPaymentsTemplate
)
{
    var RecurringPaymentsView = TP.CompositeView.extend(
    {

        modelEvents: {},
        
        template:
        {
            type: "handlebars",
            template: recurringPaymentsTemplate
        },
        
        itemView: RecurringPaymentsItemView,

        onRender: function()
        {
            if(!this.collection.length)
            {
                this.$el.addClass("empty");
                this.listenToOnce(this.collection, "add", _.bind(this._onAddFirstItem, this));
            }
        },

        _onAddFirstItem: function(item)
        {
            this.$el.removeClass("empty");
            this.model.set(item.attributes);
            this.render();
        }

    });

    return RecurringPaymentsView;

});

