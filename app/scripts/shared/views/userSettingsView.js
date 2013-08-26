define(
[
    "TP",
    "backbone",
    "shared/models/recurringPaymentsCollection",
    "shared/models/paymentHistoryCollection",
    "shared/views/paymentHistoryView",
    "shared/views/recurringPaymentsView",
    "hbs!shared/templates/userSettingsView"
],
function(
    TP,
    Backbone,
    RecurringPaymentsCollection,
    PaymentHistoryCollection,
    PaymentHistoryView,
    RecurringPaymentsView,
    userSettingsViewTemplate
)
{
    var UserSettingsView = TP.ItemView.extend(
    {
        showThrobbers: false,
        tagName: "div",
        className: "userSettings",
       
        modal: true,

        template:
        {
            type: "handlebars",
            template: userSettingsViewTemplate
        },

        events:
        {
            "click .closeIcon": "close"
        },

        initialize: function()
        {
            this.recurringPaymentsCollection = new RecurringPaymentsCollection();
            this.paymentHistoryCollection = new PaymentHistoryCollection();
            this.recurringPaymentsCollection.fetch();
            this.paymentHistoryCollection.fetch();
        },

        render: function()
        {
            UserSettingsView.__super__.render.apply(this, arguments);
            this.children = new Backbone.ChildViewContainer();

            this._addView(".paymentHistory", PaymentHistoryView, {
                collection: this.paymentHistoryCollection 
            }, "paymentHistory");

            this._addView(".recurringPayments", RecurringPaymentsView, {
                collection: this.recurringPaymentsCollection
            }, "recurringPayments");
        },

        close: function()
        {
            this.children.apply("close", arguments);
            UserSettingsView.__super__.close.apply(this, arguments);
        },

        _addView: function(selector, klass, options, name)
        {
            var el = this.$(selector);
            options = _.extend(options, { el: el });
            var view = new klass(options);
            this.children.add(view, name);
            view.render();
        }
    });

    return UserSettingsView;
});
