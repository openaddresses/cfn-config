const AWS = require('aws-sdk');

module.exports.Actions = require('./lib/actions'),
module.exports.Commands = require('./lib/commands').Commands,
module.exports.Lookup = require('./lib/lookup'),
module.exports.Prompt = require('./lib/prompt'),
module.exports.Template = require('./lib/template')

module.exports.preauth = (credentials) => {
    AWS.config.credentials = credentials;
    return cfnConfig;
};
