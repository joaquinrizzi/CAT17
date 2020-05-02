//@ts-check

const express = require('express');
const Datastore = require('nedb');
const oracledb = require('oracledb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => {

    console.log(`Starting server at ${port}`);

});

app.use(express.static('public'));
app.use(express.json({ limit: '100kb' }));

const databaseGen = new Datastore('databaseGen.db');
const databaseRules = new Datastore('databaseRules.db');


databaseGen.loadDatabase();
databaseRules.loadDatabase();

const con = {

    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    connectString: process.env.DB_CON

};

app.get('/getGeneric/:cxr/:tariff', (request, response) => {

    const cxr = request.params.cxr;

    const tariff = request.params.tariff;

    var sql = sequel(cxr, tariff, "");

    try {


        oracledb.getConnection(con, function(err, connection) {

            if (err) {

                throw err;
                // return;
            }

            connection.execute(sql, [], { maxRows: 1 }, function(err, result) {

                if (err) {

                    // console.error(err.message);
                    throw err;
                    // doRelease(connection);
                    //return;
                }


                databaseGen.remove({}, { multi: true }, function(err, numRemoved) {

                    databaseGen.loadDatabase(function(err) {
                        // done
                    });
                });

                databaseGen.loadDatabase();

                const data = {};


                if (result.rows.length == 0) {

                    console.log("no generic sequence was found");

                    data.message = "no generic sequence was found";

                    response.json(data);

                } else {

                    // console.log("here2");
                    console.log(result.rows[0][2]);

                    data.message = "generic sequence found successfuly";
                    data.value = result.rows[0][2];
                    response.json(data);

                }

                doRelease(connection);

            });

            // response.append(cxr);

            // return response;
        });

    } catch (e) {

        console.log("the query has not succeded");
        console.log(e.message);
        response.json(e.message);


    } finally {


    }



});

app.get('/getRules/:cxr/:tariff/:rule', (request, response) => {

    const cxr = request.params.cxr;
    const tariff = request.params.tariff;
    // const rule = request.params.rule != "" ? request.params.rule : { $regex: /^[A-Z0-9]{4}/ };
    const rule = request.params.rule;

    var ruleCount = rule.split(",").length;

    var sql = sequel(cxr, tariff, rule);

    oracledb.getConnection(con, function(err, connection) {

        if (err) {
            console.log(con);
            console.error(err.message);
            return;
        }

        connection.execute(sql, [], { maxRows: 0 }, function(err, result) {

            if (err) {

                console.error(err.message);
                doRelease(connection);
                return;
            }

            databaseRules.remove({}, { multi: true }, function(err, numRemoved) {

                databaseRules.loadDatabase(function(err) {
                    // done
                });
            });

            databaseRules.loadDatabase();

            const data = {};

            if (result.rows.length != 0) {

                data.message = result.rows.length + " rules found from " + ruleCount;


                data.docs = result;

                response.json(data);

                // var docs = [];

                // var doc = {};

                console.log(result.rows);

                // for (var i = 0; i < result.rows.length; i++) {

                //     var row = result.rows[i];
                //     doc.cxr = row[0];
                //     doc.tariff = row[1];
                //     doc.seq = row[2];
                //     doc.rule = row[3];
                //     doc.app = row[4];
                //     doc.date = row[5];

                //     docs[i] = doc;

                // }


                // databaseRules.insert(docs);


                // databaseRules.find({}, function(err, docs) {

                //     data.docs = docs;

                //     response.json(data);

                // });




            } else {

                data.message = "no rules found";

                data.docs = [];

                response.json(data);
            }

            doRelease(connection);

        });
    });

});

function doRelease(connection) {

    connection.close(function(err) {

        if (err) {

            console.error(err.message);
        }
    });
}


