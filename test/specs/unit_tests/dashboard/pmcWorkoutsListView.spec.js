// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "jquery",
    "moment",
    "TP",
    "testUtils/testHelpers",
    "dashboard/views/pmcWorkoutsListView",
    "models/workoutsCollection"
],
function(
    $,
    moment,
    TP,
    testHelpers,
    PmcWorkoutsListView,
    WorkoutsCollection
    )
{
	describe("PmcWorkoutsListView", function()
	{
		var workouts = new WorkoutsCollection([new TP.Model()], {startDate: moment(), endDate: moment()});
		var view = new PmcWorkoutsListView({collection: workouts, dataPromise: new $.Deferred().resolve(), position: {x: 10, y: 10}});

		it("Should provide the right data to the template", function()
		{
			var result = view.serializeData();
			expect(result.date).to.equal(moment().format("MM-DD-YYYY"));
			expect(result.workouts.length).to.equal(1);
		});

	});
});
