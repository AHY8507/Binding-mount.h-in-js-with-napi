const { MountFlags, mount, umount } = require('../mount');
const fs = require('fs');

console.log('=== Debug Mount Test ===');

const testDir = '/mnt/quick_test';

try {
    console.log('1. Checking MountFlags:', MountFlags.MS.NOSUID);
    
    if (!fs.existsSync(testDir)) {
        console.log('2. Creating directory:', testDir);
        fs.mkdirSync(testDir, { recursive: true });
    }

    console.log('3. Attempting mount...');
    const mountResult = mount('tmpfs', testDir, 'tmpfs', MountFlags.MS.NOSUID, 'size=5M');
    
    console.log('4. Mount result:', mountResult);
    
    if (mountResult === 0) {
        console.log('Mounted successfully');
        
        fs.writeFileSync(`${testDir}/hello.txt`, 'Hello from mounted tmpfs!');
        console.log('File created in mount');
        
        const content = fs.readFileSync(`${testDir}/hello.txt`, 'utf8');
        console.log('File content:', content);
        
    } else {
        console.log('Mount failed with code:', mountResult);
        console.log('Error details:', require('util').inspect(mountResult));
    }

} catch (error) {
    console.log('Error:', error.message);
    console.log('Error stack:', error.stack);
} finally {
    console.log('Cleaning up...');
    try {
        const umountResult = umount(testDir);
        console.log('Unmount result:', umountResult);
        
        if (fs.existsSync(testDir)) {
            fs.rmdirSync(testDir);
            console.log('Directory removed');
        }
        
    } catch (cleanupError) {
        console.log('Cleanup warning:', cleanupError.message);
    }
    
    console.log('Test finished!');
}