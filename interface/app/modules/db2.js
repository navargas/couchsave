require('dotenv').config()
var fmt = require('util').format;
var Pool = require('ibm_db').Pool;
var ibmdb = new Pool();

module.exports.run = (query, args, cb) => {
    ibmdb.open(process.env.constr, (err, db) => {
        if (err) return cb(err);
        db.prepare(query, (err, stmt) => {
            if (err) return cb(err);
            stmt.execute(args, (err, result)=> {
                if (err) return cb(err);
                result.fetchAll((err, rows) => {
                    // result.close not defined
                    result.closeSync();
                    stmt.closeSync();
                    if (err) return cb(err);
                    db.close();
                    cb(null, rows);
                });
            });
        });
    });
};
