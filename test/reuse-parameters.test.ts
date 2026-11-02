import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import Sinon from 'sinon';
import { Commands, CommandContext, Operations } from '../lib/commands.js';
import Prompt from '../lib/prompt.js';
import { Template } from '../lib/template.js';

afterEach(() => Sinon.restore());

const client = {
    region: 'us-east-1',
    credentials: { accessKeyId: '-', secretAccessKey: '-' }
};

const opts = {
    name: 'my-stack',
    configBucket: 'my-config-bucket',
    templateBucket: 'my-template-bucket'
};

// Four parameters: two the stack knows, one the caller overrides, one new
// to the template.
const body = () => ({
    Parameters: {
        Name: { Type: 'String' },
        Handedness: { Type: 'String', Default: 'right', AllowedValues: ['left', 'right'] },
        GitSha: { Type: 'String' },
        Added: { Type: 'String', Default: 'fresh' }
    },
    Resources: {}
});

// Prompt.parameters is typed on inquirer's question shape; the tests only
// need the names.
const namesOf = (questions: unknown): string[] => (questions as { name: string }[]).map((question) => question.name);

const stackValues = () => new Map([
    ['Name', 'Hugh'],
    ['Handedness', 'right'],
    ['GitSha', 'old']
]);

test('[commands.update] reuseParameters is carried on the context', async () => {
    const cmd = new Commands(client, opts, true);

    const context = await cmd.update('testing', 'templatePath', { reuseParameters: true });
    assert.ok(context);
    assert.equal(context.reuseParameters, true, 'set from the override');
    assert.deepEqual(context.overrides, { parameters: new Map() }, 'parameters override untouched');

    const plain = await cmd.update('testing', 'templatePath', {});
    assert.ok(plain);
    assert.equal(plain.reuseParameters, false, 'off by default');
});

test('[Operations.promptParameters] reuseParameters asks only what nobody knows', async () => {
    const asked: string[][] = [];
    Sinon.stub(Prompt, 'parameters').callsFake(async (questions) => {
        asked.push(namesOf(questions));
        return new Map([['Added', 'typed']]);
    });

    try {
        const context = new CommandContext(client, opts, {
            reuseParameters: true,
            parameters: new Map([['GitSha', 'new']])
        }, 'testing', []);
        context.newTemplate = new Template(body());
        context.oldTemplate.parameters = stackValues();

        await Operations.promptParameters(context);

        assert.deepEqual(asked, [['Added']], 'only the parameter the stack does not know is prompted');
        assert.deepEqual([...context.newTemplate.parameters], [
            ['Name', 'Hugh'],
            ['Handedness', 'right'],
            ['GitSha', 'new'],
            ['Added', 'typed']
        ], 'stack values, the override and the answer, in template order');
        assert.deepEqual(context.changesetParameters, [
            { ParameterKey: 'Name', UsePreviousValue: true },
            { ParameterKey: 'Handedness', UsePreviousValue: true },
            { ParameterKey: 'GitSha', ParameterValue: 'new' },
            { ParameterKey: 'Added', ParameterValue: 'typed' }
        ], 'unchanged values travel as UsePreviousValue');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[Operations.promptParameters] reuseParameters re-asks a value the template no longer allows', async () => {
    const asked: string[][] = [];
    Sinon.stub(Prompt, 'parameters').callsFake(async (questions) => {
        asked.push(namesOf(questions));
        return new Map([['Handedness', 'left'], ['Added', 'typed']]);
    });

    try {
        const context = new CommandContext(client, opts, { reuseParameters: true }, 'testing', []);
        context.newTemplate = new Template(body());
        const stack = stackValues();
        stack.set('Handedness', 'ambidextrous');
        context.oldTemplate.parameters = stack;

        await Operations.promptParameters(context);

        assert.deepEqual(asked, [['Handedness', 'Added']], 'the disallowed value is asked again, the rest reused');
        assert.equal(context.newTemplate.parameters.get('Handedness'), 'left');
        assert.equal(context.newTemplate.parameters.get('GitSha'), 'old', 'no override: the stack value stands');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[Operations.promptParameters] reuseParameters with nothing unknown never prompts', async () => {
    const stub = Sinon.stub(Prompt, 'parameters').resolves(new Map());

    try {
        const context = new CommandContext(client, opts, { reuseParameters: true }, 'testing', []);
        const full = body();
        delete (full.Parameters as Record<string, unknown>).Added;
        context.newTemplate = new Template(full);
        context.oldTemplate.parameters = stackValues();

        await Operations.promptParameters(context);

        assert.equal(stub.callCount, 0, 'no question asked');
        assert.deepEqual([...context.newTemplate.parameters], [...stackValues()]);
        assert.ok(context.changesetParameters?.every((parameter) => parameter.UsePreviousValue === true), 'everything previous');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[Operations.promptParameters] without reuseParameters every parameter is still asked', async () => {
    const asked: string[][] = [];
    Sinon.stub(Prompt, 'parameters').callsFake(async (questions) => {
        asked.push(namesOf(questions));
        return new Map(namesOf(questions).map((name) => [name, 'answered']));
    });

    try {
        const context = new CommandContext(client, opts, {}, 'testing', []);
        context.newTemplate = new Template(body());
        context.oldTemplate.parameters = stackValues();

        await Operations.promptParameters(context);

        assert.deepEqual(asked, [['Name', 'Handedness', 'GitSha', 'Added']], 'the interactive path is unchanged');
        assert.deepEqual([...context.newTemplate.parameters.values()], ['answered', 'answered', 'answered', 'answered']);
    } catch (err) {
        assert.ifError(err);
    }

});
