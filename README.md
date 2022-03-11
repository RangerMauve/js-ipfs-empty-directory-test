# js-ipfs-empty-directory-test
Testing issues with `ipfs.ls('/ipfs/bafyaabakaieac')`

For some reason `npm-go-ipfs` combined with `ipfsd-ctl` are unable to properly detect that empty directory CIDs are empty directories when it comes to doing an `ipfs.ls` call or an `ipfs.files.cp` API call.

To run this example:

- Set up node.js on your system (I used 16.14.1)
- Clone the repo
- `npm install` the dependencies
- `npm test` to see the failing test case
