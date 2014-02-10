define(
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
		var trainingPlan, today;
		beforeEach(function()
		{
			trainingPlan = new TrainingPlan({planId: 123});
			today = moment.local().format("MM-DD-YYYY");
			trainingPlan.details.fetch = function() { return new $.Deferred().resolve(); };
			trainingPlan.details.set({startDate: moment.local().format("MM-DD-YYYY")});
		});

		it("Should be loaded as a module", function()
		{
			expect(ApplyTrainingPlanToCalendarConfirmationView).to.not.be.undefined;
		});

		it("Should require a model and a target date", function()
		{
			expect(function() { new ApplyTrainingPlanToCalendarConfirmationView({}); }).to.throw();
			expect(function() { new ApplyTrainingPlanToCalendarConfirmationView({model: trainingPlan}); }).to.throw();
			expect(function() { new ApplyTrainingPlanToCalendarConfirmationView({model: trainingPlan, targetDate: today}); }).to.not.throw();
		});

		it("Should fetch the details model when instantiated", function()
		{
			sinon.stub(trainingPlan.details, "fetch").returns(new $.Deferred());
			var view = new ApplyTrainingPlanToCalendarConfirmationView({model: trainingPlan, targetDate: today});
			expect(trainingPlan.details.fetch).to.have.been.called;
		});
		it("Should prompt the user to choose whether the target date is start or end", function()
		{
			var view = new ApplyTrainingPlanToCalendarConfirmationView({model: trainingPlan, targetDate: today});
			view.modal = null;
			view.render();
			expect(view.$el.find('select').length).to.equal(1);
			expect(view.$el.find('select option').first().text()).to.equal("Start");
			expect(view.$el.find('select option').last().text()).to.equal("End");
		});
		it("Should apply the plan", function()
		{
			var monday = moment.local().day(1).format("YYYY-MM-DD");
			var tuesday = moment.local().day(2).format("YYYY-MM-DD");
			var nextEligibleTuesday = tuesday;
			
			// plan must start on a tuesday
			trainingPlan.details.set({startDate: tuesday, hasWeeklyGoals: true});

			var view = new ApplyTrainingPlanToCalendarConfirmationView({model: trainingPlan, targetDate: monday});
			view.modal = null;
			view.render();
			
			view.$el.find('select').val(1);
			view.dateView.updateDateInput();

			sinon.stub(view.model, "applyToDate").returns(new $.Deferred().resolve());
			view.applyPlan();

			expect(view.model.applyToDate).to.have.been.calledWith(moment.local(tuesday).format("M/D/YYYY"), 1);
		});


	});

});
