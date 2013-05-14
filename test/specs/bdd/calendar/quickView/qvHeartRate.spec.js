// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "underscore",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "app"
],
function(
    _,
    testHelpers,
    xhrData,
    theApp)
{


    xdescribe("heart rate tab", function()
    {

        // start the app
        var testUser = xhrData.users.barbkprem;
        testHelpers.startTheApp();
        testHelpers.setupFakeAjax();
        testHelpers.submitLogin(testUser);
        theApp.router.navigate("calendar", true);
        var $el = theApp.mainRegion.$el;
        var $body = theApp.getBodyElement();
        var athleteSettingsUrl = "fitness/v1/athletes/" + testUser.athletes[0].athleteId + "/settings";
        var athleteSettings = xhrData.athleteSettings.barbkprem;
        testHelpers.resolveRequest("GET", athleteSettingsUrl, athleteSettings);

        // open the qv
        $el.find(".day.today").trigger("click");
        theApp.getBodyElement().find("button[data-workoutid=3]").trigger("click"); // 3=run

        //var $el;
        //beforeEach(function()
        //{
        /*
            testHelpers.startTheApp();
            testHelpers.setupFakeAjax();
            testHelpers.submitLogin(xhrData.users.barbkprem);
            theApp.router.navigate("calendar", true);
            */
        //});

        // for some reason afterEach is undefined here, 
        // but we can access it via jasmine.getEnv()
        // need to cleanup our mess
        /*jasmine.getEnv().afterEach(function()
        {
            testHelpers.reset();
        });*/

        it("Should open the heart rate tab", function()
        {
            $body.find(".heartrateTab").trigger("click");
            expect($body.find("#quickViewHRTab").is(":visible")).toBe(true);
        });

        it("Should display each of the athlete's zones", function()
        {
            var hrTab = $body.find("#quickViewHRTab");
            var tabHtml = hrTab.text();
            _.each(athleteSettings.heartRateZones[0].zones, function(zone)
            {
                expect(tabHtml).toContain(zone.label);
            }, this);
        });

        // how do we get from zone input to actual model value?
        // or do we just close/open and check new value?
        xit("Should parse times as seconds", function()
        {
            var zoneInput = $body.find("input#timeInZone0");
            zoneInput.val("0:01:00");
            zoneInput.trigger("blur");

        });
    });



});