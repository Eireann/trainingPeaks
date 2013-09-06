define(
[
    "TP",
    "backbone",
    "shared/models/recurringPaymentsCollection",
    "shared/models/paymentHistoryCollection",
    "shared/views/userSettingsFormView",
    "shared/views/paymentHistoryView",
    "shared/views/recurringPaymentsView",
    "hbs!shared/templates/userSettingsView"
],
function(
    TP,
    Backbone,
    RecurringPaymentsCollection,
    PaymentHistoryCollection,
    UserSettingsFormView,
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
       
        modal:
        {
            mask: true,
            shadow: true
        },

        template:
        {
            type: "handlebars",
            template: userSettingsViewTemplate
        },

        events:
        {
            "click .closeIcon": "close",
            "click .save": "save"
        },

        modelEvents: {},
        
        initialize: function()
        {
            this.recurringPaymentsCollection = new RecurringPaymentsCollection();
            this.paymentHistoryCollection = new PaymentHistoryCollection();
            this.recurringPaymentsCollection.fetch();
            this.paymentHistoryCollection.fetch();
            UserSettingsView.__super__.initialize.apply(this, arguments);
            this.children = new Backbone.ChildViewContainer();
        },

        render: function()
        {
            UserSettingsView.__super__.render.apply(this, arguments);

            this._addView(".userSettingsForm", UserSettingsFormView, {
                model: this.model
            }, "userSettingsForm");

            this._addView(".paymentHistory", PaymentHistoryView, {
                collection: this.paymentHistoryCollection,
                model: this.model
            }, "paymentHistory");

            this._addView(".recurringPayments", RecurringPaymentsView, {
                collection: this.recurringPaymentsCollection,
                model: new TP.Model({ expireDate: this.model.get("expireDate")})
            }, "recurringPayments");

            this.rePositionView();
        },

        close: function()
        {
            this.children.apply("close", arguments);
            UserSettingsView.__super__.close.apply(this, arguments);
        },

        save: function()
        {
            var self = this;
            self.waitingOn();
            $.when(
                this.children.findByCustom("userSettingsForm").save()
            ).done(
                function()
                {
                    self.close();
                }
            );
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
