# Bower

> Specification for bower.json file format:
> https://docs.google.com/document/d/1APq7oA9tNao1UYWyOm8dKqlRP2blVkROYLZ2fLIjtWc/edit#heading=h.4pzytc1f9j8k


1. bower prune
2. Look up the dependency versions we currently request in bower.json.
3. In bower.json, specify specific versions only.
4. For each package: bower update <package name>.
5. Verify bower updated to the specific version you requested.
