const React = require('react')
const { clipboard } = require('electron')
const FlatButton = require('material-ui/FlatButton').default
const RaisedButton = require('material-ui/RaisedButton').default
const Heading = require('../components/heading')    
const { dispatcher } = require('../lib/dispatcher')
const TorrentSummary = require('../lib/torrent-summary')
const config = require('../../config')

class IframeCodePage extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      iframeContent: null,
    }

    this.handleCopy = this.handleCopy.bind(this);
    this.handlDragStart = this.handlDragStart.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
  }

  componentDidMount() {
    // infoHash
    const state = this.props.state
    const {infoHash} = state.location.current()
    
    // magnetURI
    const torrentSummary = TorrentSummary.getByKey(state, infoHash);
    // const magnetURI = encodeURIComponent(torrentSummary.magnetURI);
    // const infoHash = encodeURIComponent(torrentSummary.infoHash);

    // iframe Content
    const iframeContent = `
      <iframe src="${config.HOME_PAGE_SHORTENED_URL}/i/?hash=${infoHash}"></iframe>
    `;

    this.setState({ iframeContent });
  }

  handleCopy() {
    let {iframeContent} = this.state;
    if (!iframeContent)
      return;
  
    clipboard.writeText(iframeContent.trim());
  }
  
  handlDragStart(e) {
    e.preventDefault();
    return false;
  };

  handleDragOver(e) {
    e.preventDefault();
    return false;
  };  

  handleDrop(e) {
    e.preventDefault();
    return false;
  };

  render () {
    return (
      <div className='iframe-code-page'>
        <Heading level={1}>iFrame Code {this.state.defaultName}</Heading>

        <div 
          className='iframe-code'
          contentEditable={true}
          suppressContentEditableWarning={true}
          onDragStart={this.handlDragStart}
          onDragOver={this.handleDragOver}
          onDrop={this.handleDrop}
        >
          {this.state.iframeContent}
        </div>

        <div className='float-right'>
          <FlatButton
            className='control cancel'
            label='Cancel'
            style={{
              marginRight: 10
            }}
            onClick={dispatcher('cancel')}
          />
          <RaisedButton
            className='control copy-iframe-button'
            label='Copy'
            primary
            onClick={this.handleCopy}
          />
        </div>
      </div>
    )
  }
}

module.exports = IframeCodePage