function sequel(cxr, tariff, rule) {

    var string;

    var wildcard = " ";

    if (rule != "") {

        wildcard = "AND b.RULE IN (" + rule + ") ";
    }

    string = "SELECT  DISTINCT a.GOVERNINGCARRIER," +

        "a.RULETARIFF, " +
        "a.SEQNO, " +
        "b.RULE, " +
        "a.HIPMINFAREAPPL, " +
        "TO_CHAR (a.CREATEDATE, 'MM-DD-YYYY HH24:MI') AS CREATEDATE " +
        "FROM EXCLUDEBYRULE a " +
        "LEFT OUTER JOIN EXCLBYRULERULE b ON a.CREATEDATE=b.CREATEDATE AND a.VENDOR=b.VENDOR AND a.GOVERNINGCARRIER=b.GOVERNINGCARRIER AND a.RULETARIFF=b.RULETARIFF " +
        "LEFT OUTER JOIN EXCLBYRULEFARECLASS c ON a.CREATEDATE=c.CREATEDATE AND a.VENDOR=c.VENDOR AND a.GOVERNINGCARRIER=c.GOVERNINGCARRIER AND a.RULETARIFF=c.RULETARIFF " +
        "LEFT OUTER JOIN EXCLBYRULEFARETYPE d ON a.CREATEDATE=d.CREATEDATE AND a.VENDOR=d.VENDOR AND a.GOVERNINGCARRIER=d.GOVERNINGCARRIER AND a.RULETARIFF=d.RULETARIFF " +
        "WHERE    a.EXPIREDATE = TIMESTAMP '9999-12-31 23:59:59.999' " +
        "AND      a.GOVERNINGCARRIER = '" + cxr + "' " +
        "AND      a.RULETARIFF = " + tariff + " " +

        wildcard +

        // "AND      b.RULE IN (" + rule + ") " +
        "AND      a.TARIFFCAT = -1 " +
        "AND      a.ROUTINGTARIFF1 = -1 " +
        "AND      a.ROUTINGTARIFF2 = -1 " +
        "AND      a.RULETARIFFCODE = ' ' " +
        "AND      a.USERAPPLTYPE = ' ' " +
        "AND      a.USERAPPL = ' ' " +
        "AND      a.GLOBALDIR = ' ' " +
        "AND      a.MPMIND = 'N' " +
        "AND      a.ROUTINGIND = 'N' " +
        "AND      a.ROUTING = ' ' " +
        "AND      a.HIPMINFAREAPPL = 'Y' " +
        "AND      a.HIPFARECOMPAPPL = 'N' " +
        "AND      a.HIPSAMEGROUPAPPL = 'N' " +
        "AND      a.DMCMINFAREAPPL = 'N' " +
        "AND      a.DMCFARECOMPAPPL = 'N' " +
        "AND      a.DMCSAMEGROUPAPPL = 'N' " +
        "AND      a.COMMINFAREAPPL = 'N' " +
        "AND      a.COMFARECOMPAPPL = 'N' " +
        "AND      a.COMSAMEGROUPAPPL = 'N' " +
        "AND      a.CPMMINFAREAPPL = 'N' " +
        "AND      a.CPMFARECOMPAPPL = 'N' " +
        "AND      a.CPMSAMEGROUPAPPL = 'N' " +
        "AND      a.COPMINFAREAPPL = 'N' " +
        "AND      a.COPFARECOMPAPPL = 'N' " +
        "AND      a.COPSAMEGROUPAPPL = 'N' " +
        "AND      a.OSCFARECOMPAPPL = 'N' " +
        "AND      a.OSCSAMEGROUPAPPL = 'N' " +
        "AND      a.RSCFARECOMPAPPL = 'N' " +
        "AND      a.RSCSAMEGROUPAPPL = 'N' " +
        "AND      b.FOOTNOTE = ' ' " +
        "AND      c.FARECLASS is NULL " +
        "AND      d.FARETYPE is NULL " +
        "GROUP BY a.GOVERNINGCARRIER, a.RULETARIFF, a.SEQNO, b.RULE, a.HIPMINFAREAPPL, a.CREATEDATE " +
        "ORDER BY a.SEQNO";

    return string;
}

// *******************************************************NOT UN USE **************************************************************

// app.post('/api', (request, response) => {

//     const data = request.body;
//     const timestamp = Date.now();
//     data.timestamp = timestamp;
//     database.insert(data);
//     response.json(data);
// });



// function searchRule(rq) {

//     var cxr = rq.cxr;
//     var tariff = rq.tariff;

//     const con = {

//         user: "sg208528",
//         password: "mt9ZXvpGB6",
//         // connectString: "(DESCRIPTION = (LOAD_BALANCE = ON) (ADDRESS_LIST=(ADDRESS = (PROTOCOL = TCP)(HOST = sachlp-cdc770)(PORT = 1521)) (ADDRESS = (PROTOCOL = TCP)(HOST = sachlp-tcc870)(PORT = 1521))) (CONNECT_DATA = (SERVICE_NAME = SACP_ADHOC)(SERVER = DEDICATED)))"
//         connectString: "SACP_ADHOC"

//     };

//     const sql = `SELECT  DISTINCT a.GOVERNINGCARRIER, a.RULETARIFF, a.SEQNO FROM  EXCLUDEBYRULE a WHERE a.GOVERNINGCARRIER = :cxr AND RULETARIFF = :tariff`;

//     oracledb.getConnection(con, function(err, connection) {

//         if (err) {
//             console.log(con);
//             console.error(err.message);
//             return;
//         }

//         console.log(cxr);
//         console.log(tariff);
//         console.log(sql);

//         connection.execute(sql,

//             {
//                 cxr: { dir: oracledb.BIND_IN, val: cxr + " ", type: oracledb.STRING },

//                 tariff: { dir: oracledb.BIND_IN, val: tariff }

//             },

//             {

//                 maxRows: 1
//             },

//             function(err, result) {

//                 if (err) {

//                     console.error(err.message);
//                     doRelease(connection);
//                     return;
//                 }
//                 console.log(result.rows);
//                 database.insert(result);
//                 // rs = result;
//                 doRelease(connection);
//                 return result.rows;
//             });
//     });

// }


// app.post('/get', (request, response) => {

//     const rq = request.body;
//     const cxr = rq.cxr;
//     const tariff = rq.tariff;
//     const rule = rq.rule != "" ? rq.rule : { $regex: /^[A-Z0-9]{4}/ };

//     response.json(searchRule(rq));

//     console.log(response);

//     database.find({ "cxr": cxr, "tariff": tariff, "rule": rule }, (err, data) => {

//         if (err) {

//             response.end();
//             return;
//         }

//         response.json(data);
//     });
// });