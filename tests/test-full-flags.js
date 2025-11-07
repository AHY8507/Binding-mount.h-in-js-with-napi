const { MountFlags, mount, umount } = require('../mount');
const fs = require('fs');
const path = require('path');

console.log('=== Full MountFlags Test ===');

const allFlags = MountFlags.MS;
const results = [];

for (const [flagName, flagValue] of Object.entries(allFlags)) {
    const testDir = `/mnt/mount_test_${flagName.toLowerCase()}`;
    console.log(`\n=== [${flagName}] Testing mount flag value: ${flagValue} ===`);

    try {
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }

        const mountResult = mount('none', testDir, 'tmpfs', flagValue, 'size=5M');
        console.log(`Mount(${flagName}) result:`, mountResult);

        if (mountResult === 0) {
            console.log(`Mount success for ${flagName}`);
            const umountResult = umount(testDir);
            console.log(`Unmount(${flagName}) result:`, umountResult);
            results.push({ flagName, flagValue, result: 'SUCCESS' });
        } else {
            console.log(`Mount failed for ${flagName}`);
            results.push({ flagName, flagValue, result: 'FAILED' });
        }
    } catch (err) {
        console.log(`Error testing ${flagName}:`, err.message);
        results.push({ flagName, flagValue, result: 'ERROR', error: err.message });
    } finally {
        try {
            if (fs.existsSync(testDir)) {
                fs.rmdirSync(testDir);
            }
        } catch (cleanupError) {
            console.log('Cleanup warning:', cleanupError.message);
        }
    }
}

console.log('\n=== TEST SUMMARY ===');
for (const r of results) {
    console.log(`${r.flagName.padEnd(15)} | ${r.result}`);
}

console.log('\nAll flag tests completed!');
