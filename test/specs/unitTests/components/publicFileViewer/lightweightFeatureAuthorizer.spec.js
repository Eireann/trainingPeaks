define(
[
    "components/publicFileViewer/js/lightweightFeatureAuthorizer"
],
function(
    LightweightFeatureAuthorizer
)
{
    describe("Public File Viewer Lightweight Feature Authorizer", function()
    {
        it("Should require userType and appRoot options", function()
        {

            expect(function()
            {
                new LightweightFeatureAuthorizer({});
            }).to.throw();
        });

        it("Should handle boolean feature checkers", function()
        {
            var authorizer = new LightweightFeatureAuthorizer({
                userType: 0,
                appRoot: "/"
            });

            expect(authorizer.canAccessFeature(false, null, null)).to.eql(false);
            expect(authorizer.canAccessFeature(true, null, null)).to.eql(true);
        });

        it("Should handle undefined feature checkers", function()
        {
            var authorizer = new LightweightFeatureAuthorizer({
                userType: 0,
                appRoot: "/"
            });

            expect(authorizer.canAccessFeature(authorizer.features.NotARealFeature, null, null)).to.eql(false);
        });

        it("Should not allow anybody to edit lap names", function()
        {
            var authorizer = new LightweightFeatureAuthorizer({
                userType: 0,
                appRoot: "/"
            });

            expect(authorizer.canAccessFeature(authorizer.features.EditLapNames, null, null)).to.eql(false);
        });

        it("Should only allow premium users to view graph ranges", function()
        {
            var unauthenticatedAuthorizer = new LightweightFeatureAuthorizer({
                userType: 0,
                appRoot: "/"
            });

            var basicAuthorizer = new LightweightFeatureAuthorizer({
                userType: 6,
                appRoot: "/"
            });

            var premiumAuthorizer = new LightweightFeatureAuthorizer({
                userType: 4,
                appRoot: "/"
            });

            expect(unauthenticatedAuthorizer.canAccessFeature(unauthenticatedAuthorizer.features.ViewGraphRanges, null, null)).to.eql(false);
            expect(basicAuthorizer.canAccessFeature(basicAuthorizer.features.ViewGraphRanges, null, null)).to.eql(false);
            expect(premiumAuthorizer.canAccessFeature(premiumAuthorizer.features.ViewGraphRanges, null, null)).to.eql(true);
        });

    });
});
