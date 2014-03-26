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
                var globalSettings = chartUtils._findGlobalChartSettings();
                var chartSettingsHandler = chartUtils._findGlobalChartSettingsHandler();
                return chartSettingsHandler.getStartDate(globalSettings);
            },

            getEndDate: function(chartSettings)
            {
                var globalSettings = chartUtils._findGlobalChartSettings();
                var chartSettingsHandler = chartUtils._findGlobalChartSettingsHandler();
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
                return chartSettings.startDate ? moment.local(chartSettings.startDate) : moment.local().startOf("day").subtract("weeks", 1);
            },

            getEndDate: function(chartSettings)
            {
                return chartSettings.endDate ? moment.local(chartSettings.endDate) : moment.local().startOf("day");
            }
        },

        CUSTOM_DATE_THROUGH_TODAY:
        {
            id: 22,
            label: TP.utils.translate("Custom date through today"),
            customStartDate: true,

            getStartDate: function(chartSettings)
            {
                return chartSettings.startDate ? moment.local(chartSettings.startDate) : moment.local().startOf("day").subtract("weeks", 1);
            },

            getEndDate: function()
            {
                return moment.local().startOf("day");
            }
        },

        LAST_7_DAYS:
        {
            id: 3,
            label: TP.utils.translate("Last 7 days"),

            getEndDate: function()
            {
                return moment.local().startOf("day");
            },

            getStartDate: function()
            {
                return moment.local().startOf("day").subtract("days", 7);
            }
        },

        LAST_14_DAYS:
        {
            id: 4,
            label: TP.utils.translate("Last 14 days"),
            getEndDate: function()
            {
                return moment.local().startOf("day");
            },

            getStartDate: function()
            {
                return moment.local().startOf("day").subtract("days", 14);
            }
        },

        LAST_28_DAYS:
        {
            id: 5,
            label: TP.utils.translate("Last 28 days"),
            getEndDate: function()
            {
                return moment.local().startOf("day");
            },

            getStartDate: function()
            {
                return moment.local().startOf("day").subtract("days", 28);
            }
        },

        LAST_90_DAYS:
        {
            id: 6,
            label: TP.utils.translate("Last 90 days"),
            getEndDate: function()
            {
                return moment.local().startOf("day");
            },

            getStartDate: function()
            {
                return moment.local().startOf("day").subtract("days", 90);
            }
        },

        LAST_180_DAYS:
        {
            id: 7,
            label: TP.utils.translate("Last 180 days"),
            getEndDate: function()
            {
                return moment.local().startOf("day");
            },

            getStartDate: function()
            {
                return moment.local().startOf("day").subtract("days", 180);
            }
        },

        LAST_365_DAYS:
        {
            id: 8,
            label: TP.utils.translate("Last 365 days"),
            getEndDate: function()
            {
                return moment.local().startOf("day");
            },

            getStartDate: function()
            {
                return moment.local().startOf("day").subtract("days", 365);
            }
        },

        LAST_730_DAYS:
        {
            id: 730,
            label: TP.utils.translate("Last 730 days"),
            getStartDate: function()
            {
                return moment.local().startOf("day").subtract("years", 2).add("days", 1);
            },
            getEndDate: function()
            {
                return moment.local().startOf("day");
            }
        },

        THIS_WEEK:
        {
            id: 9,
            label: TP.utils.translate("This week"),
            getStartDate: function()
            {
                var thisWeek = moment.local().startOf("day").week();
                return moment.local().startOf("day").week(thisWeek).startOf("week");
            },

            getEndDate: function()
            {
                var thisWeek = moment.local().startOf("day").week();
                return moment.local().startOf("day").week(thisWeek).endOf("week");
            }
        },

        THIS_MONTH:
        {
            id: 10,
            label: TP.utils.translate("This month"),
            getStartDate: function()
            {
                return moment.local().startOf("day").date(1);
            },
            getEndDate: function()
            {
                return moment.local().startOf("day").date(moment.local().startOf("day").daysInMonth());
            }
        },

        THIS_YEAR:
        {
            id: 11,
            label: TP.utils.translate("This year"),
            getStartDate: function()
            {
                return moment.local().startOf("day").month(0).date(1);
            },
            getEndDate: function()
            {
                return moment.local().startOf("day").month(11).date(31);
            }
        },

        LAST_WEEK:
        {
            id: 12,
            label: TP.utils.translate("Last week"),
            getStartDate: function()
            {
                var lastWeek = moment.local().startOf("day").week() - 1;
                return moment.local().startOf("day").week(lastWeek).startOf("week");
            },

            getEndDate: function()
            {
                var lastWeek = moment.local().startOf("day").week() - 1;
                return moment.local().startOf("day").week(lastWeek).endOf("week");
            }
        },

        LAST_MONTH:
        {
            id: 13,
            label: TP.utils.translate("Last month"),
            getStartDate: function()
            {
                return moment.local().startOf("day").date(1).subtract("months", 1);
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
                return moment.local().startOf("day").date(1).subtract("months", 3);
            },
            getEndDate: function()
            {
                var lastMonth = moment.local().startOf("day").date(1).subtract("months", 1);
                return lastMonth.date(lastMonth.daysInMonth());
            }
        },

        LAST_YEAR:
        {
            id: 15,
            label: TP.utils.translate("Last year"),
            getStartDate: function()
            {
                return moment.local().startOf("day").month(0).date(1).subtract("years", 1);
            },
            getEndDate: function()
            {
                return moment.local().startOf("day").month(11).date(31).subtract("years", 1);
            }
        },

        LAST_2_YEARS:
        {
            id: 16,
            label: TP.utils.translate("Last 2 years"),
            getStartDate: function()
            {
                return moment.local().startOf("day").month(0).date(1).subtract("years", 2);
            },
            getEndDate: function()
            {
                return moment.local().startOf("day").month(11).date(31).subtract("years", 1);
            }
        },

        THIS_WEEK_LAST_YEAR:
        {
            id: 17,
            label: TP.utils.translate("This week last year"),
            getStartDate: function()
            {
                var thisWeek = moment.local().startOf("day").week();
                return moment.local().startOf("day").subtract("years", 1).week(thisWeek).startOf("week");
            },

            getEndDate: function()
            {
                var thisWeek = moment.local().startOf("day").week();
                return moment.local().startOf("day").subtract("years", 1).week(thisWeek).endOf("week");
            }
        },

        THIS_MONTH_LAST_YEAR:
        {
            id: 18,
            label: TP.utils.translate("This month last year"),

            getStartDate: function()
            {
                return moment.local().startOf("day").subtract("years", 1).month(moment.local().startOf("day").month()).date(1);
            },

            getEndDate: function()
            {
                var thisWeek = moment.local().startOf("day").week();
                var lastYear = moment.local().startOf("day").subtract("years", 1).month(moment.local().startOf("day").month());
                return lastYear.date(lastYear.daysInMonth());
            }
        },


        LAST_28_DAYS_AND_NEXT_7_DAYS:
        {
            id: 19,
            label: TP.utils.translate("Last 28 and next 7 days"),
            getStartDate: function()
            {
                return moment.local().startOf("day").subtract("days", 28);
            },

            getEndDate: function()
            {
                return moment.local().startOf("day").add("days", 7);
            }
        },

        LAST_90_DAYS_AND_NEXT_21_DAYS:
        {
            id: 20,
            label: TP.utils.translate("Last 90 and next 21 days"),
            getStartDate: function()
            {
                return moment.local().startOf("day").subtract("days", 90);
            },

            getEndDate: function()
            {
                return moment.local().startOf("day").add("days", 21);
            }
        },

        LAST_180_DAYS_AND_NEXT_45_DAYS:
        {
            id: 21,
            label: TP.utils.translate("Last 180 and next 45 days"),
            getStartDate: function()
            {
                return moment.local().startOf("day").subtract("days", 180);
            },

            getEndDate: function()
            {
                return moment.local().startOf("day").add("days", 45);
            }
        },

        CUSTOM_DATE_THROUGH_NEXT_7_DAYS:
        {
            id: 23,
            label: TP.utils.translate("Custom date through next 7 days"),
            customStartDate: true,

            getStartDate: function(chartSettings)
            {
                return chartSettings.startDate ? moment.local(chartSettings.startDate) : moment.local().startOf("day").subtract("weeks", 1);
            },

            getEndDate: function()
            {
                return moment.local().startOf("day").add("days", 7);
            }
        }
    };

    var chartUtils = {

        buildChartParameters: function(baseSettings)
        {
            var chartSettings = _.clone(baseSettings);
            chartSettings = this._fixDates(chartSettings);

            var dateOption = this.findChartDateOption(chartSettings.quickDateSelectOption);

            chartSettings.startDate = dateOption.getStartDate(chartSettings);
            chartSettings.endDate = dateOption.getEndDate(chartSettings);
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

        findChartDateOptionName: function(selectedOptionId)
        {
           var selectedKey = _.findKey(this.chartDateOptions, { id: Number(selectedOptionId) });
           return selectedKey ? selectedKey : "";
        },

        _findGlobalChartSettings: function()
        {
            var globalSettingKey = "dateOptions";
            var dashboardSettings = theMarsApp.user.getDashboardSettings();
            if(!dashboardSettings.has(globalSettingKey))
            {
                dashboardSettings.set(globalSettingKey, { startDate: null, endDate: null, quickDateSelectOption: null});
            }
            return dashboardSettings.get(globalSettingKey);
        },

        _findGlobalChartSettingsHandler: function()
        {
            // default
            var quickDateSelectOption = chartDateOptions.LAST_90_DAYS_AND_NEXT_21_DAYS.id;
            var globalSettings = this._findGlobalChartSettings();
            if(globalSettings.quickDateSelectOption && globalSettings.quickDateSelectOption > 1)
            {
                quickDateSelectOption = globalSettings.quickDateSelectOption;
            }

            return chartUtils.findChartDateOption(quickDateSelectOption);
        },

        _fixDates: function(chartSettings)
        {
            _.each(["startDate", "endDate"], function(key)
            {
                if(_.has(chartSettings, key) && _.isString(chartSettings[key]))
                {
                    // strip the time portion of a datetime string
                    var dateString = chartSettings[key].replace(/T.*$/,'');
                    chartSettings[key] = moment.local(dateString).format();
                }
            });

            return chartSettings;
        },

        chartDateOptions: chartDateOptions,

        defaultDateOptionId: chartDateOptions.LAST_90_DAYS_AND_NEXT_21_DAYS.id
    };

    return chartUtils;

});