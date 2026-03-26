/* eslint-disable no-console */
/* eslint-disable no-useless-escape */
import assert from 'node:assert/strict';
import test from 'node:test';
import Sinon from 'sinon';
import {
    Commands,
} from '../lib/commands.js';
import Lookup from '../lib/lookup.js';

const opts = {
    name: 'my-stack',
    region: 'us-east-1',
    configBucket: 'my-config-bucket',
    templateBucket: 'my-template-bucket',
    tags: [{
        Key: 'developer',
        Value: 'ingalls'
    }]
};


test('[commands.create] no overrides', async () => {
    const cmd = new Commands({
        region: 'us-east-1',
        credentials: { accessKeyId: '-', secretAccessKey: '-' }
    }, opts, true);

    try {
        const context = await cmd.create('testing', 'templatePath');

        assert.equal(context.operations.length, 11, '11 operations are run');
        assert.deepEqual(context.config, opts, 'instantiate context with expected config');
        assert.deepEqual(context.suffix, 'testing', 'instantiate context with expected suffix');
        assert.equal(context.template, 'templatePath', 'set context.template');
        assert.deepEqual(context.tags, [{ Key: 'developer', Value: 'ingalls' }], 'set context.tags');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[commands.create] with overrides', async () => {
    const cmd = new Commands({
        region: 'us-east-1',
        credentials: { accessKeyId: '-', secretAccessKey: '-' }
    }, opts, true);

    try {
        const context = await cmd.create('testing', 'templatePath', { parameters: new Map() });

        assert.equal(context.operations.length, 11, '11 operations are run');
        assert.deepEqual(context.config, opts, 'instantiate context with expected config');
        assert.deepEqual(context.suffix, 'testing', 'instantiate context with expected suffix');
        assert.equal(context.template, 'templatePath', 'set context.template');
        assert.deepEqual(context.overrides, { parameters: new Map() }, 'sets context.overrides');
        assert.deepEqual(context.tags, [{ Key: 'developer', Value: 'ingalls' }], 'set context.tags');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[commands.create] with template object', async () => {
    const cmd = new Commands({
        region: 'us-east-1',
        credentials: { accessKeyId: '-', secretAccessKey: '-' }
    }, opts, true);

    try {
        const context = await cmd.create('testing', { arbitrary: 'template' });

        assert.equal(context.operations.length, 11, '11 operations are run');
        assert.deepEqual(context.config, opts, 'instantiate context with expected config');
        assert.deepEqual(context.suffix, 'testing', 'instantiate context with expected suffix');
        assert.deepEqual(context.template, { arbitrary: 'template' }, 'set context.template');
        assert.deepEqual(context.tags, [{ Key: 'developer', Value: 'ingalls' }], 'set context.tags');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[commands.update] no overrides', async () => {
    const cmd = new Commands({
        region: 'us-east-1',
        credentials: { accessKeyId: '-', secretAccessKey: '-' }
    }, opts, true);

    try {
        const context = await cmd.update('testing', 'templatePath');

        assert.equal(context.operations.length, 11, '11 operations are run');
        assert.deepEqual(context.config, opts, 'instantiate context with expected config');
        assert.deepEqual(context.suffix, 'testing', 'instantiate context with expected suffix');
        assert.equal(context.template, 'templatePath', 'set context.template');
        assert.deepEqual(context.overrides, { parameters: new Map() }, 'sets context.overrides');
        assert.deepEqual(context.tags, [{ Key: 'developer', Value: 'ingalls' }], 'set context.tags');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[commands.update] with overrides', async () => {
    const cmd = new Commands({
        region: 'us-east-1',
        credentials: { accessKeyId: '-', secretAccessKey: '-' }
    }, opts, true);

    try {
        const context = await cmd.update('testing', 'templatePath', { parameters: new Map() });

        assert.deepEqual(context.config, opts, 'instantiate context with expected config');
        assert.deepEqual(context.suffix, 'testing', 'instantiate context with expected suffix');
        assert.equal(context.template, 'templatePath', 'set context.template');
        assert.deepEqual(context.overrides, { parameters: new Map() }, 'sets context.overrides');
        assert.deepEqual(context.tags, [{ Key: 'developer', Value: 'ingalls' }], 'set context.tags');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[commands.update] with template object', async () => {
    const cmd = new Commands({
        region: 'us-east-1',
        credentials: { accessKeyId: '-', secretAccessKey: '-' }
    }, opts, true);

    try {
        const context = await cmd.update('testing', { arbitrary: 'template' });

        assert.equal(context.operations.length, 11, '11 operations are run');
        assert.deepEqual(context.config, opts, 'instantiate context with expected config');
        assert.deepEqual(context.suffix, 'testing', 'instantiate context with expected suffix');
        assert.deepEqual(context.template, { arbitrary: 'template' }, 'set context.template');
        assert.deepEqual(context.overrides, { parameters: new Map() }, 'sets empty context.overrides');
        assert.deepEqual(context.tags, [{ Key: 'developer', Value: 'ingalls' }], 'set context.tags');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[commands.delete] no overrides', async () => {
    const cmd = new Commands({
        region: 'us-east-1',
        credentials: { accessKeyId: '-', secretAccessKey: '-' }
    }, opts, true);

    try {
        const context = await cmd.delete('testing');

        assert.equal(context.operations.length, 3, '3 operations are run');
        assert.deepEqual(context.config, opts, 'instantiate context with expected config');
        assert.deepEqual(context.suffix, 'testing', 'instantiate context with expected suffix');
        assert.deepEqual(context.overrides, { parameters: new Map() }, 'sets empty overrides');
        assert.deepEqual(context.tags, [{ Key: 'developer', Value: 'ingalls' }], 'set context.tags');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[commands.cancel] no overrides', async () => {
    const cmd = new Commands({
        region: 'us-east-1',
        credentials: { accessKeyId: '-', secretAccessKey: '-' }
    }, opts, true);

    try {
        const context = await cmd.cancel('testing');

        assert.equal(context.operations.length, 2, '2 operations are run');
        assert.deepEqual(context.config, opts, 'instantiate context with expected config');
        assert.deepEqual(context.suffix, 'testing', 'instantiate context with expected suffix');
        assert.deepEqual(context.tags, [{ Key: 'developer', Value: 'ingalls' }], 'set context.tags');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[commands.info] success w/o resources', async () => {
    Sinon.stub(Lookup.prototype, 'info').callsFake((name: string, resources: boolean) => {
        assert.equal(name, 'my-stack-testing', 'lookup.info expected stack name');
        assert.ok(!(resources), 'lookup.info no resources');

        return Promise.resolve({
            StackName: name,
            Parameters: new Map(),
            StackStatus: 'CREATED',
            CreationTime: new Date(),
            Capabilities: [''],
            Outputs: new Map(),
            Region: 'us-east-1',
            Tags: new Map(),
        });
    });

    const cmd = new Commands({
        region: 'us-east-1',
        credentials: { accessKeyId: '-', secretAccessKey: '-' }
    }, opts, true);

    try {
        await cmd.info('testing');
    } catch (err) {
        assert.ifError(err);
    }

    Sinon.restore();
});

/*
test('[commands.info] success w/ resources', async () => {
    Sinon.stub(Lookup, 'info').callsFake((name, region, resources, decrypt) => {
        assert.equal(name, 'my-stack-testing', 'lookup.info expected stack name');
        assert.equal(region, 'us-east-1', 'lookup.info expected region');
        assert.ok(resources, 'lookup.info no resources');
        assert.ok(!(decrypt), 'lookup.info decrypt=false');

        return Promise.resolve();
    });

    const cmd = new Commands({
        region: 'us-east-1',
        credentials: { accessKeyId: '-', secretAccessKey: '-' }
    }, opts, true);
    try {
        await cmd.info('testing', true);
    } catch (err) {
        assert.ifError(err);
    }

    Lookup.info.restore();
});

test('[commands.info] success w/o decrypt', async () => {
    Sinon.stub(Lookup, 'info').callsFake((name, region, resources, decrypt) => {
        assert.equal(name, 'my-stack-testing', 'lookup.info expected stack name');
        assert.equal(region, 'us-east-1', 'lookup.info expected region');
        assert.ok(resources, 'lookup.info resources');
        assert.ok(!(decrypt), 'lookup.info decrypt=false');

        return Promise.resolve();
    });

    const cmd = new Commands({
        region: 'us-east-1',
        credentials: { accessKeyId: '-', secretAccessKey: '-' }
    }, opts, true);
    try {
        await cmd.info('testing', true);
    } catch (err) {
        assert.ifError(err);
    }

    Lookup.info.restore();
});

test('[commands.info] success w/ decrypt', async () => {
    Sinon.stub(Lookup, 'info').callsFake((name, region, resources, decrypt) => {
        assert.equal(name, 'my-stack-testing', 'lookup.info expected stack name');
        assert.equal(region, 'us-east-1', 'lookup.info expected region');
        assert.ok(resources, 'lookup.info resources');
        assert.ok(decrypt, 'lookup.info decrypt=true');

        return Promise.resolve();
    });

    const cmd = new Commands({
        region: 'us-east-1',
        credentials: { accessKeyId: '-', secretAccessKey: '-' }
    }, opts, true);
    try {
        await cmd.info('testing', true, true);
    } catch (err) {
        assert.ifError(err, 'success');
    }

    Lookup.info.restore();
});

test('[commands.info] null provided as suffix', async () => {
    Sinon.stub(Lookup, 'info').callsFake((name) => {
        assert.equal(name, 'my-stack', 'no trailing - on stack name');
        return Promise.resolve();
    });

    const cmd = new Commands(opts);

    try {
        await cmd.info(null, true);
    } catch (err) {
        assert.ifError(err);
    }

    Lookup.info.restore();
});

test('[commands.save] kms-mode', async () => {
    const cmd = new Commands(opts, true);

    try {
        const context = await cmd.save('testing', true);

        assert.deepEqual(context.config, opts, 'instantiate context with expected config');
        assert.deepEqual(context.suffix, 'testing', 'instantiate context with expected suffix');
        assert.equal(context.kms, true, 'sets context.kms');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[commands.save] not kms-mode', async () => {
    const cmd = new Commands(opts, true);

    try {
        const context = await cmd.save('testing');

        assert.deepEqual(context.config, opts, 'instantiate context with expected config');
        assert.deepEqual(context.suffix, 'testing', 'instantiate context with expected suffix');
        assert.equal(context.kms, false, 'sets context.kms');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[commands.commandContext] sets context', () => {
    const context = new CommandContext(opts, 'testing', opts);
    assert.equal(context.baseName, opts.name, 'sets baseName');
    assert.equal(context.suffix, 'testing', 'sets suffix');
    assert.equal(context.stackName, opts.name + '-testing', 'sets stackName');
    assert.equal(context.stackRegion, opts.region, 'sets stackRegion');
    assert.equal(context.configBucket, opts.configBucket, 'sets configBucket');
    assert.equal(context.templateBucket, opts.templateBucket, 'sets templateBucket');
    assert.deepEqual(context.overrides, {}, 'sets empty overrides');
    assert.deepEqual(context.oldParameters, {}, 'sets empty oldParameters');
});

test('[commands.commandContext] handles null suffix', () => {
    const context = new CommandContext(opts, null, opts);
    assert.equal(context.stackName, opts.name, 'sets stackName without trailing -');
});

test('[commands.commandContext] iterates through operations', async () => {
    let i = 0;
    const ops = [
        async() => {
            assert.equal(i, 0, 'called first function');
            i++;
        },
        async() => {
            assert.equal(i, 1, 'called second function');
            i++;
        }
    ];

    const context = new CommandContext(opts, 'testing', ops);
    try {
        await context.run();
        assert.equal(i, 2);
    } catch (err) {
        assert.ifError(err);
    }

});

test('[commands.commandContext] context.diffs', async () => {
    Sinon.stub(Prompt, 'confirm').callsFake(() => {
        return Promise.resolve(true);
    });

    try {
        const ops = [
            Operations.confirmParameters,
            Operations.confirmTemplate
        ];

        const context = new CommandContext(opts, 'testing', ops);

        context.oldParameters = { old: 'parameters' };
        context.newParameters = { old: 'parameters', newones: 'too' };
        context.oldTemplate = { old: 'template' };
        context.newTemplate = { new: 'template' };

        const performed = await context.run();

        assert.equal(performed, true);

        assert.deepEqual(context.diffs, {
            parameters: ' {\n\u001b[32m+  newones: "too"\u001b[39m\n }\n',
            template: '\x1B[90m {\n\x1B[39m\x1B[31m-"old": "template"\n\x1B[39m\x1B[32m+"new": "template"\n\x1B[39m\x1B[90m }\x1B[39m'
        }, 'callback provides diffs as 3rd arg');
    } catch (err) {
        assert.ifError(err);
    }

    Prompt.confirm.restore();
});

test('[commands.commandContext] aborts', async () => {

    try {
        const ops = [
            () => { throw new Error('aborted'); }
        ];

        const context = new CommandContext(opts, 'testing', ops);

        const performed = await context.run();

        assert.equal(performed, false, 'the requested command was not performed');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[commands.commandContext] aborts with error', async () => {
    try {
        const ops = [
            () => { throw new Error('failure'); }
        ];

        const context = new CommandContext(opts, 'testing', ops);

        await context.run();
        assert.fail();
    } catch (err) {
        assert.equal(err.message, 'failure');
    }

});

test('[Operations.updatePreamble] no template', async () => {
    Sinon.stub(Lookup, 'parameters').callsFake(() => {
        return Promise.resolve();
    });

    Sinon.stub(Lookup, 'template').callsFake(() => {
        return Promise.resolve();
    });

    try {
        const context = new CommandContext(opts, 'testing', []);

        await Operations.updatePreamble(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Template.NotFoundError, 'expected error type');
        assert.equal(err.message, 'Could not load template: No template passed', 'expected error message');
    }

    Lookup.parameters.restore();
    Lookup.template.restore();
});

test('[Operations.updatePreamble] templatePath not found', async () => {
    Sinon.stub(Lookup, 'parameters').callsFake(() => {
        return Promise.resolve();
    });

    Sinon.stub(Lookup, 'template').callsFake(() => {
        return Promise.resolve();
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.template = '/tmp/invalid/path/nonono.template.json',

        await Operations.updatePreamble(context);

        assert.fail();

    } catch (err) {
        assert.ok(err instanceof Template.NotFoundError, 'expected error type');
        assert.equal(err.message, 'Could not load template: file:///tmp/invalid/path/nonono.template.json does not exist', 'expected error message');
    }

    Lookup.parameters.restore();
    Lookup.template.restore();
});

test('[Operations.updatePreamble] template invalid', async () => {
    Sinon.stub(Template, 'read').callsFake(() => {
        throw new Template.InvalidTemplateError('failure');
    });

    Sinon.stub(Lookup, 'parameters').callsFake(() => {
        return Promise.resolve();
    });

    Sinon.stub(Lookup, 'template').callsFake(() => {
        return Promise.resolve();
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.template = 'example.template.json',
        await Operations.updatePreamble(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Template.InvalidTemplateError, 'expected error type');
        assert.equal(err.message, 'Could not parse template: failure', 'expected error message');
    }

    Template.read.restore();
    Lookup.parameters.restore();
    Lookup.template.restore();
});

test('[Operations.updatePreamble] stack not found for parameters', async () => {
    Sinon.stub(Template, 'read').callsFake(() => {
        return Promise.resolve();
    });

    Sinon.stub(Lookup, 'parameters').callsFake(() => {
        throw new Lookup.StackNotFoundError('failure');
    });

    Sinon.stub(Lookup, 'template').callsFake(() => {
        return Promise.resolve();
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.template = 'example.template.json',

        await Operations.updatePreamble(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.StackNotFoundError, 'expected error type');
        assert.equal(err.message, 'Missing stack: failure', 'expected error message');
    }

    Template.read.restore();
    Lookup.parameters.restore();
    Lookup.template.restore();
});

test('[Operations.updatePreamble] failure getting stack parameters', async () => {
    Sinon.stub(Template, 'read').callsFake(() => {
        return Promise.resolve();
    });

    Sinon.stub(Lookup, 'parameters').callsFake(() => {
        throw new Lookup.CloudFormationError('failure');
    });

    Sinon.stub(Lookup, 'template').callsFake(() => {
        return Promise.resolve();
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.template = 'example.template.json',

        await Operations.updatePreamble(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.CloudFormationError, 'expected error type');
        assert.equal(err.message, 'Failed to find existing stack: failure', 'expected error message');
    }

    Template.read.restore();
    Lookup.parameters.restore();
    Lookup.template.restore();

});

test('[Operations.updatePreamble] stack not found for template', async () => {
    Sinon.stub(Template, 'read').callsFake(() => {
        return Promise.resolve();
    });

    Sinon.stub(Lookup, 'parameters').callsFake(() => {
        return Promise.resolve();
    });

    Sinon.stub(Lookup, 'template').callsFake(() => {
        throw new Lookup.StackNotFoundError('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.template = 'example.template.json',

        await Operations.updatePreamble(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.StackNotFoundError, 'expected error type');
        assert.equal(err.message, 'Missing stack: failure', 'expected error message');
    }

    Template.read.restore();
    Lookup.parameters.restore();
    Lookup.template.restore();
});

test('[Operations.updatePreamble] failure getting stack template', async () => {
    Sinon.stub(Template, 'read').callsFake(() => {
        return Promise.resolve();
    });

    Sinon.stub(Lookup, 'parameters').callsFake(() => {
        return Promise.resolve();
    });

    Sinon.stub(Lookup, 'template').callsFake(() => {
        throw new Lookup.CloudFormationError('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.template = 'example.template.json',

        await Operations.updatePreamble(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.CloudFormationError, 'expected error type');
        assert.equal(err.message, 'Failed to find existing stack: failure', 'expected error message');
    }

    Template.read.restore();
    Lookup.parameters.restore();
    Lookup.template.restore();
});

test('[Operations.updatePreamble] success', async () => {
    Sinon.stub(Template, 'read').callsFake((template, options) => {
        assert.equal(template.pathname, path.resolve('example.template.json'), 'read correct template path');
        assert.deepEqual(options, { template: 'options' }, 'passed overrides.templateOptions');
        return Promise.resolve({ new: 'template' });
    });

    Sinon.stub(Lookup, 'parameters').callsFake(() => {
        return Promise.resolve({ old: 'parameters' });
    });

    Sinon.stub(Lookup, 'template').callsFake(() => {
        return Promise.resolve({ old: 'template' });
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.template = 'example.template.json',
        context.overrides = { templateOptions: { template: 'options' } },

        await Operations.updatePreamble(context);

        assert.deepEqual(context.newTemplate, { new: 'template' }, 'sets context.newTemplate');
        assert.deepEqual(context.oldTemplate, { old: 'template' }, 'sets context.oldTemplate');
        assert.deepEqual(context.oldParameters, { old: 'parameters' }, 'sets context.oldParameters');
    } catch (err) {
        assert.ifError(err);
    }

    Template.read.restore();
    Lookup.parameters.restore();
    Lookup.template.restore();
});

test('[Operations.updatePreamble] success with template object', async () => {
    Sinon.stub(Lookup, 'parameters').callsFake(() => {
        return Promise.resolve({ old: 'parameters' });
    });

    Sinon.stub(Lookup, 'template').callsFake(() => {
        return Promise.resolve({ old: 'template' });
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.template = { arbitrary: 'template' },

        await Operations.updatePreamble(context);

        assert.deepEqual(context.newTemplate, { arbitrary: 'template' }, 'sets context.newTemplate');
        assert.deepEqual(context.oldTemplate, { old: 'template' }, 'sets context.oldTemplate');
        assert.deepEqual(context.oldParameters, { old: 'parameters' }, 'sets context.oldParameters');
    } catch (err) {
        assert.ifError(err);
    }

    Lookup.parameters.restore();
    Lookup.template.restore();
});

test('[Operations.getMasterConfig] success', async () => {
    Sinon.stub(Lookup, 'defaultConfiguration').callsFake(() => {
        return Promise.resolve({ old: 'fresh' });
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.overrides = { masterConfig: 's3://chill.cfn.json' },
        context.oldParameters = { old: 'secure:staleelats' };

        await Operations.getMasterConfig(context);

        assert.deepEqual(context.oldParameters, { old: 'secure:staleelats' }, 'sets context.oldParameters');
    } catch (err) {
        assert.ifError(err);
    }

    Lookup.defaultConfiguration.restore();
});

test('[Operations.getMasterConfig] no-op', async () => {
    Sinon.stub(Lookup, 'defaultConfiguration').callsFake(() => {
        return Promise.resolve({ old: 'fresh' });
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.overrides = {},
        context.oldParameters = { old: 'stale' };

        await Operations.getMasterConfig(context);

        assert.deepEqual(context.oldParameters, { old: 'stale' }, 'context.oldParameters stays the same');
    } catch (err) {
        assert.ifError(err);
    }

    Lookup.defaultConfiguration.restore();

});

test('[Operations.getMasterConfig] failed', async () => {
    Sinon.stub(Lookup, 'defaultConfiguration').callsFake(() => {
        throw new Error();
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.overrides = { masterConfig: 's3://unchill.cfn.json' },
        context.oldParameters = { old: 'stale' };
        await Operations.getMasterConfig(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Error);
    }

    Lookup.defaultConfiguration.restore();
});

test('[Operations.getMasterConfig] no matching oldParameters does not put masterConfig keys into oldParameters for better looking diff at the end', async () => {
    Sinon.stub(Lookup, 'defaultConfiguration').callsFake(() => {
        return Promise.resolve({ bingo: 'fresh' });
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.overrides = { masterConfig: 's3://chill.cfn.json' },

        context.oldParameters = { old: 'stale' };
        await Operations.getMasterConfig(context);

        assert.deepEqual(context.oldParameters, { old: 'stale' }, 'leaves context.oldParameters alone');
    } catch (err) {
        assert.ifError(err);
    }

    Lookup.defaultConfiguration.restore();
});

test('[Operations.getMasterConfig] adding a newParameter that matches masterConfig parameter does not get overwritten, so that user is intentional in adding newParameters', async () => {
    Sinon.stub(Lookup, 'defaultConfiguration').callsFake(() => {
        return Promise.resolve({ old: 'fresh' });
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.overrides = { masterConfig: 's3://chill.cfn.json' },

        context.oldParameters = { hello: 'goodbye' };
        context.newTemplate = {};
        context.newTemplate.Parameters = { old: 'special whale' };
        Operations.getMasterConfig(context);

        assert.deepEqual(context.oldParameters, { hello: 'goodbye' }, 'no matching keys between oldParameters and masterConfig, no oldParameters are replaced');
        assert.deepEqual(context.newTemplate.Parameters, { old: 'special whale' }, 'newParameters are not replaced despite matching keys');
    } catch (err) {
        assert.ifError(err);
    }

    Lookup.defaultConfiguration.restore();
});

test('[Operations.promptParameters] force-mode', async () => {
    Sinon.stub(Template, 'questions').callsFake(() => {
        assert.fail('should not build questions');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.newTemplate = { Parameters: { old: {}, new: {} } },
        context.oldParameters = { old: 'parameters', extra: 'value' },
        context.overrides = { force: true },

        await Operations.promptParameters(context);

        assert.deepEqual(context.newParameters, { old: 'parameters' }, 'sets new parameters to old values, excluding values not present in template');
        assert.ok(!(context.newParameters.new), 'does not provide a parameter value if no default for it was found');
    } catch (err) {
        assert.ifError(err);
    }

    Template.questions.restore();
});

test('[Operations.promptParameters] not force-mode', async () => {
    const questions = { parameter: 'questions' };
    const answers = { parameter: 'answers' };

    Sinon.stub(Template, 'questions').callsFake((template, overrides) => {
        assert.deepEqual(template, { new: 'template' }, 'builds questions for new template');
        assert.deepEqual(overrides, { defaults: { old: 'parameters' }, kmsKeyId: undefined, region: 'us-east-1' }, 'uses old parameters as default values');
        return questions;
    });

    Sinon.stub(Prompt, 'parameters').callsFake((question) => {
        assert.deepEqual(question, questions, 'prompts for derived questions');
        return Promise.resolve(answers);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.newTemplate = { new: 'template' },
        context.oldParameters = { old: 'parameters' },

        await Operations.promptParameters(context);

        assert.deepEqual(context.newParameters, answers, 'sets new parameters to prompt responses');
    } catch (err) {
        assert.ifError(err);
    }

    Template.questions.restore();
    Prompt.parameters.restore();
});

test('[Operations.promptParameters] with parameter and kms overrides', async () => {
    Sinon.stub(Template, 'questions').callsFake((template, overrides) => {
        assert.deepEqual(overrides, { defaults: { old: 'overriden' }, kmsKeyId: 'this is a bomb key', region: 'us-west-2' }, 'uses override parameters');
        return { parameter: 'questions' };
    });

    Sinon.stub(Prompt, 'parameters').callsFake(() => {
        return Promise.resolve({ the: 'answers' });
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.stackRegion = 'us-west-2',
        context.newTemplate = { new: 'template' },
        context.oldParameters = { old: 'parameters' },
        context.overrides = { parameters: { old: 'overriden' }, kms: 'this is a bomb key' },

        await Operations.promptParameters(context);
    } catch (err) {
        assert.ifError(err);
    }

    Template.questions.restore();
    Prompt.parameters.restore();
});

test('[Operations.promptParameters] force-mode with no parameters in new template', async () => {
    try {
        const context = new CommandContext(opts, 'testing', []);
        context.newTemplate = { new: 'template' },
        context.overrides = { force: true },

        await Operations.promptParameters(context);

        assert.deepEqual(context.newParameters, {}, 'sets context.newParameters to empty');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[Operations.promptParameters] reject overrides that are not in old or new template', async () => {
    Sinon.stub(Prompt, 'parameters').callsFake(() => {
        return Promise.resolve({ some: 'answers' });
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.newTemplate = { Parameters: { Name: {} } };
        context.oldParameters = { Name: 'name', Age: 'age' };
        context.overrides = { parameters: { Name: 'overriden', Born: 'ignored' } };

        await Operations.promptParameters(context);

        assert.ok(!(context.oldParameters.Born), 'excludes extraneous parameter override');
    } catch (err) {
        assert.ifError(err);
    }

    Prompt.parameters.restore();
});

test('[Operations.promptParameters] changesetParameters use previous value for unchanged parameter values', async () => {
    const oldParameters = { old: 'parameters', the: 'answers' };
    const newParameters = { old: 'newvalue', the: 'answers' };

    Sinon.stub(Prompt, 'parameters').callsFake(() => {
        return Promise.resolve(newParameters);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.stackRegion = 'us-west-2',
        context.newTemplate = { new: 'template' },
        context.oldParameters = oldParameters,
        context.overrides = {},

        await Operations.promptParameters(context);

        assert.deepEqual(context.changesetParameters, [{ ParameterKey: 'old', ParameterValue: 'newvalue' }, { ParameterKey: 'the', UsePreviousValue: true }]);
    } catch (err) {
        assert.ifError(err);
    }

    Prompt.parameters.restore();
});

test('[Operations.promptParameters] changesetParameters does not set UsePreviousValue when overrides set the value', async () => {
    const oldParameters = { beep: 'boop' };
    const newParameters = { beep: 'boop' };

    Sinon.stub(Prompt, 'parameters').callsFake(() => {
        return Promise.resolve(newParameters);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.stackRegion = 'us-west-2',
        context.newTemplate = { new: 'template' },
        context.oldParameters = oldParameters,
        context.overrides = { parameters: { beep: 'boop' } },

        await Operations.promptParameters(context);

        assert.deepEqual(context.changesetParameters, [{ ParameterKey: 'beep', ParameterValue: 'boop' }]);
    } catch (err) {
        assert.ifError(err);
    }
    Prompt.parameters.restore();
});

test('[Operations.promptParameters] changesetParameters sets UsePreviousValue to true in the absence of overrides', async () => {
    const oldParameters = { beep: 'bop' };
    const newParameters = { beep: 'bop' };

    Sinon.stub(Prompt, 'parameters').callsFake(() => {
        return Promise.resolve(newParameters);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.stackRegion = 'us-west-2',
        context.newTemplate = { new: 'template' },
        context.oldParameters = oldParameters,
        context.overrides = {},

        await Operations.promptParameters(context);

        assert.deepEqual(context.changesetParameters, [{ ParameterKey: 'beep', UsePreviousValue: true }]);
    } catch (err) {
        assert.ifError(err);
    }

    Prompt.parameters.restore();
});

test('[Operations.promptParameters] do not set UsePreviousValue when creating a new stack', async () => {
    const oldParameters = { beep: 'boop' };
    const newParameters = { beep: 'boop' };

    Sinon.stub(Prompt, 'parameters').callsFake(() => {
        return Promise.resolve(newParameters);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.stackRegion = 'us-west-2';
        context.newTemplate = { new: 'template' };
        context.create = true;
        context.oldParameters = oldParameters;
        context.overrides = { parameters: { beep: 'boop' } };

        await Operations.promptParameters(context);

        assert.ok(context.create, 'context.create is set to true');
        assert.deepEqual(context.changesetParameters, [{ ParameterKey: 'beep', ParameterValue: 'boop' }]);
    } catch (err) {
        assert.ifError(err);
    }

    Prompt.parameters.restore();
});

test('[Operations.confirmParameters] force-mode', async () => {
    try {
        const context = new CommandContext(opts, 'testing', []);
        context.overrides = { force: true };
        context.oldParameters = { old: 'parameters' };
        context.newParameters = { old: 'parameters' };

        await Operations.confirmParameters(context);

    } catch (err) {
        assert.ifError(err);
    }

});

test('[Operations.confirmParameters] no difference', async () => {
    try {
        const context = new CommandContext(opts, 'testing', []);
        context.oldParameters = { old: 'parameters' };
        context.newParameters = { old: 'parameters' };

        await Operations.confirmParameters(context);

    } catch (err) {
        assert.ifError(err);
    }

});

test('[Operations.confirmParameters] preapproved', async () => {
    Sinon.stub(console, 'log');

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.oldParameters = { old: 'parameters' };
        context.newParameters = { old: 'parameters', newones: 'too' };
        context.overrides = {
            preapproved: { parameters: [' {\n\u001b[32m+  newones: "too"\u001b[39m\n }\n'] }
        };

        await Operations.confirmParameters(context);

        assert.ok(console.log.calledWith('Auto-confirming parameter changes... Changes were pre-approved in another region.'), 'Skip notice printed');
        assert.ok(context.overrides.skipConfirmParameters, 'sets skipConfirmParameters');
    } catch (err) {
        assert.ifError(err);
    }

    console.log.restore();
});

test('[Operations.confirmParameters] rejected', async () => {
    Sinon.stub(Prompt, 'confirm').callsFake((message) => {
        assert.equal(message, ' {\n\x1b[31m-  old: "parameters"\x1b[39m\n\x1b[32m+  new: "parameterz"\x1b[39m\n }\n\nAccept parameter changes?', 'prompted appropriate message');
        return Promise.resolve(false);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.oldParameters = { old: 'parameters' };
        context.newParameters = { new: 'parameterz' };
        context.overrides = {};

        await Operations.confirmParameters(context);

        assert.fail();
    } catch (err) {
        assert.equal(err.message, 'aborted'); // new
    }

    Prompt.confirm.restore();
});

test('[Operations.confirmParameters] accepted', async () => {
    Sinon.stub(Prompt, 'confirm').callsFake((message) => {
        assert.equal(message, ' {\n\x1b[31m-  old: "parameters"\x1b[39m\n\x1b[32m+  new: "parameters"\x1b[39m\n }\n\nAccept parameter changes?', 'prompted appropriate message');
        return Promise.resolve(true);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.oldParameters = { old: 'parameters' },
        context.newParameters = { new: 'parameters' },
        context.overrides = {},

        await Operations.confirmParameters(context);
    } catch (err) {
        assert.ifError(err);
    }

    Prompt.confirm.restore();
});

test('[Operations.confirmTemplate] no difference', async () => {
    try {
        const context = new CommandContext(opts, 'testing', []);
        context.oldTemplate = { old: 'template' },
        context.newTemplate = { old: 'template' },

        await Operations.confirmTemplate(context);

    } catch (err) {
        assert.ifError(err);
    }

});

test('[Operations.confirmTemplate] undefined', async () => {
    try {
        const context = new CommandContext(opts, 'testing', []);
        context.oldTemplate = { Parameters: { old: undefined } },
        context.newTemplate = { Parameters: {} },

        await Operations.confirmTemplate(context);

    } catch (err) {
        assert.ifError(err);
    }

});

test('[Operations.confirmTemplate] force-mode', async () => {
    try {
        const context = new CommandContext(opts, 'testing', []);
        context.oldTemplate = { old: 'template' },
        context.newTemplate = { new: 'template' },
        context.overrides = { force: true },

        await Operations.confirmTemplate(context);
    } catch (err) {
        assert.ifError(err);
    }

});

test('[Operations.confirmTemplate] preapproved', async () => {
    Sinon.stub(console, 'log');

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.oldTemplate = { old: 'template' },
        context.newTemplate = { new: 'template' },
        context.overrides = {
            preapproved: {
                template: ['\u001b[90m {\n\u001b[39m\u001b[31m-\"old\": \"template\"\n\u001b[39m\u001b[32m+\"new\": \"template\"\n\u001b[39m\u001b[90m }\u001b[39m']
            }
        };

        await Operations.confirmTemplate(context);

        assert.ok(console.log.calledWith('Auto-confirming template changes... Changes were pre-approved in another region.'), 'Skip notice printed');
        assert.ok(context.overrides.skipConfirmTemplate, 'sets skipConfirmTemplate');
    } catch (err) {
        assert.ifError(err);
    }

    console.log.restore();
});

test('[Operations.confirmTemplate] rejected', async () => {
    Sinon.stub(Prompt, 'confirm').callsFake((message) => {
        assert.equal(
            message,
            '\x1B[90m {\n\x1B[39m\x1B[31m-"old": "template"\n\x1B[39m\x1B[32m+"new": "template"\n\x1B[39m\x1B[90m }\x1B[39m\nAccept template changes?',
            'prompted appropriate message');
        return Promise.resolve(false);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.overrides = {}; // some previous test has mutated this
        context.oldTemplate = { old: 'template' },
        context.newTemplate = { new: 'template' },

        await Operations.confirmTemplate(context);

        assert.fail();
    } catch (err) {
        assert.equal(err.message, 'aborted');
    }

    Prompt.confirm.restore();
});

test('[Operations.confirmTemplate] accepted', async () => {
    Sinon.stub(Prompt, 'confirm').callsFake((message) => {
        assert.equal(message, '\x1B[90m {\n\x1B[39m\x1B[31m-"old": "template"\n\x1B[39m\x1B[32m+"new": "template"\n\x1B[39m\x1B[90m }\x1B[39m\nAccept template changes?', 'prompted appropriate message');
        return Promise.resolve(true);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.oldTemplate = { old: 'template' },
        context.newTemplate = { new: 'template' },

        await Operations.confirmTemplate(context);
    } catch (err) {
        assert.ifError(err);
    }

    Prompt.confirm.restore();
});

test('[Operations.confirmTemplate] lengthy diff, first unchanged section ignored', async () => {
    Sinon.stub(Prompt, 'confirm').callsFake((message) => {
        assert.equal(message, '\x1B[90m {\n "a": "lines",\n "aa": "lines",\n\x1B[39m\x1B[31m-"and": "will change too",\n\x1B[39m\x1B[32m+"and": "has changed",\n\x1B[39m\x1B[90m "b": "lines",\n "ba": "lines",\n "c": "lines",\n\x1B[39m\x1B[90m\n---------------------------------------------\n\n\x1B[39m\x1B[90m "r": "lines",\n "s": "lines",\n "t": "lines",\n\x1B[39m\x1B[31m-"this": "will change",\n\x1B[39m\x1B[32m+"this": "has changed",\n\x1B[39m\x1B[90m "u": "lines",\n "v": "lines"\n }\x1B[39m\nAccept template changes?', 'prompted appropriate message');
        return Promise.resolve(true);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.oldTemplate = {
            old: 'template',
            a: 'lines',
            b: 'lines',
            c: 'lines',
            d: 'lines',
            e: 'lines',
            f: 'lines',
            g: 'lines',
            h: 'lines',
            i: 'lines',
            j: 'lines',
            k: 'lines',
            this: 'will change',
            l: 'lines',
            m: 'lines',
            n: 'lines',
            o: 'lines',
            p: 'lines',
            q: 'lines',
            r: 'lines',
            s: 'lines',
            t: 'lines',
            u: 'lines',
            v: 'lines',
            and: 'will change too',
            aa: 'lines',
            ba: 'lines',
            ca: 'lines',
            da: 'lines',
            ea: 'lines',
            fa: 'lines',
            ga: 'lines',
            ha: 'lines',
            ia: 'lines',
            ja: 'lines',
            ka: 'lines'
        };
        context.newTemplate = {
            old: 'template',
            a: 'lines',
            b: 'lines',
            c: 'lines',
            d: 'lines',
            e: 'lines',
            f: 'lines',
            g: 'lines',
            h: 'lines',
            i: 'lines',
            j: 'lines',
            k: 'lines',
            this: 'has changed',
            l: 'lines',
            m: 'lines',
            n: 'lines',
            o: 'lines',
            p: 'lines',
            q: 'lines',
            r: 'lines',
            s: 'lines',
            t: 'lines',
            u: 'lines',
            v: 'lines',
            and: 'has changed',
            aa: 'lines',
            ba: 'lines',
            ca: 'lines',
            da: 'lines',
            ea: 'lines',
            fa: 'lines',
            ga: 'lines',
            ha: 'lines',
            ia: 'lines',
            ja: 'lines',
            ka: 'lines'
        },

        await Operations.confirmTemplate(context);
    } catch (err) {
        assert.ifError(err);
    }

    Prompt.confirm.restore();
});

test('[Operations.saveTemplate] bucket not found', async () => {
    const url = 'https://s3.amazonaws.com/my-template-bucket/my-stack-testing.template.json';

    Sinon.stub(Actions, 'templateUrl').callsFake(() => {
        return url;
    });

    Sinon.stub(Actions, 'saveTemplate').callsFake(() => {
        throw new Actions.BucketNotFoundError('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);

        await Operations.saveTemplate(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Actions.BucketNotFoundError, 'expected error type');
        assert.equal(err.message, 'Could not find template bucket: failure', 'expected error message');
    }

    Actions.templateUrl.restore();
    Actions.saveTemplate.restore();
});

test('[Operations.saveTemplate] failed to save template', async () => {
    const url = 'https://s3.amazonaws.com/my-template-bucket/my-stack-testing.template.json';

    Sinon.stub(Actions, 'templateUrl').callsFake(() => {
        return url;
    });

    Sinon.stub(Actions, 'saveTemplate').callsFake(() => {
        throw new Actions.S3Error('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);

        await Operations.saveTemplate(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Actions.S3Error, 'expected error type');
        assert.equal(err.message, 'Failed to save template: failure', 'expected error message');
    }

    Actions.templateUrl.restore();
    Actions.saveTemplate.restore();
});

test('[Operations.saveTemplate] success', async () => {
    const templateUrl = 'https://s3.amazonaws.com/my-template-bucket/my-stack-testing.template.json';

    const context = new CommandContext(opts, 'testing', []);

    Sinon.stub(Actions, 'templateUrl').callsFake((bucket, region, suffix) => {
        assert.equal(bucket, context.templateBucket, 'template url in proper bucket');
        assert.equal(region, context.stackRegion, 'template url in proper region');
        assert.equal(suffix, context.suffix, 'template url for correct suffix');
        return templateUrl;
    });

    Sinon.stub(Actions, 'saveTemplate').callsFake((url, template) => {
        assert.equal(url, templateUrl, 'saved to correct url');
        assert.equal(template, '{\n  "new": "template"\n}', 'saved correct template');

        return Promise.resolve();
    });

    try {
        context.newTemplate = { new: 'template' },

        await Operations.saveTemplate(context);

        assert.equal(context.templateUrl, templateUrl, 'sets template url');
    } catch (err) {
        assert.ifError(err);
    }

    Actions.templateUrl.restore();
    Actions.saveTemplate.restore();
});

test('[Operations.validateTemplate] invalid', async () => {
    Sinon.stub(Actions, 'validate').callsFake(() => {
        throw new Actions.CloudFormationError('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.templateUrl = 'https://s3.amazonaws.com/my-template-bucket/my-stack-testing.template.json',

        await Operations.validateTemplate(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Actions.CloudFormationError, 'correct error type');
        assert.equal(err.message, 'Invalid template: failure', 'expected error message');
    }

    Actions.validate.restore();
});

test('[Operations.validateTemplate] valid', async () => {
    const context = new CommandContext(opts, 'testing', []);

    Sinon.stub(Actions, 'validate').callsFake((region, url) => {
        assert.equal(region, context.stackRegion, 'validate in proper region');
        assert.equal(url, context.templateUrl, 'validate proper template');
        return Promise.resolve();
    });

    try {
        context.templateUrl = 'https://s3.amazonaws.com/my-template-bucket/my-stack-testing.template.json',

        await Operations.validateTemplate(context);
    } catch (err) {
        assert.ifError(err);
    }

    Actions.validate.restore();
});

test('[Operations.beforeUpdateHook] no hook', async () => {
    try {
        const context = new CommandContext(opts, 'testing', []);

        await Operations.beforeUpdateHook(context);
    } catch (err) {
        assert.ifError(err);
    }

});

test('[Operations.validateParametersHook] no hook', async () => {
    try {
        const context = new CommandContext(opts, 'testing', []);

        await Operations.validateParametersHook(context);
    } catch (err) {
        assert.ifError(err);
    }

});

test('[Operations.validateParametersHook] hook error', async () => {
    try {
        const context = new CommandContext(opts, 'testing', []);
        context.overrides = {
            validateParameters: function(context, callback) {
                callback(new Error('failure'));
            }
        };

        await Operations.validateParametersHook(context);

        assert.fail();
    } catch (err) {
        assert.equal(err.message, 'failure', 'passed through error on abort');
    }

});

test('[Operations.validateParametersHook] hook success', async () => {
    try {
        const context = new CommandContext(opts, 'testing', []);
        context.overrides = {
            validateParameters: function(arg, callback) {
                assert.deepEqual(arg, context, 'provided hook with runtime context');
                callback();
            }
        },

        await Operations.validateParametersHook(context);
    } catch (err) {
        assert.ifError(err);
    }

});

test('[Operations.beforeUpdateHook] hook error', async () => {
    try {
        const context = new CommandContext(opts, 'testing', []);

        context.overrides = {
            beforeUpdate: function(context, callback) {
                callback(new Error('failure'));
            }
        };

        await Operations.beforeUpdateHook(context);

        assert.fail();
    } catch (err) {
        assert.equal(err.message, 'failure', 'passed through error on abort');
    }

});

test('[Operations.beforeUpdateHook] hook success', async () => {
    try {
        const context = new CommandContext(opts, 'testing', []);
        context.overrides = {
            beforeUpdate: function(arg, callback) {
                assert.deepEqual(arg, context, 'provided hook with runtime context');
                callback();
            }
        };

        await Operations.beforeUpdateHook(context);
    } catch (err) {
        assert.ifError(err);
    }

});

test('[Operations.getChangeset] failure', async () => {
    Sinon.stub(Actions, 'diff').callsFake(() => {
        throw new Actions.CloudFormationError('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);

        await Operations.getChangeset(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Actions.CloudFormationError, 'correct error type');
        assert.equal(err.message, 'Failed to generate changeset: failure', 'expected error message');
    }

    Actions.diff.restore();
});

test('[Operations.getChangeset] success', async () => {
    const details = { changeset: 'details' };

    const context = new CommandContext(opts, 'testing', []);

    Sinon.stub(Actions, 'diff').callsFake((name, region, changeSetType, url, params, expand) => {
        assert.equal(name, context.stackName, 'changeset for correct stack');
        assert.equal(region, context.stackRegion, 'changeset in the correct region');
        assert.equal(changeSetType, 'UPDATE', 'changeSetType set correctly');
        assert.equal(url, context.templateUrl, 'changeset for the correct template');
        assert.deepEqual(params, context.changesetParameters, 'changeset using changeset parameters');
        assert.equal(expand, context.overrides.expand, 'changeset using override properties');
        return Promise.resolve(details);
    });

    try {
        context.stackName = 'my-stack-testing',
        context.lstackRegion = 'us-east-1',
        context.newParameters = { new: 'parameters' },
        context.changesetParameters = { ParameterKey: 'new', ParameterValue: 'parameters' },
        context.templateUrl = 'https://s3.amazonaws.com/my-template-bucket/my-stack-testing.template.json',
        context.overrides = { expand: true },

        await Operations.getChangeset(context, 'UPDATE');

        assert.deepEqual(context.changeset, details, 'sets context.changeset');
    } catch (err) {
        assert.ifError(err);
    }

    Actions.diff.restore();
});

test('[Operations.getChangesetCreate] success', async () => {
    Sinon.stub(Operations, 'getChangeset').callsFake((context, changeSetType) => {
        assert.equal(changeSetType, 'CREATE', 'has changeSetType');
        return Promise.resolve();
    });

    try {
        const context = new CommandContext(opts, 'testing', []);

        await Operations.getChangesetCreate(context);
    } catch (err) {
        assert.ifError(err);
    }

    Operations.getChangeset.restore();
});

test('[Operations.getChangesetUpdate] success', async () => {
    Sinon.stub(Operations, 'getChangeset').callsFake((context, changeSetType) => {
        assert.equal(changeSetType, 'UPDATE', 'has changeSetType');
        return Promise.resolve();
    });

    try {
        const context = new CommandContext(opts, 'testing', []);

        await Operations.getChangesetUpdate(context);
    } catch (err) {
        assert.ifError(err);
    }

    Operations.getChangeset.restore();
});

test('[Operations.confirmChangeset] force-mode', async () => {
    try {
        const context = new CommandContext(opts, 'testing', []);
        context.overrides = { force: true },

        await Operations.confirmChangeset(context);
    } catch (err) {
        assert.ifError(err);
    }

});

test('[Operations.confirmChangeset] skipConfirmParams && skipConfirmTemplate', async () => {
    try {
        const context = new CommandContext(opts, 'testing', []);
        context.overrides = { skipConfirmParameters: true, skipConfirmTemplate: true },

        await Operations.confirmChangeset(context);
    } catch (err) {
        assert.ifError(err);
    }

});

test('[Operations.confirmChangeset] rejected', async () => {
    Sinon.stub(Prompt, 'confirm').callsFake((message, defaultValue) => {
        assert.equal(defaultValue, false);
        return Promise.resolve(false);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.changeset = { changes: [] },

        await Operations.confirmChangeset(context);
    } catch (err) {
        assert.equal(err.message, 'aborted');
    }

    Prompt.confirm.restore();
});

test('[Operations.confirmChangeset] acccepted', async () => {
    Sinon.stub(Prompt, 'confirm').callsFake((message, defaultValue) => {
        assert.equal(message, '\n\n\nAccept changes and update the stack?', 'expected message');
        assert.equal(defaultValue, false);
        return Promise.resolve(true);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.changeset = { changes: [] },

        await Operations.confirmChangeset(context);
    } catch (err) {
        assert.ifError(err);
    }

    Prompt.confirm.restore();
});

test('[Operations.confirmChangeset] changeset formatting', async () => {
    Sinon.stub(Prompt, 'confirm').callsFake((message, defaultValue) => {
        assert.equal(message, 'Action  Name  Type  Replace\n------  ----  ----  -------\n\x1b[33mModify\x1b[39m  name  type  \x1b[31mtrue\x1b[39m   \n\x1b[32mAdd\x1b[39m     name  type  \x1b[32mfalse\x1b[39m  \n\x1b[31mRemove\x1b[39m  name  type  \x1b[32mfalse\x1b[39m  \n\nAccept changes and update the stack?', 'expected message (with colors)');
        assert.equal(defaultValue, false);
        return Promise.resolve(true);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.changeset = {
            changes: [
                { id: 'id', name: 'name', type: 'type', action: 'Modify', replacement: true },
                { id: 'id', name: 'name', type: 'type', action: 'Add', replacement: false },
                { id: 'id', name: 'name', type: 'type', action: 'Remove', replacement: false }
            ]
        };

        await Operations.confirmChangeset(context);
    } catch (err) {
        assert.ifError(err);
    }

    Prompt.confirm.restore();
});

test('[Operations.executeChangeSet] failure', async () => {
    Sinon.stub(Actions, 'executeChangeSet').callsFake(() => {
        throw new Actions.CloudFormationError('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.changeset = { id: 'changeset:arn' },

        await Operations.executeChangeSet(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Actions.CloudFormationError, 'expected error type');
        assert.equal(err.message, 'Failed to execute changeset: failure');
    }

    Actions.executeChangeSet.restore();
});

test('[Operations.executeChangeSet] not executable', async () => {
    Sinon.stub(Actions, 'executeChangeSet').callsFake(() => {
        const err = new Actions.ChangeSetNotExecutableError('failure');
        err.execution = 'OBSOLETE';
        err.reason = 'outdated';
        throw err;
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.changeset = { id: 'changeset:arn' },

        await Operations.executeChangeSet(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Actions.ChangeSetNotExecutableError, 'expected error type');
        assert.equal(err.message, 'Status: OBSOLETE | Reason: outdated | failure', 'expected error message');
    }

    Actions.executeChangeSet.restore();
});

test('[Operations.executeChangeSet] success', async () => {
    const context = new CommandContext(opts, 'testing', []);

    Sinon.stub(Actions, 'executeChangeSet').callsFake((name, region, id) => {
        assert.equal(name, context.stackName, 'execute on proper stack');
        assert.equal(region, context.stackRegion, 'execute in proper region');
        assert.equal(id, context.changeset.id, 'execute proper changeset');

        return Promise.resolve();
    });

    try {
        context.changeset = { id: 'changeset:arn' },

        await Operations.executeChangeSet(context);
    } catch (err) {
        assert.ifError(err);
    }

    Actions.executeChangeSet.restore();
});

test('[Operations.createPreamble] no template', async () => {
    Sinon.stub(Lookup, 'configurations').callsFake(() => {
        return Promise.resolve();
    });

    try {
        const context = new CommandContext(opts, 'testing', []);

        await Operations.createPreamble(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Template.NotFoundError, 'expected error type');
        assert.equal(err.message, 'Could not load template: No template passed');
    }

    Lookup.configurations.restore();
});

test('[Operations.createPreamble] template not found', async () => {
    Sinon.stub(Lookup, 'configurations').callsFake(() => {
        return Promise.resolve();
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.template = '/tmp/invalid/path/nonono.template.json',

        await Operations.createPreamble(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Template.NotFoundError, 'expected error type');
        assert.equal(err.message, 'Could not load template: file:///tmp/invalid/path/nonono.template.json does not exist', 'expected error message');
    }

    Lookup.configurations.restore();
});

test('[Operations.createPreamble] template invalid', async () => {
    Sinon.stub(Template, 'read').callsFake(() => {
        throw new Template.InvalidTemplateError('failure');
    });

    Sinon.stub(Lookup, 'configurations').callsFake(() => {
        return Promise.resolve();
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.template = 'example.template.json',

        await Operations.createPreamble(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Template.InvalidTemplateError, 'expected error type');
        assert.equal(err.message, 'Could not parse template: failure');
    }

    Template.read.restore();
    Lookup.configurations.restore();
});

test('[Operations.createPreamble] config bucket not found', async () => {
    Sinon.stub(Template, 'read').callsFake(() => {
        return Promise.resolve();
    });

    Sinon.stub(Lookup, 'configurations').callsFake(() => {
        throw new Lookup.BucketNotFoundError('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.template = 'example.template.json',

        await Operations.createPreamble(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.BucketNotFoundError, 'expected error type');
        assert.equal(err.message, 'Could not find config bucket: failure');
    }

    Template.read.restore();
    Lookup.configurations.restore();
});

test('[Operations.createPreamble] failed to read configurations', async () => {
    Sinon.stub(Template, 'read').callsFake(() => {
        return Promise.resolve();
    });

    Sinon.stub(Lookup, 'configurations').callsFake(() => {
        throw new Lookup.S3Error('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.template = 'example.template.json';

        await Operations.createPreamble(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.S3Error, 'expected error type');
        assert.equal(err.message, 'Could not load saved configurations: failure');
    }

    Template.read.restore();
    Lookup.configurations.restore();
});

test('[Operations.createPreamble] success', async () => {
    const context = new CommandContext(opts, 'testing', []);

    Sinon.stub(Template, 'read').callsFake((template, options) => {
        assert.equal(template.pathname, path.resolve('example.template.json'), 'read correct template path');
        assert.deepEqual(options, { template: 'options' }, 'passed overrides.templateOptions');
        return Promise.resolve({ new: 'template' });
    });

    Sinon.stub(Lookup, 'configurations').callsFake((name, bucket) => {
        assert.equal(name, context.baseName, 'lookup correct stack configurations');
        assert.equal(bucket, context.configBucket, 'lookup in correct bucket');
        return Promise.resolve(['config']);
    });

    try {
        context.template = 'example.template.json',
        context.overrides = { templateOptions: { template: 'options' } },

        await Operations.createPreamble(context);

        assert.deepEqual(context.newTemplate, { new: 'template' }, 'set context.newTemplate');
        assert.deepEqual(context.configNames, ['config'], 'set context.configNames');
        assert.ok(context.create, 'context.create is set to true');
    } catch (err) {
        assert.ifError(err);
    }

    Template.read.restore();
    Lookup.configurations.restore();
});

test('[Operations.createPreamble] success with template object', async () => {
    const context = new CommandContext(opts, 'testing', []);

    Sinon.stub(Template, 'read').callsFake((template, options) => {
        assert.equal(template, path.resolve(context.template), 'read correct template path');
        assert.deepEqual(options, { template: 'options' }, 'passed overrides.templateOptions');
        return Promise.resolve(context.template);
    });

    Sinon.stub(Lookup, 'configurations').callsFake((name, bucket) => {
        assert.equal(name, context.baseName, 'lookup correct stack configurations');
        assert.equal(bucket, context.configBucket, 'lookup in correct bucket');
        return Promise.resolve(['config']);
    });

    try {
        context.template = { arbitrary: 'template' },
        context.overrides = { templateOptions: { template: 'options' } },

        await Operations.createPreamble(context);

        assert.deepEqual(context.newTemplate, context.template, 'set context.newTemplate');
        assert.deepEqual(context.configNames, ['config'], 'set context.configNames');
        assert.ok(context.create, 'context.create is set to true');
    } catch (err) {
        assert.ifError(err);
    }

    Template.read.restore();
    Lookup.configurations.restore();
});

test('[Operations.selectConfig] force-mode', async () => {
    Sinon.stub(Prompt, 'configuration').callsFake(() => {
        assert.fail('should not prompt');
        throw new Error('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.overrides = { force: true },

        await Operations.selectConfig(context);

        assert.ok(!(context.configName), 'does not set context.configName');
    } catch (err) {
        assert.ifError(err);
    }

    Prompt.configuration.restore();
});

test('[Operations.selectConfig] new config', async () => {
    const context = new CommandContext(opts, 'testing', []);

    Sinon.stub(Prompt, 'configuration').callsFake((configs) => {
        assert.deepEqual(configs, context.configNames, 'prompted with correct config names');
        return Promise.resolve('New configuration');
    });

    try {
        context.configNames = ['config'],

        await Operations.selectConfig(context);

        assert.ok(!(context.configName), 'does not set context.configName');
    } catch (err) {
        assert.ifError(err);
    }

    Prompt.configuration.restore();
});

test('[Operations.selectConfig] saved config', async () => {
    const context = new CommandContext(opts, 'testing', []);

    Sinon.stub(Prompt, 'configuration').callsFake((configs) => {
        assert.deepEqual(configs, context.configNames, 'prompted with correct config names');
        return Promise.resolve('config');
    });

    try {
        context.configNames = ['config'],

        await Operations.selectConfig(context);

        assert.equal(context.configName, 'config', 'does set context.configName');
    } catch (err) {
        assert.ifError(err);
    }
    Prompt.configuration.restore();
});

test('[Operations.loadConfig] no saved config, no default', async () => {
    try {
        const context = new CommandContext(opts, 'testing', []);

        await Operations.loadConfig(context);

        assert.deepEqual(context.oldParameters, {}, 'does not set context.oldParameters');
    } catch (err) {
        assert.ifError(err);
    }

});

test('[Operations.loadConfig] no saved config, has default', async () => {
    Sinon.stub(Lookup, 'defaultConfiguration').callsFake((s3url) => {
        assert.equal(s3url, 's3://my-bucket/my-default.cfn.json', 'requested correct configuration');
        return Promise.resolve({ default: 'configuration' });
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.overrides = { defaultConfig: 's3://my-bucket/my-default.cfn.json' },

        await Operations.loadConfig(context);

        assert.deepEqual(context.oldParameters, { default: 'configuration' }, 'sets context.oldParameters');
    } catch (err) {
        assert.ifError(err);
    }

    Lookup.defaultConfiguration.restore();
});

test('[Operations.loadConfig] bucket not found', async () => {
    Sinon.stub(Lookup, 'configuration').callsFake(() => {
        throw new Lookup.BucketNotFoundError('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.configName = 'config',

        await Operations.loadConfig(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.BucketNotFoundError, 'expected error type');
        assert.equal(err.message, 'Could not find config bucket: failure', 'expected error message');
    }

    Lookup.configuration.restore();
});

test('[Operations.loadConfig] config not found', async () => {
    Sinon.stub(Lookup, 'configuration').callsFake(() => {
        throw new Lookup.ConfigurationNotFoundError('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.configName = 'config',

        await Operations.loadConfig(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.ConfigurationNotFoundError, 'expected error type');
        assert.equal(err.message, 'Could not find saved configuration: failure', 'expected error message');
    }

    Lookup.configuration.restore();
});

test('[Operations.loadConfig] invalid config', async () => {
    Sinon.stub(Lookup, 'configuration').callsFake(() => {
        throw new Lookup.InvalidConfigurationError('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.configName = 'config',

        await Operations.loadConfig(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.InvalidConfigurationError, 'expected error type');
        assert.equal(err.message, 'Saved configuration error: failure', 'expected error message');
    }

    Lookup.configuration.restore();
});

test('[Operations.loadConfig] failed to load config', async () => {
    Sinon.stub(Lookup, 'configuration').callsFake(() => {
        throw new Lookup.S3Error('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.configName = 'config',

        await Operations.loadConfig(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.S3Error, 'expected error type');
        assert.equal(err.message, 'Failed to read saved configuration: failure', 'expected error message');
    }

    Lookup.configuration.restore();
});

test('[Operations.loadConfig] success', async () => {
    const context = new CommandContext(opts, 'testing', []);

    Sinon.stub(Lookup, 'configuration').callsFake((name, bucket, config) => {
        assert.equal(name, context.baseName, 'expected stack name');
        assert.equal(bucket, context.configBucket, 'expected config bucket');
        assert.equal(config, context.configName, 'expected config name');
        return Promise.resolve({ saved: 'configuration' });
    });

    try {
        context.configName = 'config',

        await Operations.loadConfig(context);

        assert.deepEqual(context.oldParameters, { saved: 'configuration' }, 'set context.oldParameters');
    } catch (err) {
        assert.ifError(err);
    }

    Lookup.configuration.restore();
});

test('[Operations.confirmCreate] force-mode', async () => {
    Sinon.stub(Prompt, 'confirm').callsFake(() => {
        assert.fail('should not prompt');
        throw new Error('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.overrides = { force: true },

        await Operations.confirmCreate(context);
    } catch (err) {
        assert.ifError(err);
    }

    Prompt.confirm.restore();
});

test('[Operations.confirmCreate] reject', async () => {
    Sinon.stub(Prompt, 'confirm').callsFake(() => {
        return Promise.resolve(false);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.configName = 'config',

        await Operations.confirmCreate(context);

        assert.fail();
    } catch (err) {
        assert.equal(err.message, 'aborted');
    }

    Prompt.confirm.restore();
});

test('[Operations.confirmCreate] accept', async () => {
    Sinon.stub(Prompt, 'confirm').callsFake((message) => {
        assert.equal(message, 'Ready to create the stack?', 'expected message');
        return Promise.resolve(true);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.configName = 'config',

        await Operations.confirmCreate(context);
    } catch (err) {
        assert.ifError(err);
    }

    Prompt.confirm.restore();
});

test('[Operations.confirmDelete] force-mode', async () => {
    try {
        const context = new CommandContext(opts, 'testing', []);
        context.overrides = { force: true },

        await Operations.confirmDelete(context);
    } catch (err) {
        assert.ifError(err);
    }

});

test('[Operations.confirmDelete] reject', async () => {
    Sinon.stub(Prompt, 'confirm').callsFake((message, defaultValue) => {
        assert.equal(message, 'Are you sure you want to delete my-stack-testing in region us-east-1?');
        assert.equal(defaultValue, false);
        return Promise.resolve(false);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);

        await Operations.confirmDelete(context);
    } catch (err) {
        assert.equal(err.message, 'aborted');
    }

    Prompt.confirm.restore();
});

test('[Operations.confirmDelete] accept', async () => {
    Sinon.stub(Prompt, 'confirm').callsFake((message, defaultValue) => {
        assert.equal(message, 'Are you sure you want to delete my-stack-testing in region us-east-1?', 'expected message');
        assert.equal(defaultValue, false);
        return Promise.resolve(true);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);

        await Operations.confirmDelete(context);
    } catch (err) {
        assert.ifError(err);
    }

    Prompt.confirm.restore();
});

test('[Operations.deleteStack] failure', async () => {
    Sinon.stub(Actions, 'delete').callsFake(() => {
        throw new Actions.CloudFormationError('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);

        await Operations.deleteStack(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Actions.CloudFormationError, 'expected error type');
        assert.equal(err.message, 'Failed to delete stack: failure', 'expected error message');
    }

    Actions.delete.restore();
});

test('[Operations.deleteStack] success', async () => {
    const context = new CommandContext(opts, 'testing', []);

    Sinon.stub(Actions, 'delete').callsFake((name, region) => {
        assert.equal(name, context.stackName, 'deleted expected stack');
        assert.equal(region, context.stackRegion, 'deleted in expected region');
        return Promise.resolve();
    });

    try {
        await Operations.deleteStack(context);
    } catch (err) {
        assert.ifError(err);
    }

    Actions.delete.restore();
});

test('[Operations.monitorStack] failure', async () => {
    const context = new CommandContext(opts, 'testing', []);

    Sinon.stub(Actions, 'monitor').callsFake(() => {
        throw new Actions.CloudFormationError('failure');
    });

    try {
        await Operations.monitorStack(context);

        assert.fail();
    } catch (err) {
        assert.equal(err.message, `Monitoring your deploy failed, but the deploy in region ${context.stackRegion} will continue. Check on your stack's status in the CloudFormation console.`);
    }

    Actions.monitor.restore();
});

test('[Operations.monitorStack] success', async () => {
    const context = new CommandContext(opts, 'testing', []);

    Sinon.stub(Actions, 'monitor').callsFake((name, region) => {
        assert.equal(name, context.stackName, 'monitor expected stack');
        assert.equal(region, context.stackRegion, 'monitor in expected region');
        return Promise.resolve();
    });

    try {
        await Operations.monitorStack(context);
    } catch (err) {
        assert.ifError(err);
    }

    Actions.monitor.restore();
});

test('[Operations.getOldParameters] missing stack', async () => {
    const context = new CommandContext(opts, 'testing', []);

    Sinon.stub(Lookup, 'parameters').callsFake(() => {
        throw new Lookup.StackNotFoundError('failure');
    });

    try {
        await Operations.getOldParameters(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.StackNotFoundError, 'expected error type');
        assert.equal(err.message, 'Missing stack: failure', 'expected error message');
    }

    Lookup.parameters.restore();
});

test('[Operations.getOldParameters] failed to lookup stack', async () => {
    Sinon.stub(Lookup, 'parameters').callsFake(() => {
        throw new Lookup.CloudFormationError('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);

        await Operations.getOldParameters(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.CloudFormationError, 'expected error type');
        assert.equal(err.message, 'Failed to find existing stack: failure', 'expected error message');
    }

    Lookup.parameters.restore();
});

test('[Operations.getOldParameters] success', async () => {
    const context = new CommandContext(opts, 'testing', []);

    Sinon.stub(Lookup, 'parameters').callsFake((name, region) => {
        assert.equal(name, context.stackName, 'lookup expected stack');
        assert.equal(region, context.stackRegion, 'lookup in expected region');
        return Promise.resolve({ old: 'parameters' });
    });

    try {
        await Operations.getOldParameters(context);

        assert.deepEqual(context.oldParameters, { old: 'parameters' }, 'set context.oldParameters');
    } catch (err) {
        assert.ifError(err);
    }

    Lookup.parameters.restore();
});

test('[Operations.promptSaveConfig]', async () => {
    const context = new CommandContext(opts, 'testing', []);

    Sinon.stub(Prompt, 'input').callsFake((message, def) => {
        assert.equal(message, 'Name for saved configuration:', 'expected prompt');
        assert.equal(def, context.suffix, 'expected default value');
        return Promise.resolve('chuck');
    });

    try {
        context.oldParameters = { old: 'parameters' },

        await Operations.promptSaveConfig(context);

        assert.equal(context.saveName, 'chuck', 'sets context.saveName');
    } catch (err) {
        assert.ifError(err);
    }

    Prompt.input.restore();
});

test('[Operations.confirmSaveConfig] reject', async () => {
    Sinon.stub(Prompt, 'confirm').callsFake(() => {
        return Promise.resolve(false);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.oldParameters = { old: 'parameters' },

        await Operations.confirmSaveConfig(context);

        assert.fail();
    } catch (err) {
        assert.equal(err.message, 'aborted');
    }

    Prompt.confirm.restore();
});

test('[Operations.confirmSaveConfig] accept', async () => {
    Sinon.stub(Prompt, 'confirm').callsFake((message) => {
        assert.equal(message, 'Ready to save this configuration as "hello"?', 'expected message');
        return Promise.resolve(true);
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.saveName = 'hello',
        context.oldParameters = { old: 'parameters' },

        await Operations.confirmSaveConfig(context);
    } catch (err) {
        assert.ifError(err);
    }

    Prompt.confirm.restore();
});

test('[Operations.saveConfig] bucket not found', async () => {
    Sinon.stub(Actions, 'saveConfiguration').callsFake(() => {
        throw new Actions.BucketNotFoundError('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.oldParameters = { old: 'parameters' },
        context.kms = true,

        await Operations.saveConfig(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Actions.BucketNotFoundError, 'expected error type');
        assert.equal(err.message, 'Could not find template bucket: failure');
    }

    Actions.saveConfiguration.restore();
});

test('[Operations.saveConfig] failure', async () => {
    Sinon.stub(Actions, 'saveConfiguration').callsFake(() => {
        throw new Actions.S3Error('failure');
    });

    try {
        const context = new CommandContext(opts, 'testing', []);
        context.oldParameters = { old: 'parameters' },
        context.kms = true,

        await Operations.saveConfig(context);

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Actions.S3Error, 'expected error type');
        assert.equal(err.message, 'Failed to save template: failure');
    }

    Actions.saveConfiguration.restore();
});

test('[Operations.saveConfig] success', async () => {
    const context = new CommandContext(opts, 'testing', []);

    Sinon.stub(Actions, 'saveConfiguration').callsFake((baseName, stackName, stackRegion, bucket, parameters, kms) => {
        assert.equal(baseName, context.baseName, 'save under correct stack name');
        assert.equal(stackName, context.stackName, 'save under correct stack name');
        assert.equal(stackRegion, context.stackRegion, 'save under correct stack region');
        assert.equal(bucket, context.configBucket, 'save in correct bucket');
        assert.deepEqual(parameters, { new: 'parameters' }, 'save correct config');
        assert.equal(kms, 'alias/cloudformation', 'use appropriate kms setting');
        return Promise.resolve();
    });

    try {
        context.newParameters = { new: 'parameters' };
        context.overrides = { kms: true };

        await Operations.saveConfig(context);
    } catch (err) {
        assert.ifError(err);
    }

    Actions.saveConfiguration.restore();
});

test('[Operations.mergeMetadata]', async () => {
    try {
        const context = new CommandContext(opts, 'testing', []);
        context.stackRegion = 'us-west-2',
        context.newTemplate = { new: 'template' },
        context.oldParameters = { old: 'parameters' },
        context.overrides = {
            metadata: {
                LastDeploy: 'cooper'
            }
        },

        await Operations.mergeMetadata(context);

        assert.deepEqual(context.newTemplate.Metadata, { LastDeploy: 'cooper' });
    } catch (err) {
        assert.ifError(err);
    }

});

test('[Operations.mergeMetadata] error', async () => {
    try {
        const context = new CommandContext(opts, 'testing', []);
        context.stackRegion = 'us-west-2',
        context.newTemplate = { new: 'template', Metadata: { LastDeploy: 'jane' } },
        context.oldParameters = { old: 'parameters' },
        context.overrides = {
            metadata: {
                LastDeploy: 'cooper'
            }
        },

        await Operations.mergeMetadata(context);

        assert.fail();
    } catch (err) {
        assert.equal(err && err.toString(), 'Error: Metadata.LastDeploy already exists in template');
    }

});
*/
