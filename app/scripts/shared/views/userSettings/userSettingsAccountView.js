define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/views/userSettingsFormView",
    "shared/views/paymentHistoryView",
    "shared/views/recurringPaymentsView",
    "hbs!shared/templates/userSettings/userSettingsAccountTemplate"
],
function(
    _,
    TP,
    Backbone,
    UserSettingsFormView,
    PaymentHistoryView,
    RecurringPaymentsView,
    userSettingsAccountTemplate
)
{

    var UserSettingsView = TP.ItemView.extend(
    {

        modelEvents: {},
        
        template:
        {
            type: "handlebars",
            template: userSettingsAccountTemplate
        },

        events:
        {
            "click .closeIcon": "close",
            "click .save": "save"
        },

        initialize: function(options)
        { 
            if(!options || !options.userModel)
            {
                throw new Error("UserSettingsFormView requires a user model");
            }

            if(!options || !options.recurringPaymentsCollection)
            {
                throw new Error("UserSettingsFormView requires a recurring payments collection");
            }

            if(!options || !options.paymentHistoryCollection)
            {
                throw new Error("UserSettingsFormView requires a payment history collection");
            }

            UserSettingsView.__super__.initialize.apply(this, arguments);

            this.userModel = options.userModel;
            this.recurringPaymentsCollection = options.recurringPaymentsCollection; 
            this.paymentHistoryCollection = options.paymentHistoryCollection; 
            this.children = new Backbone.ChildViewContainer();
            this.options = options;

            this.on("render", this._addChildViews, this);
        },

        subNavigation:
        [
            {
                title: "Profile",
                target: "profile"
            },
            {
                title: "Settings",
                target: "account"
            },
            {
                title: "Calendar",
                target: "calendar"
            },
            {
                title: "Email Options",
                target: "email"
            },
            {
                title: "Payments",
                target: "payments"
            }
        ],
        
        applyFormValuesToModels: function()
        {
            this.children.call("applyFormValuesToModels");
        },

        _addChildViews: function()
        {
            this._addView(".userSettingsForm", UserSettingsFormView, this.options, "userSettingsForm");

            this._addView(".paymentHistory", PaymentHistoryView, {
                collection: this.paymentHistoryCollection,
                model: this.userModel
            }, "paymentHistory");

            this._addView(".recurringPayments", RecurringPaymentsView, {
                collection: this.recurringPaymentsCollection,
                model: new TP.Model({ expireDate: this.userModel.get("expireDate")})
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
