define(
[],
function(
)
{

    var accounting = {

        recurringPaymentProfileTypes: [
            { data: 0, label: "Account Subscription" },
            { data: 1, label: "Library Subscription" },
            { data: 2, label: "Express Account Subscription" }
        ],

        payPeriods: [
            { data: 1, label: "Monthly" },
            { data: 3, label: "Quarterly" },
            { data: 6, label: "Semi-Annually" },
            { data: 12, label: "Annually" }
        ]
    };


    return accounting;
});

