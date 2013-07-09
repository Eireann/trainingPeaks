define(
[
    "underscore",
    "moment",
    "TP"
],
function(
    _,
    moment,
    TP
    )
{

    return {

        buildPmcParameters: function(baseSettings)
        {
            var pmcSettings = _.clone(baseSettings);

            if (!pmcSettings.quickDateSelectOption)
            {
                pmcSettings.quickDateSelectOption = this.pmcDateOptions.LAST_90_DAYS_AND_NEXT_21_DAYS.id;
            }

            var dateOption = this.findPmcDateOption(this.pmcDateOptions, pmcSettings.quickDateSelectOption);

            pmcSettings.startDate = dateOption.getStartDate(pmcSettings);
            pmcSettings.endDate = dateOption.getEndDate(pmcSettings);
            return pmcSettings;
        },

        findPmcDateOption: function(dateOptions, selectedOptionId)
        {
            return _.find(dateOptions, function(dateOption)
            {
                return this.id === Number(selectedOptionId);
            });
        },

        pmcDateOptions:
        {
            CUSTOM_DATES:
            {
                id: 2,
                label: TP.utils.translate("Custom dates"),
                customStartDate: true,
                customEndDate: true,

                getStartDate: function(pmcSettings)
                {
                    return pmcSettings.startDate;
                },

                getEndDate: function(pmcSettings)
                {
                    return pmcSettings.endDate;
                }
            },

            CUSTOM_DATE_THROUGH_TODAY:
            {
                id: 22,
                label: TP.utils.translate("Custom date through today"),
                customStartDate: true,

                getStartDate: function(pmcSettings)
                {
                    return pmcSettings.startDate;
                },

                getEndDate: function()
                {
                    return moment();
                }
            },

            LAST_7_DAYS:
            {
                id: 3,
                label: TP.utils.translate("Last 7 days"),

                getEndDate: function()
                {
                    return moment();
                },

                getStartDate: function()
                {
                    return moment().subtract("days", 7);
                }
            },

            LAST_14_DAYS:
            {
                id: 4,
                label: TP.utils.translate("Last 14 days"),
                getEndDate: function()
                {
                    return moment();
                },

                getStartDate: function()
                {
                    return moment().subtract("days", 14);
                }
            },

            LAST_28_DAYS:
            {
                id: 5,
                label: TP.utils.translate("Last 28 days"),
                getEndDate: function()
                {
                    return moment();
                },

                getStartDate: function()
                {
                    return moment().subtract("days", 28);
                }
            },

            LAST_90_DAYS:
            {
                id: 6,
                label: TP.utils.translate("Last 90 days"),
                getEndDate: function()
                {
                    return moment();
                },

                getStartDate: function()
                {
                    return moment().subtract("days", 90);
                }
            },

            LAST_180_DAYS:
            {
                id: 7,
                label: TP.utils.translate("Last 180 days"),
                getEndDate: function()
                {
                    return moment();
                }
            },

            LAST_365_DAYS:
            {
                id: 8,
                label: TP.utils.translate("Last 365 days"),
                getEndDate: function()
                {
                    return moment();
                },

                getStartDate: function()
                {
                    return moment().subtract("days", 365);
                }
            },

            THIS_WEEK:
            {
                id: 9,
                label: TP.utils.translate("This week"),
                getStartDate: function()
                {
                    var thisWeek = moment().week();
                    return moment().week(thisWeek).day(1);
                },

                getEndDate: function()
                {
                    var thisWeek = moment().week();
                    return moment().week(thisWeek).day(7);
                }
            },

            THIS_MONTH:
            {
                id: 10,
                label: TP.utils.translate("This month"),
                getStartDate: function()
                {
                    return moment().date(1);
                },
                getEndDate: function()
                {
                    return moment().date(moment.daysInMonth());
                }
            },

            THIS_YEAR:
            {
                id: 11,
                label: TP.utils.translate("This year"),
                getStartDate: function()
                {
                    return moment().month(0).date(1);
                },
                getEndDate: function()
                {
                    return moment().month(11).date(31);
                }
            },

            LAST_WEEK:
            {
                id: 12,
                label: TP.utils.translate("Last week"),
                getStartDate: function()
                {
                    var lastWeek = moment().week();
                    return moment().week(lastWeek).day(1);
                },

                getEndDate: function()
                {
                    var lastWeek = moment().week();
                    return moment().week(lastWeek).day(7);
                }
            },

            LAST_MONTH:
            {
                id: 13,
                label: TP.utils.translate("Last month"),
                getStartDate: function()
                {
                    return moment().date(1).subtract("months", 1);
                },
                getEndDate: function()
                {
                    var start = this.getStartDate();
                    return start.date(start.daysInMonth());
                }
            },

            LAST_3_MONTHS:
            {
                id: 14,
                label: TP.utils.translate("Last 3 months"),
                getStartDate: function()
                {
                    return moment().date(1).subtract("months", 3);
                },
                getEndDate: function()
                {
                    var start = this.getStartDate();
                    return start.date(start.daysInMonth());
                }
            },

            LAST_YEAR:
            {
                id: 15,
                label: TP.utils.translate("Last year"),
                getStartDate: function()
                {
                    return moment().month(0).date(1).subtract("years", 1);
                },
                getEndDate: function()
                {
                    return moment().month(11).date(31).subtract("years", 1);
                }
            },

            LAST_2_YEARS:
            {
                id: 16,
                label: TP.utils.translate("Last 2 years"),
                getStartDate: function()
                {
                    return moment().month(0).date(1).subtract("years", 2);
                },
                getEndDate: function()
                {
                    return moment().month(11).date(31).subtract("years", 2);
                }
            },

            THIS_WEEK_LAST_YEAR:
            {
                id: 17,
                label: TP.utils.translate("This week ast year"),
                getStartDate: function()
                {
                    var thisWeek = moment().week();
                    return moment().subtract("years", 1).week(thisWeek).day(1);
                },

                getEndDate: function()
                {
                    var thisWeek = moment().week();
                    return moment().subtract("years", 1).week(thisWeek).day(7);
                }
            },

            THIS_MONTH_LAST_YEAR:
            {
                id: 18,
                label: TP.utils.translate("This month year"),

                getStartDate: function()
                {
                    return moment().subtract("years", 1).month(moment().month()).day(1);
                },

                getEndDate: function()
                {
                    var thisWeek = moment().week();
                    return moment().subtract("years", 1).month(moment().month()).day(7);
                }
            },


            LAST_28_DAYS_AND_NEXT_7_DAYS:
            {
                id: 19,
                label: TP.utils.translate("Last 28 and next 7 days"),
                getStartDate: function()
                {
                    return moment().subtract("days", 28);
                },

                getEndDate: function()
                {
                    return moment().add("days", 7);
                }
            },

            LAST_90_DAYS_AND_NEXT_21_DAYS:
            {
                id: 20,
                label: TP.utils.translate("Last 90 and next 21 days"),
                getStartDate: function()
                {
                    return moment().subtract("days", 90);
                },

                getEndDate: function()
                {
                    return moment().add("days", 21);
                }
            },

            LAST_180_DAYS_AND_NEXT_45_DAYS:
            {
                id: 21,
                label: TP.utils.translate("Last 180 and next 45 days"),
                getStartDate: function()
                {
                    return moment().subtract("days", 180);
                },

                getEndDate: function()
                {
                    return moment().add("days", 45);
                }
            },

            CUSTOM_DATE_THROUGH_NEXT_7_DAYS:
            {
                id: 23,
                label: TP.utils.translate("Custom date through next 7 days"),
                customStartDate: true,

                getStartDate: function(pmcSettings)
                {
                    return pmcSettings.startDate;
                },

                getEndDate: function()
                {
                    return moment().add("days", 7);
                }
            }
        }
    };

});