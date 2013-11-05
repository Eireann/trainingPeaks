s/toBeDefined()/to.not.be.undefined/g
s/toBeUndefined()/to.be.undefined/g
s/toBeNull()/to.be.null/g
s/toBeTruthy()/to.be.ok/g
s/toBeFalsy()/to.not.be.ok/g
s/toBeHidden()/to.be.hidden/g
s/toBeVisible()/to.be.visible/g
s/toBeCloseTo(\(.*\), \(.*\))/to.be.closeTo(\1, Math.pow(10, -\2) \/ 2)/g
s/toBeCloseTo(\(.*\))/to.be.closeTo(\1, Math.pow(10, -2) \/ 2)/g
s/toBeGreaterThan/to.be.gt/g
s/toBeLessThan/to.be.lt/g
s/toBe/to.equal/g
s/toEqual/to.eql/g
s/toContain/to.contain/g
s/toHaveText/to.contain/g
s/toMatch/to.match/g
s/toThrow/to.throw/g
s/toHaveClass/to.have.class/g
s/toHaveAttr/to.have.attr/g
s/toHaveHtml/to.have.html/g
s/toHaveBeenCalled()/to.have.been.called/g
s/toHaveBeenCalledOnce()/to.have.been.calledOnce/g
s/toHaveBeenCalledTwice()/to.have.been.calledTwice/g
s/toHaveBeenCalledThrice()/to.have.been.calledThrice/g
s/toHaveBeenCalledWith/to.have.been.calledWith/g
s/not.to/to.not/g
s/not.not.//g
