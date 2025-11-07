# Node.js Linux Mount/Unmount Library

Mount and unmount any filesystem on Linux — directly from Node.js using native system calls. Pure C + N-API. No dependencies. Runs everywhere.

---

## Prerequisites

* Node.js and npm must be installed
* Linux operating system (this library is Linux-specific)
* **Root privileges required** for mount operations
* GCC compiler for building the native addon

---

## Installation

**Install project dependencies:**
```bash
npm install --save-dev node-gyp
```

**Making build folder:**
```bash
npm run build || npm run install
npm run test
```
or
```bash
npx node-gyp rebuild
```

## Important Security Note
*Root privileges are REQUIRED for mount operations. Switch to root before running:*
```bash
sudo su
# or
sudo -s
```
## API Reference
### MountFlags Constants

```javascript
const { MountFlags } = require('./mount');

// MS flags (for mount operations)
console.log(MountFlags.MS.RDONLY);    // Read-only mount: 1
console.log(MountFlags.MS.NOSUID);    // Ignore suid and sgid bits: 2
console.log(MountFlags.MS.NODEV);     // Disallow device access: 4
console.log(MountFlags.MS.NOEXEC);    // Disallow program execution: 8
console.log(MountFlags.MS.BIND);      // Create a bind mount: 4096
// ... and many more

// MNT flags (for unmount operations)
console.log(MountFlags.MNT.FORCE);    // Force unmount: 1
console.log(MountFlags.MNT.DETACH);   // Lazy unmount: 2
```
### Core Functions

#### `mount(source, target, filesystemtype, flags, data)`

Mounts a filesystem.

**Parameters:**

| Parameter         | Type     | Description |
|-------------------|----------|-------------|
| `source`          | `string` | Source device or filesystem (e.g., `'/dev/sda1'`, `'tmpfs'`) |
| `target`          | `string` | Mount point directory (e.g., `'/mnt/my_mount'`) |
| `filesystemtype`  | `string` | Filesystem type (e.g., `'tmpfs'`, `'ext4'`, `'none'`) |
| `flags`           | `number` | Mount flags (use `MountFlags.MS.*`, combined with `|`) |
| `data`            | `string` | Mount options string. Use `''` for `NULL`/no options |

**Returns:**  
`0` on success, `-1` on error

#### `umount(target)`

Unmounts a filesystem.

**Parameters:**

| Parameter | Type     | Description                  |
|----------|----------|------------------------------|
| `target` | `string` | Mount point to unmount       |

**Returns:**  
`0` on success, `-1` on error

---

#### `umount2(target, flags)`

Unmounts a filesystem with additional flags.

**Parameters:**

| Parameter | Type     | Description                         |
|----------|----------|-------------------------------------|
| `target` | `string` | Mount point to unmount              |
| `flags`  | `number` | Unmount flags (use `MountFlags.MNT`) |

**Returns:**  
`0` on success, `-1` on error
## `EasyMount`

A high-level, ergonomic wrapper around low-level `mount` and `umount` system calls using FFI.  
Provides **named, readable methods** for common mount flags instead of raw bitmasks.

> **All `EasyMount.Mount.*` methods return `0` on success, `-1` on failure.**  
> **All `EasyMount.Umount.*` methods return `0` on success, `-1` on failure.**

---

### `EasyMount.Mount`

Namespace containing **pre-configured mount operations** with specific flags.

| Method | Flag Used | Use Case |
|--------|-----------|---------|
| `readOnly` | `MS.RDONLY` | Mount filesystem as read-only |
| `noSetUID` | `MS.NOSUID` | Block SUID/SGID bit execution |
| `noDevice` | `MS.NODEV` | Disallow device files (`/dev/*`) |
| `noExecute` | `MS.NOEXEC` | Prevent execution of binaries/scripts |
| `sync` | `MS.SYNCHRONOUS` | Force synchronous I/O (no caching) |
| `remount` | `MS.REMOUNT` | Remount an already-mounted filesystem |
| `mandLock` | `MS.MANDLOCK` | Enable mandatory file locking |
| `dirSync` | `MS.DIRSYNC` | Directory operations are synchronous |
| `noAtime` | `MS.NOATIME` | Do not update access time |
| `noDirAtime` | `MS.NODIRATIME` | Do not update directory access time |
| `bind` | `MS.BIND` | Create a bind mount |
| `move` | `MS.MOVE` | Atomically move a subtree |
| `recursive` | `MS.REC` | Apply bind/recursive to subtree |
| `silent` | `MS.SILENT` | Suppress certain kernel messages |
| `posixACL` | `MS.POSIXACL` | Enable POSIX ACLs |
| `unbindable` | `MS.UNBINDABLE` | Make mount unbindable |
| `private` | `MS.PRIVATE` | Treat as private mount |
| `slave` | `MS.SLAVE` | Slave mount propagation |
| `shared` | `MS.SHARED` | Shared mount propagation |
| `relAtime` | `MS.RELATIME` | Update atime only if older than mtime/ctime |
| `kernMount` | `MS.KERNMOUNT` | Kernel internal mount |
| `iVersion` | `MS.I_VERSION` | Increment inode version |
| `strictAtime` | `MS.STRICTATIME` | Always update atime |
| `lazyTime` | `MS.LAZYTIME` | Delay atime/mtime updates |

### `EasyMount.Umount`

Namespace for **unmount operations** with optional flags.

