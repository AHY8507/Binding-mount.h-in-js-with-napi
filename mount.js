// Flag definitions for mount and umount system calls
const MountFlags = {
    MS: { // Mount flags
        RDONLY: 1 << 0,
        NOSUID: 1 << 1,
        NODEV: 1 << 2,
        NOEXEC: 1 << 3,
        SYNCHRONOUS: 1 << 4,
        REMOUNT: 1 << 5,
        MANDLOCK: 1 << 6,
        DIRSYNC: 1 << 7,
        NOATIME: 1 << 10,
        NODIRATIME: 1 << 11,
        BIND: 1 << 12,
        MOVE: 1 << 13,
        REC: 1 << 14,
        SILENT: 1 << 15,
        POSIXACL: 1 << 16,
        UNBINDABLE: 1 << 17,
        PRIVATE: 1 << 18,
        SLAVE: 1 << 19,
        SHARED: 1 << 20,
        RELATIME: 1 << 21,
        KERNMOUNT: 1 << 22,
        I_VERSION: 1 << 23,
        STRICTATIME: 1 << 24,
        LAZYTIME: 1 << 25
    },
    MNT: { // Unmount flags
        FORCE: 1 << 0,
        DETACH: 1 << 1,
        EXPIRE: 1 << 2,
        NOFOLLOW: 1 << 3, // Obsolete 
        UNUSED: 1 << 4 // Obsolete
    }
};

const lib = require('./build/Release/addon.node');

function mount(source, target, fstype, flags, data) { 
    const result = lib.mounting(source, target, fstype, flags, data);
    return result;
}

function umount(target) {
    const result = lib.umounting(target);
    return result;
}

function umount2(target, flags) {
    const result = lib.umounting2(target, flags);
    return result;
}

// EasyMount namespace to hold Mount and Umount objects

const EasyMount = {
    Mount: {
        readOnly: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.RDONLY, data),
        noSetUID: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.NOSUID, data),
        noDevice: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.NODEV, data),
        noExecute: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.NOEXEC, data),
        sync: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.SYNCHRONOUS, data),
        remount: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.REMOUNT, data),
        mandLock: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.MANDLOCK, data),
        dirSync: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.DIRSYNC, data),
        noAtime: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.NOATIME, data),
        noDirAtime: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.NODIRATIME, data),
        bind: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.BIND, data),
        move: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.MOVE, data),
        recursive: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.REC, data),
        silent: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.SILENT, data),
        posixACL: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.POSIXACL, data),
        unbindable: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.UNBINDABLE, data),
        private: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.PRIVATE, data),
        slave: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.SLAVE, data),
        shared: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.SHARED, data),
        relAtime: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.RELATIME, data),
        kernMount: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.KERNMOUNT, data),
        iVersion: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.I_VERSION, data),
        strictAtime: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.STRICTATIME, data),
        lazyTime: (source, target, fstype, data) => lib.mounting(source, target, fstype, MountFlags.MS.LAZYTIME, data)
    },
    Umount: {
        force: (target) => lib.umounting(target),
        detach: (target) => lib.umounting2(target, MountFlags.MNT.DETACH),
        expire: (target) => lib.umounting2(target, MountFlags.MNT.EXPIRE)
    }
};

// Export the flags and functions
module.exports = {
    MountFlags,
    EasyMount,
    mount,
    umount,
    umount2
};