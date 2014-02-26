define(
[
    "jquery",
    "moment",
    "TP",
    "testUtils/testHelpers",
    "dashboard/views/pmcWorkoutsListView",
    "models/calendar/calendarDay",
    "models/workoutModel",
    "shared/models/metricModel"
],
function(
    $,
    moment,
    TP,
    testHelpers,
    PmcWorkoutsListView,
    CalendarDay,
    WorkoutModel,
    MetricModel
)
{
    describe("PmcWorkoutsListView", function()
    {
	it("Should provide the right data to the template", function()
	{
		var model = new CalendarDay({ date: "2013-10-04" });
		model.add(new WorkoutModel({ workoutId: 2 }));
		model.add(new MetricModel({ id: 1 }));

		var view = new PmcWorkoutsListView({ model: model });

		var result = view.serializeData();
		expect(result.date).to.equal("2013-10-04");
		expect(result.workouts.length).to.equal(1);
	});

    });
});
