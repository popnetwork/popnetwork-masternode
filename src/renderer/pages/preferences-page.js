const React = require('react')
const PropTypes = require('prop-types')

const colors = require('material-ui/styles/colors')
const CustomButton = require('../components/custom-button')
const Checkbox = require('material-ui/Checkbox').default
const RaisedButton = require('material-ui/RaisedButton').default
const Heading = require('../components/heading')
const PathSelector = require('../components/path-selector')

const { dispatch } = require('../lib/dispatcher')
const config = require('../../config')

class PreferencesPage extends React.Component {
  constructor (props) {
    super(props)

    this.handleDownloadPathChange =
      this.handleDownloadPathChange.bind(this)

    this.handleOpenExternalPlayerChange =
      this.handleOpenExternalPlayerChange.bind(this)

    this.handleExternalPlayerPathChange =
      this.handleExternalPlayerPathChange.bind(this)

    this.handleStartupChange =
      this.handleStartupChange.bind(this)

    this.handleSoundNotificationsChange =
      this.handleSoundNotificationsChange.bind(this)
  }

  downloadPathSelector () {
    return (
      <Preference>
        <PathSelector
          dialog={{
            title: 'Select download directory',
            properties: ['openDirectory']
          }}
          onChange={this.handleDownloadPathChange}
          title='Download location'
          value={this.props.state.saved.prefs.downloadPath}
        />
      </Preference>
    )
  }

  handleDownloadPathChange (filePath) {
    dispatch('updatePreferences', 'downloadPath', filePath)
  }

  openExternalPlayerCheckbox () {
    return (
      <Preference>
        <CustomCheckBox
          className='control'
          checked={!this.props.state.saved.prefs.openExternalPlayer}
          label='Play torrent media files using POP Network'
          onCheck={this.handleOpenExternalPlayerChange}
        />
      </Preference>
    )
  }

  handleOpenExternalPlayerChange (e, isChecked) {
    dispatch('updatePreferences', 'openExternalPlayer', !isChecked)
  }

  highestPlaybackPriorityCheckbox () {
    return (
      <Preference>
        <CustomCheckBox
          className='control'
          checked={this.props.state.saved.prefs.highestPlaybackPriority}
          label='Highest Playback Priority'
          onCheck={this.handleHighestPlaybackPriorityChange}
        />
        <div className="left-margin" style={{ fontSize: 12, color: '#9EA1C9', marginBottom: 0, }}>Pauses all active torrents to allow playback to use all of the available bandwidth.</div>
      </Preference>
    )
  }

  handleHighestPlaybackPriorityChange (e, isChecked) {
    dispatch('updatePreferences', 'highestPlaybackPriority', isChecked)
  }

  externalPlayerPathSelector () {
    const playerPath = this.props.state.saved.prefs.externalPlayerPath
    const playerName = this.props.state.getExternalPlayerName()

    const description = this.props.state.saved.prefs.openExternalPlayer
      ? `Torrent media files will always play in ${playerName}.`
      : `Torrent media files will play in ${playerName} if POP Network cannot play them.`

    return (
      <Preference>
        <div className="left-margin" style={{ fontSize: 12, color: '#9EA1C9', marginBottom: 2, }}>{description}</div>
        <PathSelector
          dialog={{
            title: 'Select media player app',
            properties: ['openFile']
          }}
          onChange={this.handleExternalPlayerPathChange}
          title='External player'
          value={playerPath}
          className="left-margin"
        />
      </Preference>
    )
  }

  handleExternalPlayerPathChange (filePath) {
    dispatch('updatePreferences', 'externalPlayerPath', filePath)
  }

  autoAddTorrentsCheckbox () {
    return (
      <Preference>
        <CustomCheckBox
          className='control'
          checked={this.props.state.saved.prefs.autoAddTorrents}
          label='Watch for new .torrent files and add them immediately'
          onCheck={(e, value) => { this.handleAutoAddTorrentsChange(e, value) }}
          style={{ marginTop: 20 }}
        />
      </Preference>
    )
  }

  handleAutoAddTorrentsChange (e, isChecked) {
    const torrentsFolderPath = this.props.state.saved.prefs.torrentsFolderPath
    if (isChecked && !torrentsFolderPath) {
      alert('Select a torrents folder first.') // eslint-disable-line
      e.preventDefault()
      return
    }

    dispatch('updatePreferences', 'autoAddTorrents', isChecked)

    if (isChecked) {
      dispatch('startFolderWatcher')
      return
    }

    dispatch('stopFolderWatcher')
  }

