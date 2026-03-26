import assert from 'node:assert/strict';
import test from 'node:test';
import TemplateReader, { Template } from '../lib/template.js';
import fs from 'fs';
import Sinon from 'sinon';
import S3 from '@aws-sdk/client-s3';

type ErrorWithCode = Error & {
    code: string;
};

const expected = JSON.parse(String(fs.readFileSync(new URL('./fixtures/template.json', import.meta.url))));

test('[template.read] local file does not exist', async () => {
    try {
        const tr = new TemplateReader({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await tr.read(new URL('./fake', import.meta.url));
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof TemplateReader.NotFoundError, 'returned expected error');
    }

});

test('[template.read] local file cannot be parsed', async () => {
    try {
        const tr = new TemplateReader({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await tr.read(new URL('./fixtures/malformed-template.json', import.meta.url));
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof TemplateReader.InvalidTemplateError, 'returned expected error');
        assert.ok(/Expected ',' or '}' after property value in JSON at position/.test(err.message), 'passthrough parse error');
    }

});

test('[template.read] local js file cannot be parsed', async () => {
    try {
        const tr = new TemplateReader({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await tr.read(new URL('./fixtures/malformed-template.js', import.meta.url));
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof TemplateReader.InvalidTemplateError, 'returned expected error');
        assert.ok(/Failed to parse .*/.test(err.message), 'passthrough parse error');
    }

});

test('[template.read] S3 no access', async () => {
    try {
        const tr = new TemplateReader({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await tr.read(new URL('s3://mapbox/fake'));
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof TemplateReader.NotFoundError, 'returned expected error');
    }

});

test('[template.read] S3 bucket does not exist', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        assert.ok(command instanceof S3.GetBucketLocationCommand);
        assert.deepEqual(command.input, { Bucket: 'my' }, 'requested bucket location');
        const err: ErrorWithCode = new Error('Bucket does not exist') as ErrorWithCode;
        err.code = 'NotFoundError';
        throw err;
    });

    try {
        const tr = new TemplateReader({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await tr.read(new URL('s3://my/template'));
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof TemplateReader.NotFoundError, 'returned expected error');
    }

    Sinon.restore();
});

test('[template.read] S3 file does not exist', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetObjectCommand) {
            assert.deepEqual(command.input, { Bucket: 'my', Key: 'template' }, 'requested correct S3 object');
            const err: ErrorWithCode = new Error('Object does not exist') as ErrorWithCode;
            err.code = 'NotFoundError';
            throw err;
        } else if (command instanceof S3.GetBucketLocationCommand) {
            assert.deepEqual(command.input, { Bucket: 'my' }, 'requested bucket location');
            return Promise.resolve({ LocationConstraint: 'eu-central-1' });
        }
    });

    try {
        const tr = new TemplateReader({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await tr.read(new URL('s3://my/template'));
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof TemplateReader.NotFoundError, 'returned expected error');
    }

    Sinon.restore();
});

test('[template.read] S3 file cannot be parsed', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetObjectCommand) {
            assert.deepEqual(command.input, { Bucket: 'my', Key: 'template' }, 'requested correct S3 object');
            const malformed = fs.readFileSync(new URL('./fixtures/malformed-template.json', import.meta.url));
            return Promise.resolve({ Body: malformed });
        } else if (command instanceof S3.GetBucketLocationCommand) {
            assert.deepEqual(command.input, { Bucket: 'my' }, 'requested bucket location');
            return Promise.resolve({ LocationConstraint: 'eu-central-1' });
        }
    });

    try {
        const tr = new TemplateReader({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await tr.read(new URL('s3://my/template'));
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof TemplateReader.InvalidTemplateError, 'returned expected error');
    }

    Sinon.restore();
});

