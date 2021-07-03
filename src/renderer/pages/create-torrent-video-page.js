const createTorrent = require('create-torrent')
const path = require('path')
const prettyBytes = require('prettier-bytes')
const React = require('react')
const mkdirp = require('mkdirp')
const http = require('http')
const captureFrame = require('capture-frame')
const fs = require('fs')

const config = require('../../config')

const { dispatch, dispatcher } = require('../lib/dispatcher')

const CustomButton = require('../components/custom-button')

const TextField = require('material-ui/TextField').default
const Checkbox = require('material-ui/Checkbox').default

const CreateTorrentErrorPage = require('../components/create-torrent-error-page')

const msgNoSuitablePoster = 'Cannot generate a poster from any files in the torrent'

const mediaExtensions = require('../lib/media-extensions')

// Shows a basic UI to create a torrent, from an already-selected file or folder.
// Includes a "Show Advanced..." button and more advanced UI.
class CreateTorrentPage extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      thumbnailPath: null
    }

    const state = this.props.state
    const info = state.location.current()

    // First, extract the base folder that the files are all in
    let pathPrefix = info.folderPath
    if (!pathPrefix) {
      pathPrefix = info.files.map((x) => x.path).reduce(findCommonPrefix)
      if (!pathPrefix.endsWith('/') && !pathPrefix.endsWith('\\')) {
        pathPrefix = path.dirname(pathPrefix)
      }
    }

    // Then, exclude .DS_Store and other dotfiles
    const files = info.files
      .filter((f) => !containsDots(f.path, pathPrefix))
      .map((f) => ({ name: f.name, path: f.path, size: f.size }))
    if (files.length === 0) return (<CreateTorrentErrorPage state={state} />)

    // Then, use the name of the base folder (or sole file, for a single file torrent)
    // as the default name. Show all files relative to the base folder.
    let defaultName, basePath
    if (files.length === 1) {
      // Single file torrent: /a/b/foo.jpg -> torrent name 'foo.jpg', path '/a/b'
      defaultName = files[0].name
      basePath = pathPrefix
    } else {
      // Multi file torrent: /a/b/{foo, bar}.jpg -> torrent name 'b', path '/a'
      defaultName = path.basename(pathPrefix)
      basePath = path.dirname(pathPrefix)
    }

    // Default trackers
    const trackers = createTorrent.announceList.join('\n')

    this.state = {
      comment: '',
      isPrivate: false,
      pathPrefix,
      basePath,
      defaultName,
      files,
      trackers
    }

    var _this = this

    torrentPoster(files, function(err, buf, extension) {
      if (err) return console.log('error generating poster: %o', err)
          // save it for next time
      mkdirp(config.POSTER_PATH, function(err) {
          if (err) return console.log('error creating poster dir: %o', err)
          const currentTime = new Date().getTime();
          const thumbnailFileName = 'newTorrentImage' + currentTime + extension
          const thumbnailFilePath = path.join(config.POSTER_PATH, thumbnailFileName)
          fs.writeFile(thumbnailFilePath, buf, function(err) {
            if (err) return console.log('error saving poster: %o', err)
            console.log('success', thumbnailFilePath)
            setTimeout(() => {
              _this.setState({ thumbnailPath: thumbnailFilePath.replace(/\\/g, '/') })
            }, 1000)
          })
      })
  })

    // Create React event handlers only once
    this.handleSetIsPrivate = (_, isPrivate) => this.setState({ isPrivate })
    this.handleSetComment = (_, comment) => this.setState({ comment })
    this.handleSetTrackers = (_, trackers) => this.setState({ trackers })
    this.handleSubmit = handleSubmit.bind(this)
  }

  render () {
    const files = this.state.files

    // Sanity check: show the number of files and total size
    const numFiles = files.length
    const totalBytes = files
      .map((f) => f.size)
      .reduce((a, b) => a + b, 0)
    const torrentInfo = `${numFiles} files, ${prettyBytes(totalBytes)}`

    return (
      <div className='create-torrent-video'>
        <div className="content-title">Create Torrent</div>
        <div className="content-container">
          <div className="left-container">
            <div className="name-wrapper">
              <div className="title">Name*</div>
              <div className="text">{this.state.defaultName}</div>
            </div>
            <div className="visibility-wrapper">
              <div className="visibility-check" onClick={() => this.setState({ isPrivate: false })}>
                {!this.state.isPrivate && <div className="active"></div>}  
              </div>
              <img src={`${config.STATIC_PATH}/Visibility.png`} />
              <div>Visible to community</div>
            </div>
            <div className="visibility-wrapper private">
              <div className="visibility-check" onClick={() => this.setState({ isPrivate: true })}>
                {this.state.isPrivate && <div className="active"></div>}  
              </div>
              <img src={`${config.STATIC_PATH}/Hide.png`} />
              <div>Private</div>
            </div>
            <div className="thumbnail-wrapper">
              <div className="title">Add thumbnail:</div>
              {this.state.thumbnailPath && (
                <div className="dropzone">
                  <img src={this.state.thumbnailPath} />
                </div>
              )}
            </div>
            <div className="divider"></div>
          </div>
          <div className="right-container">
            <div className="item-wrapper">
              <div className="title">Torrent Info:</div>
              <div className="info-wrapper">
                <div className="info-item">
                  <div>
                    <div className="type">File size:</div>
                    <div className="value">{torrentInfo}</div>
                  </div>
                </div>
                <div className="info-item">
                  <div>
                    <div className="type">Path:</div>
                    <div className="value">{this.state.pathPrefix}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="item-wrapper">
              <div className="title">Trackers:</div>
              <div className="tracker-wrapper">
                <TextField
                  className='torrent-trackers control'
                  fullWidth
                  multiLine
                  rows={3}
                  rowsMax={10}
                  value={this.state.trackers}
                  onChange={this.handleSetTrackers}
                  underlineStyle={{ display: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="button-wrapper">
          <CustomButton
            label="Cancel"
            onClick={dispatcher('cancel')}
            style={{ background: '#1F202A', boxShadow: '0px 50px 94px #0A0D11', width: 140, height: 52, marginRight: 25 }}
          />
          <CustomButton
            label="Save"
            onClick={this.handleSubmit}
            style={{ background: '#B169F6', boxShadow: '0px 50px 94px #0A0D11', width: 140, height: 52 }}
          />
        </div>
      </div>
    )
  }

  // Renders everything after clicking Show Advanced...:
  // * Is Private? (private torrents, not announced to DHT)
  // * Announce list (trackers)
  // * Comment
  renderAdvanced () {
    // Create file list
    const maxFileElems = 100
    const files = this.state.files
    const fileElems = files.slice(0, maxFileElems).map((file, i) => {
      const relativePath = path.relative(this.state.pathPrefix, file.path)
      return (<div key={i}>{relativePath}</div>)
    })
    if (files.length > maxFileElems) {
      fileElems.push(<div key='more'>+ {files.length - maxFileElems} more</div>)
    }

    // Align the text fields
    const textFieldStyle = { width: '' }
    const textareaStyle = { margin: 0 }

    return (
      <div key='advanced' className='create-torrent-advanced'>
        <div key='private' className='torrent-attribute'>
          <label>Private:</label>
          <Checkbox
            className='torrent-is-private control'
            style={{ display: '' }}
            checked={this.state.isPrivate}
            onCheck={this.handleSetIsPrivate}
          />
        </div>
        <div key='trackers' className='torrent-attribute'>
          <label>Trackers:</label>
          <TextField
            className='torrent-trackers control'
            style={textFieldStyle}
            textareaStyle={textareaStyle}
            multiLine
            rows={2}
            rowsMax={10}
            value={this.state.trackers}
            onChange={this.handleSetTrackers}
          />
        </div>
        <div key='comment' className='torrent-attribute'>
          <label>Comment:</label>
          <TextField
            className='torrent-comment control'
            style={textFieldStyle}
            textareaStyle={textareaStyle}
            hintText='Optionally describe your torrent...'
            multiLine
            rows={2}
            rowsMax={10}
            value={this.state.comment}
            onChange={this.handleSetComment}
          />
        </div>
        <div key='files' className='torrent-attribute'>
          <label>Files:</label>
          <div>{fileElems}</div>
        </div>
      </div>
    )
  }
}

function handleSubmit () {
  const announceList = this.state.trackers
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s !== '')
  const options = {
    // We can't let the user choose their own name if we want popnetwork
    // to use the files in place rather than creating a new folder.
    name: this.state.defaultName,
    path: this.state.basePath,
    files: this.state.files,
    announce: announceList,
    comment: this.state.comment.trim()
  }

  // If torrent is not private, leave private flag unset. This ensures that
  // the torrent info hash will match the result generated by other tools,
  // including popnetwork-cli.
  if (this.state.isPrivate) options.private = true

  dispatch('createTorrent', options)
}

