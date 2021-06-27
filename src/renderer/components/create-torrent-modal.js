const React = require('react')

const config = require('../../config')
const dialog = require('electron').remote.dialog

const { dispatch, dispatcher } = require('../lib/dispatcher')

module.exports = class CreateTorrentModal extends React.Component {
  constructor (props) {
    super(props)

    this.onTorrentFileFromVideo = this.onTorrentFileFromVideo.bind(this)
    this.onTorrentFile = this.onTorrentFile.bind(this)
    this.onMagnetModal = this.onMagnetModal.bind(this)
  }

  onTorrentFileFromVideo() {
    dispatch('exitModal')
    const opts = process.platform === 'darwin'
    ? {
      title: 'Select a file or folder for the torrent.',
      properties: ['openFile', 'openDirectory']
    }
    : {
      title: 'Select a folder for the torrent.',
      properties: ['openDirectory']
    }

    dialog.showOpenDialog(opts)
    .then(result => {
      if (!Array.isArray(result.filePaths) || result.filePaths.length === 0) return
      dispatch('showCreateTorrent', result.filePaths)
    })
  }

  onTorrentFile() {
    dispatch('exitModal')
    const opts = {
      title: 'Select a .torrent file.',
      filters: [{ name: 'Torrent Files', extensions: ['torrent'] }],
      properties: ['openFile', 'multiSelections']
    }
  
    dialog.showOpenDialog(opts)
    .then(result => {
      if (!Array.isArray(result.filePaths)) return
      result.filePaths.forEach(function (selectedPath) {
        dispatch('addTorrent', selectedPath)
      })
    })
  }

  onMagnetModal() {
    dispatch('exitModal')
    dispatch('createMagnetDialog')
  }

  render () {
    return (
      <div className='custom-modal create-torrent-modal'>
        <div className="close-btn" onClick={dispatcher('exitModal')}>
          <img src={`${config.STATIC_PATH}/Close.png`} />
        </div>
        <div className="icon-wrapper">
          <img src={`${config.STATIC_PATH}/Plus.png`} />
        </div>
        <span className='content-title'>Create New Torrent from...</span>
        <div className="type-container">
          {/* <div className="dropzone-container">
            <div className="dropzone-wrapper">
              <img src={`${config.STATIC_PATH}/Vector.png`} />
            </div>
            <div className="dropzone-title">Drag & Drop MP4, torrent file</div>
          </div> */}
          <div className="fileopen-container">
            <div className="open-item" onClick={this.onTorrentFileFromVideo}>
              <div className="item-wrapper">
                <img src={`${config.STATIC_PATH}/MP4.png`} />
                <span className="file-title">Open MP4 File</span>
              </div>
              <img src={`${config.STATIC_PATH}/RightArrow.png`} />
            </div>
            <div className="open-item" onClick={this.onTorrentFile}>
              <div className="item-wrapper">
                <img src={`${config.STATIC_PATH}/Torrent.png`} />
                <span className="file-title">Open Torrent File</span>
              </div>
              <img src={`${config.STATIC_PATH}/RightArrow.png`} />
            </div>
            <div className="open-item" onClick={this.onMagnetModal}>
              <div className="item-wrapper">
                <img src={`${config.STATIC_PATH}/Magnetic.png`} />
                <span className="file-title">Enter Magnetic Link</span>
              </div>
              <img src={`${config.STATIC_PATH}/RightArrow.png`} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
