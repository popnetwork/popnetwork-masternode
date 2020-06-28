const { dispatch } = require('../lib/dispatcher')

module.exports = class IframeCodeController {
  constructor (state) {
    this.state = state
  }

  showCode(infoHash) {
    // You can only create torrents from the home screen.
    if (this.state.location.url() !== 'home') {
      return dispatch('error', 'Please go back to the torrent list before creating a new torrent.')
    }

    // Files will either be an array of file objects, which we can send directly
    // to the create-torrent screen
    this.state.location.go({
      url: 'iframe-code',
      infoHash, infoHash,
      setup: (cb) => {
        this.state.window.title = 'iFrame Code For This Torrent'
        cb(null)
      }
    })
  }
}
