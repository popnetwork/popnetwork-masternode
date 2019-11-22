#!/usr/bin/env node

/**
 * Remove all traces of PopNetwork Desktop from the system (config and temp files).
 * Useful for developers.
 */

const fs = require('fs')
const os = require('os')
const path = require('path')
const rimraf = require('rimraf')

const config = require('../src/config')
const handlers = require('../src/main/handlers')

// First, remove generated files
rimraf.sync('build/')
rimraf.sync('dist/')

// Remove any saved configuration
rimraf.sync(config.CONFIG_PATH)

// Remove any temporary files
let tmpPath
try {
  tmpPath = path.join(fs.statSync('/tmp') && '/tmp', 'popnetwork')
} catch (err) {
  tmpPath = path.join(os.tmpdir(), 'popnetwork')
}
rimraf.sync(tmpPath)

// Uninstall .torrent file and magnet link handlers
handlers.uninstall()
