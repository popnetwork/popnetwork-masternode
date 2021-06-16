const React = require('react')

const config = require('../../config')
const { clipboard } = require('electron')

const CustomButton = require('./custom-button')
const TextField = require('material-ui/TextField').default
const { dispatch, dispatcher } = require('../lib/dispatcher')

module.exports = class CreateIframCodeModal extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      iframeContent: null,
    }

    this.handleCopy = this.handleCopy.bind(this); 
  }

  componentDidMount() {
    // infoHash
    const state = this.props.state
    const { infoHash } = state.modal
    
    // magnetURI
    // const torrentSummary = TorrentSummary.getByKey(state, infoHash);
    // const magnetURI = encodeURIComponent(torrentSummary.magnetURI);
    // const infoHash = encodeURIComponent(torrentSummary.infoHash);

    // iframe Content
    const iframeContent = `<iframe src="${config.HOME_PAGE_SHORTENED_URL}/i/?hash=${infoHash}"></iframe>`;

    this.setState({ iframeContent });
  }

  handleCopy() {
    let {iframeContent} = this.state;
    if (!iframeContent)
      return;
  
    clipboard.writeText(iframeContent.trim());
  }

  render () {
    const { iframeContent } = this.state

    return (
      <div className='custom-modal create-magnet-modal'>
        <div className="close-btn" onClick={dispatcher('exitModal')}>
          <img src={`${config.STATIC_PATH}/Close.png`} />
        </div>
        <div className="icon-wrapper">
          <img src={`${config.STATIC_PATH}/Light.png`} />
        </div>
        <span className='content-title'>iFrame Code</span>
        <div className='gray-title'>If you want to upload a video file using iFrame, just copy the code in the </div>
        <div className='gray-title'>box below</div>
        <div className="input-wrapper">
          <TextField
            placeholder="Paste here"
            value={iframeContent}
            underlineShow={false}
            fullWidth
            inputStyle={{ width: '440px', borderRadius: '12px', background: '#1F202A', border: '1px solid #2A2D3B', padding: '4px 20px', color: '#ffffff' }}
          />
        </div>
        <div className="button-container">
          <CustomButton
            label="Cancel"
            onClick={dispatcher('exitModal')}
            style={{ background: '#1F202A', boxShadow: '0px 50px 94px #0A0D11', width: 170, height: 52, marginRight: 25 }}
          />
          <CustomButton
            label="Copy"
            onClick={this.handleCopy}
            style={{ background: `${!iframeContent ? '#323443' : '#B169F6'}`, boxShadow: '0px 50px 94px #0A0D11', width: 170, height: 52 }}
          />
        </div>
      </div>
    )
  }
}