// Finds the longest common prefix
function findCommonPrefix (a, b) {
  let i
  for (i = 0; i < a.length && i < b.length; i++) {
    if (a.charCodeAt(i) !== b.charCodeAt(i)) break
  }
  if (i === a.length) return a
  if (i === b.length) return b
  return a.substring(0, i)
}

function containsDots (path, pathPrefix) {
  const suffix = path.substring(pathPrefix.length).replace(/\\/g, '/')
  return ('/' + suffix).includes('/.')
}

function torrentPoster(files, cb) {
  // First, try to use a poster image if available
  const posterFile = files.filter(function (file) {
    return /^poster\.(jpg|png|gif)$/.test(file.name)
  })[0]
  if (posterFile) return extractPoster(posterFile, cb)

  // 'score' each media type based on total size present in torrent
  const bestScore = ['audio', 'video', 'image'].map(mediaType => {
    return {
      type: mediaType,
      size: calculateDataLengthByExtension(files, mediaExtensions[mediaType])
    }
  }).sort((a, b) => { // sort descending on size
    return b.size - a.size
  })[0]

  if (bestScore.size === 0) {
    // Admit defeat, no video, audio or image had a significant presence
    return cb(new Error(msgNoSuitablePoster))
  }

  // Based on which media type is dominant we select the corresponding poster function
  switch (bestScore.type) {
    case 'audio':
      return torrentPosterFromAudio(files, cb)
    case 'image':
      return torrentPosterFromImage(files, cb)
    case 'video':
      return torrentPosterFromVideo(files, cb)
  }
}

