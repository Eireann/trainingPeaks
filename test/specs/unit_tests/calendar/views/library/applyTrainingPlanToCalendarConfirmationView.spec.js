// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
	"views/calendar/library/applyTrainingPlanToCalendarConfirmationView",
	"models/library/trainingPlan",
	"TP",
	"moment",
	"jquery"
],
function(ApplyTrainingPlanToCalendarConfirmationView, TrainingPlan, TP, moment, $)
{

	describe("applyTrainingPlanToCalendarConfirmationView ", function()
	{
		var trainingPlan = new TrainingPlan({planId: 123});
		var today = moment().format("MM-DD-YYYY");
		var baselineDate = moment("09-02-2013"); // a monday
		trainingPlan.details.fetch = function() { return new $.Deferred().resolve(); };
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
			view.modal = null;
			view.render();
			expect(view.$el.find('select').length).toBe(1);
			expect(view.$el.find('select option').first().text()).toBe("Start");
			expect(view.$el.find('select option').last().text()).toBe("End");
		});
		it("Should apply the plan", function()
		{
			var monday = moment(baselineDate).day(1);
			var tuesday = moment(baselineDate).day(2);
			var nextEligibleTuesday = tuesday;
			
			// plan must start on a tuesday
			trainingPlan.details.set({startDate: tuesday.format("MM-DD-YYYY"), hasWeeklyGoals: true});

			var view = new ApplyTrainingPlanToCalendarConfirmationView({model: trainingPlan, targetDate: monday});
			view.modal = null;
			view.render();
			
			view.$el.find('select').val(1);
			view.dateView.updateDateInput();

			spyOn(view.model, "applyToDate").andReturn(new $.Deferred().resolve());
			view.applyPlan();

			expect(view.model.applyToDate).toHaveBeenCalledWith(tuesday.format("M/D/YYYY"), 1);
		});


	});

});
