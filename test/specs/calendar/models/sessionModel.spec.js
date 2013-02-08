
// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "jquery",
    "models/session"
],
function($, SessionModel)
{
    describe("Session Model ", function ()
    {
        var theSession;

        beforeEach(function()
        {
            theSession = new SessionModel();
        });

        it("should be loaded as a module", function()
        {
            expect(theSession).toBeDefined();
        });

        it("should publish current authentication state on its public interface", function()
        {
            expect(typeof theSession.isAuthenticated).toBe("function");
            expect(theSession.isAuthenticated()).toBe(false);
        });

        it("should send an ajax POST json request to the OAuth Token endpoint containing username & password for authentication", function()
        {
            spyOn($, "ajax").andCallFake(function(options)
            {
                expect(options.type).toBe("POST");
                expect(options.dataType).toBe("json");
                expect(options.data.grant_type).toBe("password");
                expect(options.data.client_id).toBe("tpconsumer");
                expect(options.data.client_secret).toBe("tpsecret");
                expect(options.data.username).toBe("myusername");
                expect(options.data.password).toBe("mypassword");
                expect(options.data.response_type).toBe("token");
                expect(options.data.scope).toBe("Fitness ClientEvents");
                
                return {
                    done: function()
                    {
                        return {
                            error: function()
                            {

                            }
                        };
                    },
                    error: function()
                    {
                    }
                };
            });

            var authObj = { username: "myusername", password: "mypassword" };
            theSession.authenticate(authObj);

            expect($.ajax).toHaveBeenCalled();
        });

        it("should call a success callback when the request succeeds", function()
        {
            var mockDeferred = {
                done: function ()
                {
                    return {
                        error: function ()
                        {

                        }
                    };
                },
                error: function ()
                {
                }
            };

            spyOn(mockDeferred, "done").andCallThrough();
            spyOn($, "ajax").andCallFake(function(options)
            {
                return mockDeferred;
            });
            
            var authObj = { username: "myusername", password: "mypassword" };
            theSession.authenticate(authObj);

            expect(mockDeferred.done).toHaveBeenCalled();
        });
    });

});