  torrentsFolderPathSelector () {
    const torrentsFolderPath = this.props.state.saved.prefs.torrentsFolderPath

    return (
      <Preference>
        <PathSelector
          dialog={{
            title: 'Select folder to watch for new torrents',
            properties: ['openDirectory']
          }}
          onChange={this.handleTorrentsFolderPathChange}
          title='Folder to watch'
          value={torrentsFolderPath}
          className="left-margin"
        />
      </Preference>
    )
  }

  handleTorrentsFolderPathChange (filePath) {
    dispatch('updatePreferences', 'torrentsFolderPath', filePath)
  }

  setDefaultAppButton () {
    const isFileHandler = this.props.state.saved.prefs.isFileHandler
    if (isFileHandler) {
      return (
        <Preference>
          <div style={{ fontSize: 12 }}>Popnetwork is your default torrent app. Hooray!</div>
        </Preference>
      )
    }
    return (
      <Preference>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12 }}>Popnetwork is not currently the default torrent app.</div>
          <CustomButton
            label="Make POP Network the default Torrent App"
            onClick={this.handleSetDefaultApp}
            style={{ background: 'transparent', fontSize: 12, border: '1px solid #9EA1C9', width: 257, height: 52, color: '#9EA1C9', marginLeft: 50, }}
          />
        </div>
      </Preference>
    )
  }

  handleStartupChange (e, isChecked) {
    dispatch('updatePreferences', 'startup', isChecked)
  }

  setStartupCheckbox () {
    if (config.IS_PORTABLE) {
      return
    }

    return (
      <Preference>
        <CustomCheckBox
          className='control'
          checked={this.props.state.saved.prefs.startup}
          label='Open popnetwork on startup'
          onCheck={this.handleStartupChange}
        />
      </Preference>
    )
  }

  soundNotificationsCheckbox () {
    return (
      <Preference>
        <CustomCheckBox
          className='control'
          checked={this.props.state.saved.prefs.soundNotifications}
          label='Enable sounds'
          onCheck={this.handleSoundNotificationsChange}
          style={{ marginTop: 20 }}
        />
      </Preference>
    )
  }

  handleSoundNotificationsChange (e, isChecked) {
    dispatch('updatePreferences', 'soundNotifications', isChecked)
  }

  handleSetDefaultApp () {
    dispatch('updatePreferences', 'isFileHandler', true)
  }

  render () {
    return (
      <div className="preference-page">
        <div className="content-title" style={{ marginBottom: 24 }}>Preferences</div>
        <PreferencesSection title='Folders'>
          {this.downloadPathSelector()}
          {this.autoAddTorrentsCheckbox()}
          {this.torrentsFolderPathSelector()}
        </PreferencesSection>
        <PreferencesSection title='Playback'>
          {this.openExternalPlayerCheckbox()}
          {this.externalPlayerPathSelector()}
          {this.highestPlaybackPriorityCheckbox()}
        </PreferencesSection>
        <PreferencesSection title='Default torrent app'>
          {this.setDefaultAppButton()}
        </PreferencesSection>
        <PreferencesSection title='General'>
          {this.setStartupCheckbox()}
          {this.soundNotificationsCheckbox()}
        </PreferencesSection>
      </div>
    )
  }
}

class PreferencesSection extends React.Component {
  static get propTypes () {
    return {
      title: PropTypes.string
    }
  }

  render () {
    return (
      <div className="item-wrapper">
        <div className="item-title">{this.props.title}</div>
        {this.props.children}
      </div>
    )
  }
}

class Preference extends React.Component {
  render () {
    const style = { marginBottom: 3 }
    return (<div style={style}>{this.props.children}</div>)
  }
}

class CustomCheckBox extends React.Component {
  render () {
    return (
      <div className="custom-checkbox-wrapper" style={this.props.style}>
        <div className="custom-checkbox" onClick={(event) => this.props.onCheck(event, !this.props.checked)}>
          <img src={`${config.STATIC_PATH}/${!this.props.checked ? 'Checkbox.png' : 'CheckboxActive.png' }`} draggable={false} />
        </div>
        <span className="check-label">{this.props.label}</span>
      </div>
    )
  }
}

module.exports = PreferencesPage
