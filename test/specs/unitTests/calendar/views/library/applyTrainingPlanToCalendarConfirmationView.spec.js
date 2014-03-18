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
	});

});
