const cassandra = require('cassandra-driver');

const client = new cassandra.Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1',
  keyspace: 'dravina',
});

const connectCassandra = async () => {
  try {
    await client.connect();
    console.log('✅ Cassandra connected successfully');
  } catch (error) {
    console.error('❌ Cassandra connection failed:', error);
    throw error;
  }
};

module.exports = { client, connectCassandra };