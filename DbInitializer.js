const r = require('rethinkdb');

class DbInitializer{

    dbName;
    tablesName;

    constructor(dbName, tablesName) {
        this.dbName = dbName;
        this.tablesName = tablesName;

        this.init_db();
        this.init_tables();
      }
}