function calculateDataLengthByExtension (files, extensions) {
  const convertedFiles = filterOnExtension(files, extensions)
  if (convertedFiles.length === 0) return 0
  return convertedFiles
    .map(file => file.size)
    .reduce((a, b) => {
      return a + b
    })
}

function filterOnExtension (files, extensions) {
  return files.filter(file => {
    const extname = path.extname(file.name).toLowerCase()
    return extensions.indexOf(extname) !== -1
  })
}

function torrentPosterFromAudio (files, cb) {
  const imageFiles = filterOnExtension(files, mediaExtensions.image)

  if (imageFiles.length === 0) return cb(new Error(msgNoSuitablePoster))

  const bestCover = imageFiles.map(file => {
    return {
      file: file,
      score: scoreAudioCoverFile(file)
    }
  }).reduce((a, b) => {
    if (a.score > b.score) {
      return a
    }
    if (b.score > a.score) {
      return b
    }
    // If score is equal, pick the largest file, aiming for highest resolution
    if (a.file.length > b.file.length) {
      return a
    }
    return b
  })

  const extname = path.extname(bestCover.file.name)
  bestCover.file.getBuffer((err, buf) => cb(err, buf, extname))
}

function scoreAudioCoverFile (imgFile) {
  const fileName = path.basename(imgFile.name, path.extname(imgFile.name)).toLowerCase()
  const relevanceScore = {
    cover: 80,
    folder: 80,
    album: 80,
    front: 80,
    back: 20,
    spectrogram: -80
  }

  for (const keyword in relevanceScore) {
    if (fileName === keyword) {
      return relevanceScore[keyword]
    }
    if (fileName.indexOf(keyword) !== -1) {
      return relevanceScore[keyword]
    }
  }
  return 0
}

function torrentPosterFromImage (files, cb) {
  const file = getLargestFileByExtension(files, mediaExtensions.image)
  extractPoster(file, cb)
}

function getLargestFileByExtension (files, extensions) {
  const convertedFiles = filterOnExtension(files, extensions)
  if (convertedFiles.length === 0) return undefined
  return convertedFiles.reduce((a, b) => {
    return a.length > b.length ? a : b
  })
}

function torrentPosterFromVideo (files, cb) {
  const file = getLargestFileByExtension(files, mediaExtensions.video)
  const server = http.createServer((req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/vtt;charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Transfer-Encoding': 'chunked'
    })
    server.close()
  }).listen(0, onListening)

  function onListening () {
    const port = server.address().port
    const url = 'http://localhost:' + port + '/'
    const video = document.createElement('video')
    video.addEventListener('canplay', onCanPlay)

    video.volume = 0
    video.src = file.path;
    video.play()

    function onCanPlay () {
      video.removeEventListener('canplay', onCanPlay)
      video.addEventListener('seeked', onSeeked)

      video.currentTime = Math.min((video.duration || 600) * 0.03, 60)
    }

    function onSeeked () {
      video.removeEventListener('seeked', onSeeked)

      const buf = captureFrame(video)

      // unload video element
      video.pause()
      video.src = ''
      video.load()

      if (buf.length === 0) return cb(new Error(msgNoSuitablePoster))

      cb(null, buf, '.jpg')
    }
  }
}

function extractPoster (file, cb) {
  const extname = path.extname(file.name)
  file.getBuffer((err, buf) => { return cb(err, buf, extname) })
}

module.exports = CreateTorrentPage
