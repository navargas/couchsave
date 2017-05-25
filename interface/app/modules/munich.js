require('dotenv').config()
var fmt = require('util').format;
var ibmdb = require('ibm_db');

module.exports.run = (query, args, cb) => {
    ibmdb.open(process.env.constr, (err, db) => {
        if (err) return cb(err);
        db.prepare(query, (err, stmt) => {
            if (err) return cb(err);
            stmt.execute(args, (err, result)=> {
                if (err) return cb(err);
                result.fetchAll((err, rows) => {
                    // result.close not defined
                    stmt.closeSync();
                    result.closeSync();
                    if (err) return cb(err);
                    db.close();
                    cb(null, rows);
                });
            });
        });
    });
};
