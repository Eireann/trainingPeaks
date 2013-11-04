define([
'specs/bdd_tests/calendar/calendarHeaderView.spec',
'specs/bdd_tests/calendar/library/saveWorkoutToLibrary.spec',
'specs/bdd_tests/calendar/models/calendarDayModel.spec',
'specs/bdd_tests/calendar/models/workoutModel.spec',
'specs/bdd_tests/calendar/models/workoutsCollection.spec',
'specs/bdd_tests/calendar/quickView/fileAttachments.spec',
'specs/bdd_tests/calendar/quickView/openQv.spec',
'specs/bdd_tests/calendar/showCalendar.spec',
'specs/bdd_tests/calendar/showCalendarForCoach.spec',
'specs/bdd_tests/calendar/touch/touchEvents.spec',
'specs/bdd_tests/calendar/views/calendarWeekView.spec',
'specs/bdd_tests/dashboard/dashboardChartPods.spec',
'specs/bdd_tests/dashboard/dashboardController.spec',
'specs/bdd_tests/dashboard/fitnessSummaryChart.spec',
'specs/bdd_tests/dashboard/metricsChart.spec',
'specs/bdd_tests/dashboard/peaksChart.spec',
'specs/bdd_tests/dashboard/pmcChart.spec',
'specs/bdd_tests/dashboard/timeInZonesByWeekChart.spec',
'specs/bdd_tests/dashboard/timeInZonesChart.spec',
'specs/bdd_tests/dashboard/workoutSummaryChart.spec',
'specs/bdd_tests/expando/expandoStats.spec',
'specs/bdd_tests/home/showHome.spec',
'specs/bdd_tests/managers/calendarManager.spec',
'specs/bdd_tests/managers/selectionManager.spec',
'specs/bdd_tests/quickview/metric/metricQuickView.spec',
'specs/bdd_tests/trainingPlans/applyTrainingPlan.spec',
'specs/bdd_tests/trainingPlans/trainingPlanLibrary.spec',
'specs/bdd_tests/userSettings/userSettingsView.spec',
'specs/bdd_tests/userSettings/userSettingsZonesView.spec',
'specs/performance/modelPerformance.spec',
'specs/unit_tests/accessRights/accessRights.spec',
'specs/unit_tests/accessRights/availableChartsCollection.spec',
'specs/unit_tests/accessRights/featureAuth.spec',
'specs/unit_tests/accessRights/userAccessRightsModel.spec',
'specs/unit_tests/app/app.spec',
'specs/unit_tests/calendar/calendarController.spec',
'specs/unit_tests/calendar/layouts/calendarLayout.spec',
'specs/unit_tests/calendar/models/calendar/calendarCollection.spec',
'specs/unit_tests/calendar/models/calendar/calendarDayModel.spec',
'specs/unit_tests/calendar/models/library/exerciseLibrary.spec',
'specs/unit_tests/calendar/models/library/libraryExercise.spec',
'specs/unit_tests/calendar/models/library/libraryExercisesCollection.spec',
'specs/unit_tests/calendar/models/metrics/metricModel.spec',
'specs/unit_tests/calendar/models/selectedActivities/selectedActivitiesCollection.spec',
'specs/unit_tests/calendar/models/workouts/workoutFileAttachment.spec',
'specs/unit_tests/calendar/models/workouts/workoutModel.spec',
'specs/unit_tests/calendar/models/workouts/workoutsCollection.spec',
'specs/unit_tests/calendar/views/calendarContainerView.spec',
'specs/unit_tests/calendar/views/calendarContainerViewScrolling.spec',
'specs/unit_tests/calendar/views/calendarDayView.spec',
'specs/unit_tests/calendar/views/calendarWorkoutView.spec',
'specs/unit_tests/calendar/views/deleteConfirmationView.spec',
'specs/unit_tests/calendar/views/library/applyTrainingPlanToCalendarConfirmationView.spec',
'specs/unit_tests/calendar/views/library/exerciseLibraryAddItemView.spec',
'specs/unit_tests/calendar/views/library/exerciseLibraryView.spec',
'specs/unit_tests/calendar/views/library/libraryView.spec',
'specs/unit_tests/calendar/views/library/trainingPlanItemView.spec',
'specs/unit_tests/calendar/views/quickView/mapAndGraphView.spec',
'specs/unit_tests/calendar/views/quickView/qvAttachmentUploadMenuView.spec',
'specs/unit_tests/calendar/views/quickView/summaryViewStickitBindings.spec',
'specs/unit_tests/calendar/views/userControlsView.spec',
'specs/unit_tests/calendar/views/userSettingsView.spec',
'specs/unit_tests/calendar/views/weekSummary/weekSummaryView.spec',
'specs/unit_tests/charts/peaksChart.spec',
'specs/unit_tests/charts/timeInZonesChart.spec',
'specs/unit_tests/clientEvent/clientEvent.spec',
'specs/unit_tests/clientEvent/clientEventsCollection.spec',
'specs/unit_tests/dashboard/charts/peaksChart.spec',
'specs/unit_tests/dashboard/dashboardChartsLibraryView.spec',
'specs/unit_tests/dashboard/dashboardLibraryView.spec',
'specs/unit_tests/dashboard/library/chartTileView.spec',
'specs/unit_tests/dashboard/pmcChart.spec',
'specs/unit_tests/dashboard/pmcWorkoutsListView.spec',
'specs/unit_tests/elevationCorrection/elevationCorrection.spec',
'specs/unit_tests/expando/expandoController.spec',
'specs/unit_tests/expando/utils/lapsStats.spec',
'specs/unit_tests/expando/views/graphSeriesOptionsView.spec',
'specs/unit_tests/expando/views/graphToolbarView.spec',
'specs/unit_tests/expando/views/graphView.spec',
'specs/unit_tests/expando/views/lapsSplitsView.spec',
'specs/unit_tests/expando/views/lapsView.spec',
'specs/unit_tests/expando/views/qvOptionsMenuView.spec',
'specs/unit_tests/framework/APIModel.spec',
'specs/unit_tests/framework/ajaxCaching.spec',
'specs/unit_tests/framework/clipboard.spec',
'specs/unit_tests/framework/dataManager.spec',
'specs/unit_tests/framework/filteredSubCollection.spec',
'specs/unit_tests/framework/logger.spec',
'specs/unit_tests/framework/scrollableCollectionView.spec',
'specs/unit_tests/framework/settingsSubCollection.spec',
'specs/unit_tests/managers/calendarManager.spec',
'specs/unit_tests/managers/selectionManager.spec',
'specs/unit_tests/misc/selection.spec',
'specs/unit_tests/quickview/metric/metricQVItemView.spec',
'specs/unit_tests/utilities/affiliates.spec',
'specs/unit_tests/utilities/charting/chartColors.spec',
'specs/unit_tests/utilities/charting/dataParser.spec',
'specs/unit_tests/utilities/charting/findOrderedArrayIndexByValue.spec',
'specs/unit_tests/utilities/charting/jquery.flot.filter.spec',
'specs/unit_tests/utilities/color.spec',
'specs/unit_tests/utilities/conversion/adjustFieldRange.spec',
'specs/unit_tests/utilities/conversion/conversionFormat.spec',
'specs/unit_tests/utilities/conversion/conversionParse.spec',
'specs/unit_tests/utilities/conversion/newlines.spec',
'specs/unit_tests/utilities/data/peaksGenerator.spec',
'specs/unit_tests/utilities/date/formatDate.spec',
'specs/unit_tests/utilities/datetime.spec',
'specs/unit_tests/utilities/defaultValue.spec',
'specs/unit_tests/utilities/formUtility.spec',
'specs/unit_tests/utilities/formatKeyStat.spec',
'specs/unit_tests/utilities/formatKeyStatUnits.spec',
'specs/unit_tests/utilities/localStorageUtils.spec',
'specs/unit_tests/utilities/mapping/mapUtils.spec',
'specs/unit_tests/utilities/metrics.spec',
'specs/unit_tests/utilities/units/unitsHelpers.spec',
'specs/unit_tests/utilities/wrapTemplate.spec',
'specs/unit_tests/workout/saveWorkoutDetailData.spec',
'specs/unit_tests/workout/workoutBarView.spec',
'specs/unit_tests/workout/workoutDetailDataModel.spec',
'specs/unit_tests/workoutCommentsEditor/workoutCommentsEditor.spec',
'specs/unit_tests/zoneCalculators/heartRateZoneCalculatorView.spec',
'specs/unit_tests/zoneCalculators/powerZoneCalculatorView.spec',
'specs/unit_tests/zoneCalculators/speedZoneCalculatorView.spec',
'specs/unit_tests/zoneCalculators/zoneCalculator.spec'
], function() { });
