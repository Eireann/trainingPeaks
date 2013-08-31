// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
	"views/calendar/library/applyTrainingPlanToCalendarConfirmationView",
	"models/library/trainingPlan",
	"app",
	"TP",
	"moment",
	"jquery"
],
function(ApplyTrainingPlanToCalendarConfirmationView, TrainingPlan, theMarsApp, TP, moment, $)
{

	describe("applyTrainingPlanToCalendarConfirmationView ", function()
	{
		theMarsApp.router = new TP.Router();
		var trainingPlan = new TrainingPlan({planId: 123});
		var today = moment().format("MM-DD-YYYY");
		trainingPlan.details.fetch = function() { return new $.Deferred(); };
		trainingPlan.details.set({startDate: moment().format("MM-DD-YYYY")});

		it("Should be loaded as a module", function()
		{
			expect(ApplyTrainingPlanToCalendarConfirmationView).toBeDefined();
		});

		it("Should require a model and a target date", function()
		{
			expect(function() { new ApplyTrainingPlanToCalendarConfirmationView({}); }).toThrow();
			expect(function() { new ApplyTrainingPlanToCalendarConfirmationView({model: trainingPlan}); }).toThrow();
			expect(function() { new ApplyTrainingPlanToCalendarConfirmationView({model: trainingPlan, targetDate: today}); }).not.toThrow();
		});

		it("Should fetch the details model when instantiated", function()
		{
			spyOn(trainingPlan.details, "fetch").andReturn(new $.Deferred());
			var view = new ApplyTrainingPlanToCalendarConfirmationView({model: trainingPlan, targetDate: today});
			expect(trainingPlan.details.fetch).toHaveBeenCalled();
		});
		it("Should prompt the user to choose whether the target date is start or end", function()
		{
			var view = new ApplyTrainingPlanToCalendarConfirmationView({model: trainingPlan, targetDate: today});
			view.render();
			expect(view.$el.find('select').length).toBe(1);
			expect(view.$el.find('select option').first().text()).toBe("Start");
			expect(view.$el.find('select option').last().text()).toBe("End");
		});
		describe("Date restrictions", function()
		{
			it("Should set the eligible date correctly for target dates before the eligible date", function()
			{
				var monday = moment().day(1);
				var tuesday = moment().day(2);
				var nextEligibleTuesday = tuesday;
				
				// plan must start on a tuesday
				trainingPlan.details.set({startDate: tuesday.format("MM-DD-YYYY")});

				var view = new ApplyTrainingPlanToCalendarConfirmationView({model: trainingPlan, targetDate: monday});
				view.render();
				expect(view.eligibleTargetDate.format("MM-DD-YYYY")).toBe(nextEligibleTuesday.format("MM-DD-YYYY"));
			});
			it("Should set the eligible date correctly for target dates after the eligible date", function()
			{
				var thursday = moment().day(4);
				nextEligibleTuesday = moment().day(7).add("days", 2);

				// plan must start on a tuesday
				trainingPlan.details.set({startDate: moment().day(2).format("MM-DD-YYYY")});

				var view = new ApplyTrainingPlanToCalendarConfirmationView({model: trainingPlan, targetDate: thursday});
				view.render();
				expect(view.eligibleTargetDate.format("MM-DD-YYYY")).toBe(nextEligibleTuesday.format("MM-DD-YYYY"));
			});
			it("Should set the eligible date correctly for target dates before the eligible date with an END date set", function()
			{
				var nextMonday = moment().day(8);
				var monday = moment(nextMonday).day(1);
				var tuesday = moment(nextMonday).day(2);
				var thursday = moment(nextMonday).day(4);

				trainingPlan.details.set({endDate: tuesday.format("MM-DD-YYYY"), dayCount: 2});
				var view = new ApplyTrainingPlanToCalendarConfirmationView({model: trainingPlan, targetDate: thursday});

				view.startOrEndRangeValue = 2;

				view.render();
				expect(view.eligibleTargetDate.format("MM-DD-YYYY")).toBe(moment().day(9).format("MM-DD-YYYY"));

			});
		});


	});

});