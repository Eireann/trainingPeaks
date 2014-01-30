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

    var chartDateOptions = 
    {
        USE_GLOBAL_DATES:
        {
            id: 1,
            label: TP.utils.translate("Use Dashboard Settings"),
            customStartDate: false,
            customEndDate: false,

            getStartDate: function(chartSettings)
            {
                var globalSettings = chartUtils.findGlobalChartSettings();
                var chartSettingsHandler = chartUtils.findGlobalChartSettingsHandler();
                return chartSettingsHandler.getStartDate(globalSettings);
            },

            getEndDate: function(chartSettings)
            {
                var globalSettings = chartUtils.findGlobalChartSettings();
                var chartSettingsHandler = chartUtils.findGlobalChartSettingsHandler();
                return chartSettingsHandler.getEndDate(globalSettings);
            }
        },

        CUSTOM_DATES:
        {
            id: 2,
            label: TP.utils.translate("Custom dates"),
            customStartDate: true,
            customEndDate: true,

            getStartDate: function(chartSettings)
            {
                return chartSettings.startDate ? moment.utc(chartSettings.startDate) : moment().subtract("weeks", 1);
            },

            getEndDate: function(chartSettings)
            {
                return chartSettings.endDate ? moment.utc(chartSettings.endDate) : moment();
            }
        },

        CUSTOM_DATE_THROUGH_TODAY:
        {
            id: 22,
            label: TP.utils.translate("Custom date through today"),
            customStartDate: true,

            getStartDate: function(chartSettings)
            {
                return chartSettings.startDate ? moment.utc(chartSettings.startDate) : moment().subtract("weeks", 1);
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
            },

            getStartDate: function()
            {
                return moment().subtract("days", 180);
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

        LAST_730_DAYS:
        {
            id: 730,
            label: TP.utils.translate("Last 730 days"),
            getStartDate: function()
            {
                return moment().subtract("years", 2).add("days", 1);
            },
            getEndDate: function()
            {
                return moment();
            }
        },

        THIS_WEEK:
        {
            id: 9,
            label: TP.utils.translate("This week"),
            getStartDate: function()
            {
                var thisWeek = moment().week();
                return moment().week(thisWeek).startOf("week");
            },

            getEndDate: function()
            {
                var thisWeek = moment().week();
                return moment().week(thisWeek).endOf("week");
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
                return moment().date(moment().daysInMonth());
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
                var lastWeek = moment().week() - 1;
                return moment().week(lastWeek).startOf("week");
            },

            getEndDate: function()
            {
                var lastWeek = moment().week() - 1;
                return moment().week(lastWeek).endOf("week");
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
                var lastMonth = moment().date(1).subtract("months", 1);
                return lastMonth.date(lastMonth.daysInMonth());
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
                return moment().month(11).date(31).subtract("years", 1);
            }
        },

        THIS_WEEK_LAST_YEAR:
        {
            id: 17,
            label: TP.utils.translate("This week last year"),
            getStartDate: function()
            {
                var thisWeek = moment().week();
                return moment().subtract("years", 1).week(thisWeek).startOf("week");
            },

            getEndDate: function()
            {
                var thisWeek = moment().week();
                return moment().subtract("years", 1).week(thisWeek).endOf("week");
            }
        },

        THIS_MONTH_LAST_YEAR:
        {
            id: 18,
            label: TP.utils.translate("This month last year"),

            getStartDate: function()
            {
                return moment().subtract("years", 1).month(moment().month()).date(1);
            },

            getEndDate: function()
            {
                var thisWeek = moment().week();
                var lastYear = moment().subtract("years", 1).month(moment().month());
                return lastYear.date(lastYear.daysInMonth());
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

            getStartDate: function(chartSettings)
            {
                return chartSettings.startDate ? moment.utc(chartSettings.startDate) : moment().subtract("weeks", 1);
            },

            getEndDate: function()
            {
                return moment().add("days", 7);
            }
        }
    };

    var chartUtils = {

        buildChartParameters: function(baseSettings)
        {
            var chartSettings = _.clone(baseSettings);

            var dateOption = this.findChartDateOption(chartSettings.quickDateSelectOption);

            chartSettings.startDate = dateOption.getStartDate(chartSettings).local();
            chartSettings.endDate = dateOption.getEndDate(chartSettings).local();
            chartSettings.customStartDate = dateOption.customStartDate ? true : false;
            chartSettings.customEndDate = dateOption.customEndDate ? true : false;
            return chartSettings;
        },

        findChartDateOption: function(selectedOptionId)
        {
            var selectedOption = _.find(this.chartDateOptions, function(dateOption)
            {
                return dateOption.id === Number(selectedOptionId);
            });

            if(!selectedOption)
            {
                return this.findChartDateOption(this.defaultDateOptionId);
            }

            return selectedOption;
        },

        findGlobalChartSettings: function()
        {
            var globalSettingKey = "dateOptions";
            var dashboardSettings = theMarsApp.user.getDashboardSettings();
            if(!dashboardSettings.has(globalSettingKey))
            {
                dashboardSettings.set(globalSettingKey, { startDate: null, endDate: null, quickDateSelectOption: null});
            }
            return dashboardSettings.get(globalSettingKey);
        },

        findGlobalChartSettingsHandler: function()
        {
            // default
            var quickDateSelectOption = chartDateOptions.LAST_90_DAYS_AND_NEXT_21_DAYS.id;
            var globalSettings = this.findGlobalChartSettings();
            if(globalSettings.quickDateSelectOption && globalSettings.quickDateSelectOption > 1)
            {
                quickDateSelectOption = globalSettings.quickDateSelectOption;
            }

            return chartUtils.findChartDateOption(quickDateSelectOption);
        },

        chartDateOptions: chartDateOptions,

        defaultDateOptionId: chartDateOptions.LAST_90_DAYS_AND_NEXT_21_DAYS.id
    };

    return chartUtils;

});