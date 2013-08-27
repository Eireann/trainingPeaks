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
                var self = this;
                this.listenToOnce(this.collection, "add", function()
                {
                    self.$el.removeClass("empty");
                });
            }
        }

    });

    return RecurringPaymentsView;

});

