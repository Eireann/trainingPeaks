# Bower

For version specifications, the following range styles are supported:

* `1.2.3` A specific version.  When nothing else will do.  Note that
  build metadata is still ignored, so `1.2.3+build2012` will satisfy
  this range.
* `>1.2.3` Greater than a specific version.
* `<1.2.3` Less than a specific version.  If there is no prerelease
  tag on the version range, then no prerelease version will be allowed
  either, even though these are technically "less than".
* `>=1.2.3` Greater than or equal to.  Note that prerelease versions
  are NOT equal to their "normal" equivalents, so `1.2.3-beta` will
  not satisfy this range, but `2.3.0-beta` will.
* `<=1.2.3` Less than or equal to.  In this case, prerelease versions
  ARE allowed, so `1.2.3-beta` would satisfy.
* `1.2.3 - 2.3.4` := `>=1.2.3 <=2.3.4`
* `~1.2.3` := `>=1.2.3-0 <1.3.0-0`  "Reasonably close to 1.2.3".  When
  using tilde operators, prerelease versions are supported as well,
  but a prerelease of the next significant digit will NOT be
  satisfactory, so `1.3.0-beta` will not satisfy `~1.2.3`.
* `^1.2.3` := `>=1.2.3-0 <2.0.0-0`  "Compatible with 1.2.3".  When
  using caret operators, anything from the specified version (including
  prerelease) will be supported up to, but not including, the next
  major version (or its prereleases). `1.5.1` will satisfy `^1.2.3`,
  while `1.2.2` and `2.0.0-beta` will not.
* `^0.1.3` := `>=0.1.3-0 <0.2.0-0` "Compatible with 0.1.3". 0.x.x versions are
  special: the first non-zero component indicates potentially breaking changes,
  meaning the caret operator matches any version with the same first non-zero
  component starting at the specified version.
* `^0.0.2` := `=0.0.2` "Only the version 0.0.2 is considered compatible"
* `~1.2` := `>=1.2.0-0 <1.3.0-0` "Any version starting with 1.2"
* `^1.2` := `>=1.2.0-0 <2.0.0-0` "Any version compatible with 1.2"
* `1.2.x` := `>=1.2.0-0 <1.3.0-0` "Any version starting with 1.2"
* `~1` := `>=1.0.0-0 <2.0.0-0` "Any version starting with 1"
* `^1` := `>=1.0.0-0 <2.0.0-0` "Any version compatible with 1"
* `1.x` := `>=1.0.0-0 <2.0.0-0` "Any version starting with 1"

Ranges can be joined with either a space (which implies "and") or a
`||` (which implies "or").

*!!!WARNING!!!* Always check the change logs for any mention of breaking changes!

1. **bower cache clean**
1. **bower prune**
2. Look up the dependency versions we currently request in **bower.json**.
3. In **bower.json**, specify *specific* versions only. Do not use "~", ">=", etc. (the documentation above be damned)
4. For each package: **bower update <package name>**
5. Verify bower updated to the specific version you requested.
6. Update the RequireJS configuration file as needed. (**config.js**) (Check the shim section as well!)
7. Build with **grunt build_debug_fast**.
8. Run all tests with **grunt test**.
9. Resolve any issue before committing your changes.
10. Copy the change log of the new dependency version into **dependency_updates/<date>/bower_components**. Ensure the file name includes the version you are moving from and the version you are moving to.
