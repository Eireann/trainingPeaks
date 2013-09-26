define(
[
    "TP",
    "shared/views/paymentHistoryItemView",
    "hbs!shared/templates/paymentHistoryTemplate"
],
function(
    TP,
    PaymentHistoryItemView,
    paymentHistoryTemplate
)
{
    var PaymentHistoryView = TP.CompositeView.extend(
    {

        modelEvents: {},
        
        template:
        {
            type: "handlebars",
            template: paymentHistoryTemplate
        },
        
        itemView: PaymentHistoryItemView,

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

    return PaymentHistoryView;

});
