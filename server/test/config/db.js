module.exports = {
  client: 'sqlite3',
  connection: { filename: ':memory:' },
  useNullAsDefault: true,
  // debug: true,
  pool: {
    afterCreate: (conn, cb) => {
      conn.run('PRAGMA foreign_keys = ON', cb);
    },
  },
};
