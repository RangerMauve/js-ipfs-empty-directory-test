global.Buffer = Buffer

const test = require('tape')
const ipfsHttpModule = require('ipfs-http-client')
const Ctl = require('ipfsd-ctl')
const ipfsBin = require('go-ipfs').path()

const EMPTY_DIR_CID = 'bafyaabakaieac'
const EXAMPLE_DIR = '/example'

const factory = Ctl.createFactory({
  type: 'go',
  // test: true,
  disposable: true,
  remote: false,
  ipfsHttpModule,
  ipfsBin,
  args: '--enable-pubsub-experiment'
})

test.onFinish(async () => {
  await factory.clean()
  // Used for browser tests
  if ((typeof window !== 'undefined') && window.close) window.close()
})

async function getInstance () {
  const ipfsd = await factory.spawn()
  await ipfsd.init()
  await ipfsd.start()
  await ipfsd.api.id()

  return ipfsd.api
}

test.only('Listing an empty dir should show it as a directory', async (t) => {
  let ipfs = null
  try {
    ipfs = await getInstance()

    t.pass('Initialized IPFS')

    const list = await collect(ipfs.ls(EMPTY_DIR_CID))

    t.deepEqual(list, [], 'Got empty listing')

    const fileEntry = list[0]
    if (fileEntry) {
      t.notEqual(fileEntry.type, 'file', 'Even if there is an entry, it should not be a file')
    }

    await ipfs.files.cp(`/ipfs/${EMPTY_DIR_CID}/`, EXAMPLE_DIR)

    t.ok('Able to copy empty dir CID')

    const copiedContents = await collect(ipfs.files.ls(EXAMPLE_DIR))

    t.deepEqual(copiedContents, [], 'Got an empty directory')

    const copiedFile = copiedContents[0]
    if (copiedFile) {
      t.notEqual(copiedFile.name, EMPTY_DIR_CID, 'should not have a file or subdirectory named after the root')
    }
  } finally {
    try {
      if (ipfs) await ipfs.stop()
    } catch (e) {
      console.error('Could not stop', e)
      // Whatever
    }
  }
})

async function collect (iterable) {
  const results = []
  for await (const item of iterable) {
    results.push(item)
  }

  return results
}