| Method   | Flag Used     | Behavior |
|----------|---------------|--------|
| `force`  | `MNT.FORCE`  |Force umount|
| `detach` | `MNT.DETACH`  | Lazy unmount — detaches immediately |
| `expire` | `MNT.EXPIRE`  | Mark for auto-expire if unused |

---

#### **Method Signatures:**

##### `force(target)`
Unmounts normally.

**Parameters:**
| Parameter | Type     | Description              |
|-----------|----------|--------------------------|
| `target`  | `string` | Mount point to unmount   |

**Returns:** `0` on success, `-1` on error

---

##### `detach(target)`
Lazy unmount — detaches immediately, processes can still use it.

**Parameters:**
| Parameter | Type     | Description              |
|-----------|----------|--------------------------|
| `target`  | `string` | Mount point              |

**Returns:** `0` on success, `-1` on error

---

##### `expire(target)`
Marks mount for expiration if unused (requires kernel support).

**Parameters:**
| Parameter | Type     | Description              |
|-----------|----------|--------------------------|
| `target`  | `string` | Mount point              |

**Returns:** `0` on success, `-1` on error

---

### Example Usage
#### **Method Signature (all identical):**
```javascript
const { EasyMount } = require('./mount');

// Mount tmpfs with security flags
EasyMount.Mount.noExecute('none', '/mnt/secure', 'tmpfs', 'size=5M');
EasyMount.Mount.noSetUID('none', '/mnt/secure', 'tmpfs', '');
EasyMount.Mount.noDevice('none', '/mnt/secure', 'tmpfs', '');

// Bind mount
EasyMount.Mount.bind('/src', '/dst', null, '');

// Remount as read-only
EasyMount.Mount.remount('none', '/mnt/data', 'tmpfs', 'size=10M');
EasyMount.Mount.readOnly('none', '/mnt/data', 'tmpfs', '');

// Unmount
EasyMount.Umount.force('/mnt/data');
EasyMount.Umount.detach('/mnt/tmp');  // Lazy unmount
```
```javascript
const { EasyMount } = require('./mount');

// Standard unmount
EasyMount.Umount.force('/mnt/data');

// Lazy unmount (detach)
EasyMount.Umount.detach('/tmp');

// Mark for expiration
EasyMount.Umount.expire('/var/tmp');

```
### Quick Start Tutorial
1. **Basic Setup**
```javascript
const { MountFlags, mount, umount } = require('./mount');
const fs = require('fs');

// Always run as root!
console.log('Current user should be root for mount operations');
```
2. **Simple tmpfs Mount Example**
```javascript
const testDir = '/mnt/my_test_mount';

try {
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
    }

    const result = mount('tmpfs', testDir, 'tmpfs', MountFlags.MS.NOEXEC, 'size=10M');
    
    if (result === 0) {
        console.log('Successfully mounted tmpfs!');
        fs.writeFileSync(`${testDir}/test.txt`, 'Hello from mounted filesystem!');
        console.log('File created in mounted filesystem');
    } else {
        console.log('Mount failed');
    }

} finally {
    try {
        umount(testDir);
        if (fs.existsSync(testDir)) {
            fs.rmdirSync(testDir);
        }
    } catch (e) {
        console.log('Cleanup warning:', e.message);
    }
}
```
3. **Advanced Example with Multiple Flags**
```javascript
const combinedFlags = MountFlags.MS.NOSUID | MountFlags.MS.NODEV | MountFlags.MS.NOEXEC;

const result = mount(
    '/dev/sdb1', 
    '/mnt/external', 
    'ext4', 
    combinedFlags, 
    ''
);
```
4. **Bind Mount Example**
```javascript
const bindResult = mount(
    '/home/user/data',
    '/mnt/bound_data', 
    'none', 
    MountFlags.MS.BIND, 
    ''
);
```
5. **Unmount Examples**
```javascript
umount('/mnt/my_mount');

umount2('/mnt/stuck_mount', MountFlags.MNT.FORCE);

umount2('/mnt/busy_mount', MountFlags.MNT.DETACH);
```
## Important Notes
### Data Parameter Handling
```javascript
// Correct - empty string for NULL
mount('tmpfs', '/mnt/test', 'tmpfs', MountFlags.MS.RDONLY, '');

// Incorrect - don't use null or undefined
mount('tmpfs', '/mnt/test', 'tmpfs', MountFlags.MS.RDONLY, null);
```
### Error Handling
```javascript
const result = mount('tmpfs', '/mnt/test', 'tmpfs', MountFlags.MS.RDONLY, '');
if (result === -1) {
    console.error('Mount operation failed');
}
```
### Testing
```bash
sudo su

node test-full-js1.js
node test-full-js2.js
node test-full-flags.js
node test-full-flags-easy.js
```
## Common Filesystem Types

| Filesystem | Description                     |
|------------|---------------------------------|
| `tmpfs`    | Temporary filesystem in memory  |
| `ext4`     | Linux extended filesystem       |
| `vfat`     | FAT32 filesystem                |
| `ntfs`     | Windows NT filesystem           |
| `none`     | For bind mounts                 |

---

## Troubleshooting

| Issue                   | Solution                                      |
|-------------------------|-----------------------------------------------|
| `Permission denied`     | Run as **root** (`sudo su` or `sudo -s`)      |
| `Mount failed`          | Check if mount point directory exists         |
| `Invalid argument`      | Verify filesystem type and flags              |
| `Library not found`     | Ensure `CLibrary.so` is in the same directory |

## License
This library is intended for educational and administrative purposes on systems where you have appropriate permissions.