test('[template.read] local JSON', async () => {
    try {
        const tr = new TemplateReader({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        const found = await tr.read(new URL('./fixtures/template.json', import.meta.url));
        assert.deepEqual(found.body, expected, 'got template JSON');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[template.read] local sync JS', async () => {
    try {
        const tr = new TemplateReader({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        const found = await tr.read(new URL('./fixtures/template-sync.js', import.meta.url));
        assert.deepEqual(found.body, expected, 'got template JSON');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[template.read] local async JS with options', async () => {
    try {
        const tr = new TemplateReader({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        const found = await tr.read(new URL('./fixtures/template-async.js', import.meta.url), { some: 'options' });
        assert.deepEqual(found.body, {
            some: 'options',
            Description: '',
            Parameters: {},
            Resources: {}
        }, 'got template JSON');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[template.read] local async JS without options', async () => {
    try {
        const tr = new TemplateReader({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        const found = await tr.read(new URL('./fixtures/template-async.js', import.meta.url));
        assert.deepEqual(found.body, {
            Description: '',
            Parameters: {},
            Resources: {}
        }, 'got template JSON');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[template.read] S3 JSON', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetObjectCommand) {
            assert.deepEqual(command.input, { Bucket: 'my', Key: 'template' }, 'requested correct S3 object');
            return Promise.resolve({ Body: new Buffer(JSON.stringify(expected)) });
        } else if (command instanceof S3.GetBucketLocationCommand) {
            assert.deepEqual(command.input, { Bucket: 'my' }, 'requested bucket location');
            return Promise.resolve({ LocationConstraint: '' });
        }
    });

    try {
        const tr = new TemplateReader({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        const found = await tr.read(new URL('s3://my/template'));
        assert.deepEqual(found.body, expected, 'got template JSON');
    } catch (err) {
        assert.ifError(err);
    }

    Sinon.restore();
});

test('[template.questions] provides expected questions without encryption', async () => {
    const tr = new TemplateReader({
        region: 'us-east-1',
        credentials: { accessKeyId: '-', secretAccessKey: '-' }
    })

    const questions = tr.questions(new Template(expected));

    assert.equal(questions.length, 6, 'all questions provided');

    const name = questions[0];
    assert.equal(name.type, 'input', 'correct type for Name');
    assert.equal(name.name, 'Name', 'correct name for Name');
    assert.equal(name.message, 'Name. Someone\'s first name:', 'correct message for Name');
    assert.ok(name.validate('Ham'), 'valid success for Name');
    assert.ok(!(name.validate('ham')), 'invalid success for Name');
    assert.ok(!(name.validate('H4m')), 'invalid success for Name');

    const age = questions[1];
    assert.equal(age.type, 'input', 'correct type for Age');
    assert.equal(age.name, 'Age', 'correct name for Age');
    assert.equal(age.message, 'Age:', 'correct message for Age');
    assert.ok(age.validate('30'), 'valid success for Age');
    assert.ok(!(age.validate('ham')), 'invalid success for Age');
    assert.ok(!(age.validate('180')), 'invalid success for Age');
    assert.ok(!(age.validate('-180')), 'invalid success for Age');

    const handedness = questions[2];
    assert.equal(handedness.type, 'list', 'correct type for Handedness');
    assert.equal(handedness.name, 'Handedness', 'correct name for Handedness');
    assert.equal(handedness.message, 'Handedness. Their dominant hand:', 'correct message for Handedness');
    assert.equal(handedness.default, 'right', 'correct default value for Handedness');
    assert.deepEqual(handedness.choices, ['left', 'right'], 'correct choices for Handedness');

    const pets = questions[3];
    assert.equal(pets.type, 'input', 'correct type for Pets');
    assert.equal(pets.name, 'Pets', 'correct name for Pets');
    assert.equal(pets.message, 'Pets. The names of their pets:', 'correct message for Pets');

    const numbers = questions[4];
    assert.equal(numbers.type, 'input', 'correct type for LuckyNumbers');
    assert.equal(numbers.name, 'LuckyNumbers', 'correct name for LuckyNumbers');
    assert.equal(numbers.message, 'LuckyNumbers. Their lucky numbers:', 'correct message for LuckyNumbers');
    assert.ok(numbers.validate('30,40'), 'valid success for LuckyNumbers');
    assert.ok(!(numbers.validate('ham,40')), 'invalid success for LuckyNumbers');

    const password = questions[5];
    assert.equal(password.type, 'password', 'correct type for SecretPassword');
    assert.equal(password.name, 'SecretPassword', 'correct name for SecretPassword');
    assert.equal(password.message, 'SecretPassword. [secure] Their secret password:', 'correct message for SecretPassword');
    assert.ok(password.validate('hibbities'), 'valid success for SecretPassword');
    assert.ok(!(password.validate('ham')), 'invalid success for SecretPassword');
    assert.ok(!(password.validate('hamhamhamhamhamhamhamhamham')), 'invalid success for SecretPassword');

});

test('[template.questions] no parameters', () => {
    const tr = new TemplateReader({
        region: 'us-east-1',
        credentials: { accessKeyId: '-', secretAccessKey: '-' }
    })
    const questions = tr.questions(new Template({}));
    assert.deepEqual(questions, [], 'no further questions');
});

test('[template.questions] reject defaults that are not in a list of allowed values', () => {
    const parameters = { List: { Type: 'String', AllowedValues: ['one', 'two'] } };
    const overrides = new Map();
    overrides.set('defaults', { List: 'three' });

    const tr = new TemplateReader({
        region: 'us-east-1',
        credentials: { accessKeyId: '-', secretAccessKey: '-' }
    })
    const questions = tr.questions(new Template({ Parameters: parameters }), overrides);
    assert.notEqual(questions[0].default, 'three', 'rejected disallowed default value');
});
