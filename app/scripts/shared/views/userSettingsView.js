﻿define(
[
    "TP",
    "backbone",
    "shared/views/userSettingsFormView",
    "shared/views/paymentHistoryView",
    "shared/views/recurringPaymentsView",
    "hbs!shared/templates/userSettingsView"
],
function(
    TP,
    Backbone,
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
                collection: new TP.Collection([{ paypalDate: moment(), totalAsDollars: 42.3 }])
            }, "paymentHistory");

            this._addView(".recurringPayments", RecurringPaymentsView, {
                collection: new TP.Collection([{}])
            }, "recurringPayments");

            this.rePositionView();
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
