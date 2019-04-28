const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('./../config/keys');
const exec = mongoose.Query.prototype.exec;

const client = redis.createClient(keys.redisUrl);

client.hget = util.promisify(client.hget);

mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this.haskey = JSON.stringify(options.key || '');
  return this;
};

mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }
  const key = JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name
  });

  const cacheValue = await client.hget(this.haskey, key);

  if (cacheValue) {
    doc = JSON.parse(cacheValue);
    return Array.isArray(doc)
      ? doc.map(ele => new this.model(ele))
      : new this.model(doc);
  }

  const result = await exec.apply(this, arguments);

  client.hset(this.haskey, key, JSON.stringify(result));

  return result;
};

module.exports = {
  clearHash(hashkey) {
    client.del(JSON.stringify(hashkey));
  }
};
