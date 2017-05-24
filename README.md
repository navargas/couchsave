couchsave

Provide consistent access to data, even when the source dataset
is unreachable.

This tool is most useful for serving a finite set of results, i.e.
when many users access the same data. Efficiency increases will not
apply if each user requires individualized queries.

usage:

```javascript
var cs = require('couchsave');

var q = [myQuery, 'parameter1', 'parameter2'];
cc('dataSourceName', q, function(err, result) {
    if (err)
        return console.error(err);
    console.log(result);
})
```
