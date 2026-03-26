import assert from 'node:assert/strict';
import test from 'node:test';
import CFNConfig, { Commands } from '../index.js';


test('Auth', () => {
    const cfn = new CFNConfig({
        region: 'us-east-1',
        credentials: {
            accessKeyId: 'a',
            secretAccessKey: 'b'
        }
    });

    assert.deepEqual(cfn.client, {
        region: 'us-east-1',
        credentials: {
            accessKeyId: 'a',
            secretAccessKey: 'b'
        }
    }, 'new clients have preauth credentials');

});

test('Root exports Commands', () => {
    assert.equal(typeof Commands, 'function', 'package root re-exports Commands');
});
