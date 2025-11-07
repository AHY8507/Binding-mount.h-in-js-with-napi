const { EasyMount } = require('../mount');
const fs = require('fs');
const path = require('path');

console.log('=== EasyMount Full Integration Test ===\n');

const TEST_ROOT = '/mnt/easymount_test';
const results = [];

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function cleanupDir(dir) {
    try {
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    } catch (err) {
        console.warn(`Cleanup failed for ${dir}:`, err.message);
    }
}

async function testMountMethod(name, mountFn) {
    const target = path.join(TEST_ROOT, name.toLowerCase().replace(/[^a-z0-9]/g, '_'));
    let success = false;
    let error = null;

    try {
        ensureDir(target);

        const mountRes = mountFn('none', target, 'tmpfs', 'size=1M');
        console.log(`[${name}] mount() =>`, mountRes);

        if (mountRes === 0) {
            console.log(`[${name}] Mount successful`);

            const umountRes = require('../mount').umount(target);
            console.log(`[${name}] umount() =>`, umountRes);

            if (umountRes === 0) {
                success = true;
            } else {
                error = `umount failed with code ${umountRes}`;
            }
        } else {
            error = `mount failed with code ${mountRes}`;
        }
    } catch (err) {
        error = err.message;
        console.error(`[${name}] Exception:`, err.message);
    } finally {
        cleanupDir(target);
    }

    results.push({ name, success, error });
}

async function testUmountMethod(name, umountFn) {
    const target = path.join(TEST_ROOT, 'umount_' + name.toLowerCase());
    let success = false;
    let error = null;

    try {
        ensureDir(target);
        const mountRes = require('../mount').mount('none', target, 'tmpfs', 0, 'size=1M');
        if (mountRes !== 0) throw new Error(`Failed to mount for umount test: ${mountRes}`);

        const umountRes = umountFn(target);
        console.log(`[Umount.${name}] =>`, umountRes);
        success = (umountRes === 0);
        if (!success) error = `umount returned ${umountRes}`;
    } catch (err) {
        error = err.message;
    } finally {
        cleanupDir(target);
    }

    results.push({ name: `Umount.${name}`, success, error });
}

(async () => {
    cleanupDir(TEST_ROOT);
    ensureDir(TEST_ROOT);

    console.log('Testing EasyMount.Mount methods...\n');

    const mountMethods = [
        ['readOnly', EasyMount.Mount.readOnly],
        ['noSetUID', EasyMount.Mount.noSetUID],
        ['noDevice', EasyMount.Mount.noDevice],
        ['noExecute', EasyMount.Mount.noExecute],
        ['sync', EasyMount.Mount.sync],
        ['remount', EasyMount.Mount.remount],
        ['mandLock', EasyMount.Mount.mandLock],
        ['dirSync', EasyMount.Mount.dirSync],
        ['noAtime', EasyMount.Mount.noAtime],
        ['noDirAtime', EasyMount.Mount.noDirAtime],
        ['bind', EasyMount.Mount.bind],
        ['move', EasyMount.Mount.move],
        ['recursive', EasyMount.Mount.recursive],
        ['silent', EasyMount.Mount.silent],
        ['posixACL', EasyMount.Mount.posixACL],
        ['unbindable', EasyMount.Mount.unbindable],
        ['private', EasyMount.Mount.private],
        ['slave', EasyMount.Mount.slave],
        ['shared', EasyMount.Mount.shared],
        ['relAtime', EasyMount.Mount.relAtime],
        ['kernMount', EasyMount.Mount.kernMount],
        ['iVersion', EasyMount.Mount.iVersion],
        ['strictAtime', EasyMount.Mount.strictAtime],
        ['lazyTime', EasyMount.Mount.lazyTime],
    ];

    for (const [name, fn] of mountMethods) {
        if (['remount', 'bind', 'move'].includes(name)) {
            console.log(`\n[${name}] SKIPPED (needs special setup)`);
            results.push({ name, success: 'SKIPPED', error: 'Requires pre-mounted or source' });
            continue;
        }
        await testMountMethod(name, fn);
    }

    console.log('\n=== Testing REMOUNT ===');
    const remountTarget = path.join(TEST_ROOT, 'remount_test');
    ensureDir(remountTarget);
    let mount1 = require('../mount').mount('none', remountTarget, 'tmpfs', 0, 'size=1M');
    if (mount1 === 0) {
        const remountRes = EasyMount.Mount.remount('none', remountTarget, 'tmpfs', 'size=2M');
        console.log('[remount] result =>', remountRes);
        results.push({ name: 'remount', success: remountRes === 0, error: remountRes !== 0 ? `code ${remountRes}` : null });
        require('../mount').umount(remountTarget);
    } else {
        results.push({ name: 'remount', success: false, error: 'initial mount failed' });
    }
    cleanupDir(remountTarget);

    console.log('\n=== Testing BIND ===');
    const bindSrc = path.join(TEST_ROOT, 'bind_src');
    const bindDst = path.join(TEST_ROOT, 'bind_dst');
    ensureDir(bindSrc);
    ensureDir(bindDst);
    fs.writeFileSync(path.join(bindSrc, 'test.txt'), 'hello bind');
    let bindMount = require('../mount').mount('none', bindSrc, 'tmpfs', 0, 'size=1M');
    if (bindMount === 0) {
        const bindRes = EasyMount.Mount.bind(bindSrc, bindDst, null, '');
        console.log('[bind] result =>', bindRes);
        results.push({ name: 'bind', success: bindRes === 0, error: bindRes !== 0 ? `code ${bindRes}` : null });
        if (bindRes === 0) require('../mount').umount(bindDst);
        require('../mount').umount(bindSrc);
    }
    cleanupDir(bindSrc);
    cleanupDir(bindDst);

    console.log('\nTesting EasyMount.Umount methods...\n');
    await testUmountMethod('force', EasyMount.Umount.force);
    await testUmountMethod('detach', EasyMount.Umount.detach);
    await testUmountMethod('expire', EasyMount.Umount.expire);

    console.log('\n' + '='.repeat(60));
    console.log('                           TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`${'Method'.padEnd(20)} | ${'Status'.padEnd(8)} | Error`);
    console.log('-'.repeat(60));

    for (const r of results) {
        const status = r.success === 'SKIPPED' ? 'SKIP' :
                       r.success ? 'PASS' : 'FAIL';
        const error = r.error ? ` (${r.error})` : '';
        console.log(`${r.name.padEnd(20)} | ${status.padEnd(8)} |${error}`);
    }

    console.log('='.repeat(60));
    const passed = results.filter(r => r.success === true).length;
    const failed = results.filter(r => r.success === false).length;
    const skipped = results.filter(r => r.success === 'SKIPPED').length;
    console.log(`Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`);
    console.log('All tests completed!\n');
})();