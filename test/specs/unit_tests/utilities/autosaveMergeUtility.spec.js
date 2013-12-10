define(
[
    "shared/utilities/autosaveMergeUtility"
],
function(
    AutosaveMergeUtility
)
{

    describe("AutosaveMergeUtility", function()
    {

        describe("merge", function()
        {
            it("should prefer local changes to server changes", function()
            {
                var base = { a: 1 };
                var local = { a: 3 };
                var server = { a: 5 };

                var merged = AutosaveMergeUtility.merge(base, local, server);

                expect(merged.a).to.equal(3);
            });

            it("should use server changes", function()
            {
                var base = { a: 1 };
                var local = { a: 1 };
                var server = { a: 5 };

                var merged = AutosaveMergeUtility.merge(base, local, server);

                expect(merged.a).to.equal(5);
            });

            it("should only include fields from server", function()
            {
                var base = { a: 1, b: 1, c: 1 };
                var local = { a: 1, b: 1, c: 3 };
                var server = { a: 5 };

                var merged = AutosaveMergeUtility.merge(base, local, server);

                expect(merged.a).to.equal(5);
                expect(merged.b).to.be.undefined;
                expect(merged.c).to.be.undefined;
            });

            it("should merge nested objects", function()
            {
                var base = { a: { b: 1, c: 2 } };
                var local = { a: { b: 11, c: 2 } };
                var server = { a: { b: 1, c: 22 } };

                var merged = AutosaveMergeUtility.merge(base, local, server);

                expect(merged.a.b).to.equal(11);
                expect(merged.a.c).to.equal(22);
            });

            it("should merge array's by id (using join)", function()
            {
                var base = { a: [{id: 1, value: 1}] };
                var local = { a: [{id: 1, value: 2}, {id: 2, value: 42}] };
                var server = { a: [{id: 1, value: 1}, {id: 3, value: 11}] };

                var merged = AutosaveMergeUtility.merge(base, local, server);

                expect(merged.a).to.eql([{id: 1, value: 2}, {id: 2, value: 42}, {id: 3, value: 11}]);
            });
        });


        describe("join", function()
        {
            it("should use items added locally", function()
            {
                var base = [{ id: 1 }, { id: 2 }];
                var local = [{ id: 1 }, { id: 2 }, { id: 3 }];
                var server = [{ id: 1 }, { id: 2 }];

                var joined = AutosaveMergeUtility.join(base, local, server);

                expect(joined).to.eql([{ id: 1 }, { id: 2 }, { id: 3 }]);
            });

            it("should use items added by the server", function()
            {
                var base = [{ id: 1 }, { id: 2 }];
                var local = [{ id: 1 }, { id: 2 }];
                var server = [{ id: 1 }, { id: 2 }, { id: 3 }];

                var joined = AutosaveMergeUtility.join(base, local, server);

                expect(joined).to.eql([{ id: 1 }, { id: 2 }, { id: 3 }]);
            });

            it("should delete items removed by the server", function()
            {
                var base = [{ id: 1 }, { id: 2 }];
                var local = [{ id: 1 }, { id: 2 }];
                var server = [{ id: 1 }];

                var joined = AutosaveMergeUtility.join(base, local, server);

                expect(joined).to.eql([{ id: 1 }]);
            });
            
            it("should delete items removed locally", function()
            {
                var base = [{ id: 1 }, { id: 2 }];
                var local = [{ id: 1 }];
                var server = [{ id: 1 }, { id: 2 }];

                var joined = AutosaveMergeUtility.join(base, local, server);

                expect(joined).to.eql([{ id: 1 }]);
            });
        });

    });

});
