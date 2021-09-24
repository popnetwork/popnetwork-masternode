const React = require('react')
const prettyBytes = require('prettier-bytes')
const config = require('../../config')
const theme = require('../../main/theme')

const Checkbox = require('material-ui/Checkbox').default
const LinearProgress = require('material-ui/LinearProgress').default

const TorrentSummary = require('../lib/torrent-summary')
const TorrentPlayer = require('../lib/torrent-player')
const CustomButton = require('../components/custom-button')
const SelectField = require('../components/custom-select')
const Popover = require('material-ui/Popover').default
const Menu = require('material-ui/Menu').default
const MenuItem = require('material-ui/MenuItem').default
const { dispatch, dispatcher } = require('../lib/dispatcher')

const SORT_DATA = [
  { value: 1, text: 'Last Added' },
  { value: 2, text: 'TOP Seeds' },
]

module.exports = class TorrentList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      sort: SORT_DATA[0],
      selectedTorrents: [],
      openedPopoverId: null,
      moreAnchorEl: null,
    }
    this.onAddVideo = this.onAddVideo.bind(this)
    this.onSelectAll = this.onSelectAll.bind(this)
    this.onSelectTorrent = this.onSelectTorrent.bind(this)
    this.onPauseSeeding = this.onPauseSeeding.bind(this)
    this.onResumeSedding = this.onResumeSedding.bind(this)
    this.onDeleteSeeding = this.onDeleteSeeding.bind(this)
    this.onMoreOpen = this.onMoreOpen.bind(this)
    this.onMoreCancel = this.onMoreCancel.bind(this)
    this.onMoreShare = this.onMoreShare.bind(this)
    this.onMoreDelete = this.onMoreDelete.bind(this)
  }

  onAddVideo() {
    dispatch('createTorrentDialog')
  }

  onSelectAll() {
    const { selectedTorrents } = this.state
    const { torrents } = this.props.state.saved
    if (selectedTorrents.length !== torrents.length)
      this.setState({ selectedTorrents: [...torrents] })
    else
      this.setState({ selectedTorrents: [] })
  }

  onSelectTorrent(torrentSummary) {
    const { selectedTorrents } = this.state
    const tempTorrents = [...selectedTorrents]
    let findIndex = selectedTorrents.findIndex((item) => item.infoHash === torrentSummary.infoHash)
    if (findIndex !== -1) {
      tempTorrents.splice(findIndex, 1)
    } else {
      tempTorrents.splice(tempTorrents.length, 0, torrentSummary)
    }

    this.setState({ selectedTorrents: tempTorrents })
  }

  onPauseSeeding() {
    const { selectedTorrents } = this.state
    if (selectedTorrents.length === 0)
      return

    selectedTorrents.map((torrentSummary) => {
      if (torrentSummary.status === 'downloading' || torrentSummary.status === 'seeding') {
        dispatch('toggleTorrent', torrentSummary.infoHash)
      }
    })
  }

  onResumeSedding() {
    const { selectedTorrents } = this.state
    if (selectedTorrents.length === 0)
      return

    selectedTorrents.map((torrentSummary) => {
      if (torrentSummary.status === 'paused') {
        dispatch('toggleTorrent', torrentSummary.infoHash)
      }
    })
  }

  onDeleteSeeding() {
    const { selectedTorrents } = this.state
    if (selectedTorrents.length === 0)
      return

    selectedTorrents.map((torrentSummary) => {
      dispatch('deleteTorrentDialog', torrentSummary.infoHash, false)
    })
  }

  onMoreOpen(event, infoHash) {
    event.preventDefault();

    this.setState({
      openedPopoverId: infoHash,
      moreAnchorEl: event.currentTarget,
    });
  };

  onMoreShare(infoHash) {
    this.onMoreCancel()
    dispatch('createIframeDialog', infoHash)
  }

  onMoreDelete(infoHash) {
    this.onMoreCancel()
    dispatch('deleteTorrentDialog', infoHash, false)
  }

  onMoreCancel() {
    this.setState({
      openedPopoverId: null,
      moreAnchorEl: null,
    });
  }

  render () {
    const state = this.props.state
    const { selectedTorrents } = this.state

    const contents = []
    if (state.downloadPathStatus === 'missing') {
      contents.push(
        <div key='torrent-missing-path'>
          <p>Download path missing: {state.saved.prefs.downloadPath}</p>
          <p>Check that all drives are connected?</p>
          <p>Alternatively, choose a new download path
            in <a href='#' onClick={dispatcher('preferences')}>Preferences</a>
          </p>
        </div>
      )
    }
    const torrents = state.saved.torrents.sort((a, b) => {
      if (this.state.sort.value === 1) {
        return b.fileAddTimes - a.fileAddTimes
      }
      else {
        let firstProgress = a.progress
        let secondProgress = b.progress
        if (!firstProgress || !secondProgress)
          return 0

        return secondProgress.numPeers - firstProgress.numPeers
      }
    })
    const torrentElems = torrents.map(
      (torrentSummary) => this.renderTorrent(torrentSummary)
    )

    contents.push(...torrentElems)
    // TODO we don't show this panel for now
    // contents.push(
    //   <div key='torrent-placeholder' className='torrent-placeholder'>
    //     <span className='ellipsis'>Drop a torrent file here or paste a magnet link</span>
    //   </div>
    // )

    return (
      <div key='torrent-list' className='torrent-list'>
        <div className="list-header">
          <span className="content-title">My video torrents</span>
          <div className="button-wrapper">
            <SelectField
              data={SORT_DATA}
              selectedData={this.state.sort}
              onChange={(index) => this.setState({ sort: SORT_DATA[index] })}
            />
            <CustomButton
              label="Add Video"
              onClick={this.onAddVideo}
              img={`${config.STATIC_PATH}/Add.png`}
              style={{ background: '#B169F6', boxShadow: '0px 20px 31px #0D0E11', width: 150, height: 40, marginLeft: 20 }}
            />
          </div>
        </div>
        {contents.length === 0
          ?
            <div className="empty-torrents">
              <img src={`${config.STATIC_PATH}/EmptyTorrents.png`} className="empty-image" draggable={false} />
              <div className="content-title">You don't have any videos yet.</div>
              <div className="gray-title">Share your video and earn real money from staking POP coin</div>
              <CustomButton
                label="Add your first video"
                onClick={this.onAddVideo}
                img={`${config.STATIC_PATH}/FirstAdd.png`}
                style={{ background: '#1F202A', width: 210 }}
              />
            </div>
          :
          <div className="list-container">
            <div className="list-toolbar">
              <div className="all-check" onClick={this.onSelectAll}>
                <img src={`${config.STATIC_PATH}/${selectedTorrents.length !== torrents.length ? 'Checkbox.png' : 'CheckboxAllActive.png' }`} draggable={false} />
              </div>
              <span className="selected-all">{`Select all`}</span>
              <span className="selected-value">{`Selected: ${selectedTorrents.length}`}</span>
              <div className="vertical-divider"></div>
              <div className="action-wrapper" style={{ opacity: selectedTorrents.length === 0 ? 0.2 : 1 }}>
                <span style={{ color: '#6C6E8B' }}>Actions:</span>
                <CustomButton
                  label="Pause seeding"
                  className="pause-button"
                  onClick={this.onPauseSeeding}
                  img={`${config.STATIC_PATH}/Pause.png`}
                  hoverImg={`${config.STATIC_PATH}/PauseHover.png`}
                  style={{
                    margin: '0 10px'
                  }}
                />
                <CustomButton
                  label="Resume seeding"
                  className="resume-button"
                  onClick={this.onResumeSedding}
                  img={`${config.STATIC_PATH}/Resume.png`}
                  style={{
                    marginRight: 10
                  }}
                />
                <CustomButton
                  label="Delete"
                  className="delete-button"
                  onClick={this.onDeleteSeeding}
                  img={`${config.STATIC_PATH}/Delete.png`}
                />
              </div>
            </div>
            <div className="list-wrapper">
              {torrents.map((torrentSummary) => (
                this.renderListTorrentSummary(torrentSummary)
              ))}
            </div>
            {/* {contents} */}
          </div>
        }
        {state.isFetchingTorrents && this.renderLoadingOverlay()}
      </div>
    )
  }

  renderListTorrentSummary(torrentSummary) {
    const state = this.props.state
    const { selectedTorrents } = this.state
    const infoHash = torrentSummary.infoHash
    const isSelected = infoHash && state.selectedInfoHash === infoHash

    // Background image: show some nice visuals, like a frame from the movie, if possible
    const styles = {
      wrapper: {
        display: 'inline-block',
        flex: 1,
      },
      progress: {
        height: 4,
        width: '100%',
      }
    }
    let imageUrl = null
    if (torrentSummary.posterFileName) {
      imageUrl = TorrentSummary.getPosterPath(torrentSummary)
    } else {
      imageUrl = torrentSummary.imageLink
    }

    const classes = ['torrent-summary']
    if (isSelected) classes.push('selected')
    if (!infoHash) classes.push('disabled')
    if (!torrentSummary.torrentKey) throw new Error('Missing torrentKey')

    const name = torrentSummary.title || torrentSummary.name || 'Loading torrent...'

    const prog = torrentSummary.progress
    let progElem
    if (torrentSummary.error) {
      progElem = (
        <>
          <div className="summary-title-wrapper">
            <span className="summary-title">{name}</span>
          </div>
          {getErrorMessage(torrentSummary)}
        </>
      )
    } else {
      progElem = (
        <>
          <div className="summary-header">
            <div className="summary-check" onClick={() => this.onSelectTorrent(torrentSummary)}>
              <img src={`${config.STATIC_PATH}/${!selectedTorrents.find((torrent) => torrent.infoHash === infoHash) ? 'Checkbox.png' : 'CheckboxActive.png' }`} draggable={false} />
            </div>
            <div className="action-wrapper">
              {prog && <span className="peers">{`Peers: ${prog.numPeers}`}</span>}
              <div className="show">
                <img src={`${config.STATIC_PATH}/${torrentSummary.private ? 'Hide.png' : 'Visibility.png'}`} draggable={false} />
              </div>
              <div className="more" onClick={(event) => this.onMoreOpen(event, infoHash)}>
                <img src={`${config.STATIC_PATH}/More.png`} className="normal" draggable={false} />
                <img src={`${config.STATIC_PATH}/MoreHover.png`} className="hover" draggable={false} />
                <Popover
                  open={this.state.openedPopoverId === infoHash}
                  anchorEl={this.state.moreAnchorEl}
                  anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                  targetOrigin={{horizontal: 'right', vertical: 'top'}}
                  onRequestClose={() => this.setState({
                    openedPopoverId: null,
                  })}
                  className="custom-dropdown"
                >
                  <Menu>
                    <MenuItem
                      onClick={() => this.onMoreShare(torrentSummary.infoHash)}
                      className={`menu-item`}
                      style={{ borderRadius: 12, fontSize: 12 }}
                      primaryText="Share"
                    />
                    <MenuItem
                      onClick={() => this.onMoreDelete(torrentSummary.infoHash)}
                      className={`menu-item`}
                      style={{ borderRadius: 12, fontSize: 12 }}
                      primaryText="Delete"
                    />
                  </Menu>
                </Popover>
              </div>
            </div>
          </div>
          <div className="summary-title-wrapper">
            <span className="summary-title">{name}</span>
            <span className='size'>{`${prog ? prettyBytes(prog.length || 0) : ''}`}</span>
          </div>
          <img src={imageUrl} className="cover-image" onClick={() => dispatch('playFile', infoHash)} draggable={false} />
          {/* {imageUrl && <img className="torrent-cover" src={imageUrl} />} */}
          <div className="horizontal-divider"></div>
          <div className="bottom-wrapper">
            {renderProgress()}
          </div>
        </>
      )
    }

    return (
      <div className="torrent-summary-wrapper" key={infoHash}>
        <div
          className={classes.join(' ')}
        >
          {progElem}
        </div>
      </div>
    )

    function renderTorrentStatus() {
      let status
      if (torrentSummary.status === 'paused') {
        if (!torrentSummary.progress) status = ''
        else if (torrentSummary.progress.progress === 1) status = 'Not seeding'
        else status = 'Paused'
      } else if (torrentSummary.status === 'downloading') {
        if (!torrentSummary.progress) status = ''
        else if (!torrentSummary.progress.ready) status = 'Verifying'
        else status = 'Downloading'
      } else if (torrentSummary.status === 'seeding') {
        status = 'Seeding'
      } else { // torrentSummary.status is 'new' or something unexpected
        status = ''
      }
      return (<span className='torrent-status'>{`${status}`}</span>)
    }

    function renderProgress () {
      const progress = prog ? Math.floor(100 * prog.progress) : 0;

      return (
        <>
          <div key='progress-bar' style={styles.wrapper}>
            <LinearProgress style={styles.progress} mode='determinate' value={progress} color="#A9CC46" />
          </div>
          <div className="status-wrapper">
            {renderTorrentStatus()}
            {prog && <span className="downloaded">{` - ${prettyBytes(prog.downloaded)}`}</span>}
          </div>
        </>
      )
    }
  }

  renderTorrent (torrentSummary) {
    const state = this.props.state
    const infoHash = torrentSummary.infoHash
    const isSelected = infoHash && state.selectedInfoHash === infoHash

    // Background image: show some nice visuals, like a frame from the movie, if possible
    const style = {}
    let imageUrl = null
    if (torrentSummary.posterFileName) {
      const gradient = 'linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.4) 100%)'
      const posterPath = TorrentSummary.getPosterPath(torrentSummary)
      style.backgroundImage = `${gradient}, url('${posterPath}')`
    } else {
      imageUrl = torrentSummary.imageLink
    }

    // Foreground: name of the torrent, basic info like size, play button,
    // cast buttons if available, and delete
    const classes = ['torrent']
    if (isSelected) classes.push('selected')
    if (!infoHash) classes.push('disabled')
    if (!torrentSummary.torrentKey) throw new Error('Missing torrentKey')
    return (
      <div
        id={torrentSummary.testID && ('torrent-' + torrentSummary.testID)}
        key={torrentSummary.torrentKey}
        style={style}
        className={classes.join(' ')}
        onContextMenu={infoHash && dispatcher('openTorrentContextMenu', infoHash)}
        onClick={infoHash && dispatcher('toggleSelectTorrent', infoHash)}
      >
	  	{imageUrl && <img className="torrent-cover" src={imageUrl} draggable={false} />}
        {this.renderTorrentMetadata(torrentSummary)}
        {infoHash ? this.renderTorrentButtons(torrentSummary) : null}
        {isSelected ? this.renderTorrentDetails(torrentSummary) : null}
        <hr />
      </div>
    )
  }

  // Show name, download status, % complete
  renderTorrentMetadata (torrentSummary) {
    const name = torrentSummary.title || torrentSummary.name || 'Loading torrent...'
    const elements = [(
      <div key='name' className='name ellipsis'>{name}</div>
    )]

    // If it's downloading/seeding then show progress info
    const prog = torrentSummary.progress
    let progElems
    if (torrentSummary.error) {
      progElems = [getErrorMessage(torrentSummary)]
    } else if (torrentSummary.status !== 'paused' && prog) {
      progElems = [
        renderDownloadCheckbox(),
        renderTorrentStatus(),
        renderProgressBar(),
        renderPercentProgress(),
        renderTotalProgress(),
        renderPeers(),
        renderSpeeds(),
        renderEta()
      ]
    } else {
      progElems = [
        renderDownloadCheckbox(),
        renderTorrentStatus()
      ]
    }
    elements.push(
      <div key='progress-info' className='ellipsis'>
        {progElems}
      </div>
    )

    return (<div key='metadata' className='metadata'>{elements}</div>)

    function renderDownloadCheckbox () {
      const infoHash = torrentSummary.infoHash
      const isActive = ['downloading', 'seeding'].includes(torrentSummary.status)
      return (
        <Checkbox
          key='download-button'
          className={'control download ' + torrentSummary.status}
          style={{
            display: 'inline-block',
            width: 32
          }}
          iconStyle={{
            width: 20,
            height: 20
          }}
          checked={isActive}
          onClick={stopPropagation}
          onCheck={dispatcher('toggleTorrent', infoHash)}
        />
      )
    }

    function renderProgressBar () {
      const progress = Math.floor(100 * prog.progress)
      const styles = {
        wrapper: {
          display: 'inline-block',
          marginRight: 8
        },
        progress: {
          height: 8,
          width: 30
        }
      }
      return (
        <div key='progress-bar' style={styles.wrapper}>
          <LinearProgress style={styles.progress} mode='determinate' value={progress} />
        </div>
      )
    }

    function renderPercentProgress () {
      const progress = Math.floor(100 * prog.progress)
      return (<span key='percent-progress'>{progress}%</span>)
    }

    function renderTotalProgress () {
      const downloaded = prettyBytes(prog.downloaded)
      const total = prettyBytes(prog.length || 0)
      if (downloaded === total) {
        return (<span key='total-progress'>{downloaded}</span>)
      } else {
        return (<span key='total-progress'>{downloaded} / {total}</span>)
      }
    }

    function renderPeers () {
      if (prog.numPeers === 0) return
      const count = prog.numPeers === 1 ? 'peer' : 'peers'
      return (<span key='peers'>{prog.numPeers} {count}</span>)
    }

    function renderSpeeds () {
      let str = ''
      if (prog.downloadSpeed > 0) str += ' ↓ ' + prettyBytes(prog.downloadSpeed) + '/s'
      if (prog.uploadSpeed > 0) str += ' ↑ ' + prettyBytes(prog.uploadSpeed) + '/s'
      if (str === '') return
      return (<span key='download'>{str}</span>)
    }

    function renderEta () {
      const downloaded = prog.downloaded
      const total = prog.length || 0
      const missing = total - downloaded
      const downloadSpeed = prog.downloadSpeed
      if (downloadSpeed === 0 || missing === 0) return

      const rawEta = missing / downloadSpeed
      const hours = Math.floor(rawEta / 3600) % 24
      const minutes = Math.floor(rawEta / 60) % 60
      const seconds = Math.floor(rawEta % 60)

      // Only display hours and minutes if they are greater than 0 but always
      // display minutes if hours is being displayed
      const hoursStr = hours ? hours + 'h' : ''
      const minutesStr = (hours || minutes) ? minutes + 'm' : ''
      const secondsStr = seconds + 's'

      return (<span key='eta'>{hoursStr} {minutesStr} {secondsStr} remaining</span>)
    }

    function renderTorrentStatus () {
      let status
      if (torrentSummary.status === 'paused') {
        if (!torrentSummary.progress) status = ''
        else if (torrentSummary.progress.progress === 1) status = 'Not seeding'
        else status = 'Paused'
      } else if (torrentSummary.status === 'downloading') {
        if (!torrentSummary.progress) status = ''
        else if (!torrentSummary.progress.ready) status = 'Verifying'
        else status = 'Downloading'
      } else if (torrentSummary.status === 'seeding') {
        status = 'Seeding'
      } else { // torrentSummary.status is 'new' or something unexpected
        status = ''
      }
      return (<span key='torrent-status'>{status}</span>)
    }
  }

  // Download button toggles between torrenting (DL/seed) and paused
  // Play button starts streaming the torrent immediately, unpausing if needed
  renderTorrentButtons (torrentSummary) {
    const infoHash = torrentSummary.infoHash

    // Only show the play/dowload buttons for torrents that contain playable media
    let playButton, codeButton
    if (!torrentSummary.error && TorrentPlayer.isPlayableTorrentSummary(torrentSummary)) {
      codeButton = (
        <i
          key='code-button'
          title='iFrame Code'
          className='icon code'
          onClick={dispatcher('showCode', infoHash)}
        >
          iframe_code
        </i>
      )

      playButton = (
        <i
          key='play-button'
          title='Start streaming'
          className='icon play'
          onClick={dispatcher('playFile', infoHash)}
        >
          play_circle_outline
        </i>
      )
    }

    return (
      <div className='torrent-controls'>
        {codeButton}
        {playButton}
        <i
          key='delete-button'
          className='icon delete'
          title='Remove torrent'
          onClick={dispatcher('confirmDeleteTorrent', infoHash, false)}
        >
          close
        </i>
      </div>
    )
  }

  // Show files, per-file download status and play buttons, and so on
  renderTorrentDetails (torrentSummary) {
    let filesElement
    if (torrentSummary.error || !torrentSummary.files) {
      let message = ''
      if (torrentSummary.error === 'path-missing') {
        // Special case error: this torrent's download dir or file is missing
        message = 'Missing path: ' + TorrentSummary.getFileOrFolder(torrentSummary)
      } else if (torrentSummary.error) {
        // General error for this torrent: just show the message
        message = torrentSummary.error.message || torrentSummary.error
      } else if (torrentSummary.status === 'paused') {
        // No file info, no infohash, and we're not trying to download from the DHT
        message = 'Failed to load torrent info. Click the download button to try again...'
      } else {
        // No file info, no infohash, trying to load from the DHT
        message = 'Downloading torrent info...'
      }
      filesElement = (
        <div key='files' className='files warning'>
          {message}
        </div>
      )
    } else {
      // We do know the files. List them and show download stats for each one
      const fileRows = torrentSummary.files
        .filter((file) => !file.path.includes('/.____padding_file/'))
        .map((file, index) => ({ file, index }))
        .map((object) => this.renderFileRow(torrentSummary, object.file, object.index))

      filesElement = (
        <div key='files' className='files'>
          <table>
            <tbody>
              {fileRows}
            </tbody>
          </table>
        </div>
      )
    }

    return (
      <div key='details' className='torrent-details'>
        {filesElement}
      </div>
    )
  }

  // Show a single torrentSummary file in the details view for a single torrent
  renderFileRow (torrentSummary, file, index) {
    // First, find out how much of the file we've downloaded
    // Are we even torrenting it?
    const isSelected = torrentSummary.selections && torrentSummary.selections[index]
    let isDone = false // Are we finished torrenting it?
    let progress = ''
    if (torrentSummary.progress && torrentSummary.progress.files &&
        torrentSummary.progress.files[index]) {
      const fileProg = torrentSummary.progress.files[index]
      isDone = fileProg.numPiecesPresent === fileProg.numPieces
      progress = Math.floor(100 * fileProg.numPiecesPresent / fileProg.numPieces) + '%'
    }

    // Second, for media files where we saved our position, show how far we got
    let positionElem
    if (file.currentTime) {
      // Radial progress bar. 0% = start from 0:00, 270% = 3/4 of the way thru
      positionElem = this.renderRadialProgressBar(file.currentTime / file.duration)
    }

    // Finally, render the file as a table row
    const isPlayable = TorrentPlayer.isPlayable(file)
    const infoHash = torrentSummary.infoHash
    let icon
    let handleClick
    if (isPlayable) {
      icon = 'play_arrow' /* playable? add option to play */
      handleClick = dispatcher('playFile', infoHash, index)
    } else {
      icon = 'description' /* file icon, opens in OS default app */
      handleClick = isDone
        ? dispatcher('openItem', infoHash, index)
        : (e) => e.stopPropagation() // noop if file is not ready
    }
    // TODO: add a css 'disabled' class to indicate that a file cannot be opened/streamed
    let rowClass = ''
    if (!isSelected) rowClass = 'disabled' // File deselected, not being torrented
    if (!isDone && !isPlayable) rowClass = 'disabled' // Can't open yet, can't stream
    return (
      <tr key={index} onClick={handleClick}>
        <td className={'col-icon ' + rowClass}>
          {positionElem}
          <i className='icon'>{icon}</i>
        </td>
        <td className={'col-name ' + rowClass}>
          {file.name}
        </td>
        <td className={'col-progress ' + rowClass}>
          {isSelected ? progress : ''}
        </td>
        <td className={'col-size ' + rowClass}>
          {prettyBytes(file.length)}
        </td>
        <td
          className='col-select'
          onClick={dispatcher('toggleTorrentFile', infoHash, index)}
        >
          <i className='icon deselect-file'>{isSelected ? 'close' : 'add'}</i>
        </td>
      </tr>
    )
  }

  renderRadialProgressBar (fraction, cssClass) {
    const rotation = 360 * fraction
    const transformFill = { transform: 'rotate(' + (rotation / 2) + 'deg)' }
    const transformFix = { transform: 'rotate(' + rotation + 'deg)' }

    return (
      <div key='radial-progress' className={'radial-progress ' + cssClass}>
        <div className='circle'>
          <div className='mask full' style={transformFill}>
            <div className='fill' style={transformFill} />
          </div>
          <div className='mask half'>
            <div className='fill' style={transformFill} />
            <div className='fill fix' style={transformFix} />
          </div>
        </div>
        <div className='inset' />
      </div>
    )
  }

  renderLoadingOverlay() {
	const style = { backgroundImage: cssBackgroundImageDarkGradient() }

    return (
	  <div key='overlay' className='media-overlay-background' style={style}>
		<div className='media-overlay'>
		  <div key='loading' className='media-stalled'>
			<div key='loading-spinner' className='loading-spinner' />
		  </div>
		</div>
	  </div>
	)
  }
}

function cssBackgroundImageDarkGradient () {
  return 'radial-gradient(circle at center, ' + 'rgba(0,0,0,0.4) 0%, rgba(0,0,0,1) 100%)'
}

function stopPropagation (e) {
  e.stopPropagation()
}

function getErrorMessage (torrentSummary) {
  const err = torrentSummary.error
  if (err === 'path-missing') {
    return (
      <span key='path-missing'>
        Path missing.<br />
        Fix and restart the app, or delete the torrent.
      </span>
    )
  }
  return 'Error'
}
