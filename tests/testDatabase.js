const { newDb, DataType } = require("pg-mem");
const fs = require("fs");
const path = require("path");

const db = newDb();

db.public.registerFunction({
    name: "to_char",
    args: [DataType.date, DataType.text],
    returns: DataType.text,
    implementation: date => new Date(date).toISOString().slice(0, 10)
});

db.public.registerFunction({
    name: "to_char",
    args: [DataType.time, DataType.text],
    returns: DataType.text,
    implementation: time => String(time).slice(0, 5)
});

const init = fs.readFileSync(
    path.join(__dirname, "../database/init.js"),
    "utf8"
);

const queries = [...init.matchAll(/pool\.query\(`([\s\S]*?)`\)/g)];

for (const query of queries) {
    db.public.none(query[1]);
}

const { Pool } = db.adapters.createPg();

module.exports = new Pool();