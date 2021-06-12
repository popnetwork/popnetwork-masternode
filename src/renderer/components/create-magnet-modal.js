const React = require('react')

const config = require('../../config')

const CustomButton = require('../components/custom-button')
const TextField = require('material-ui/TextField').default
const { dispatch, dispatcher } = require('../lib/dispatcher')
const { isMagnetLink } = require('../lib/torrent-player')

module.exports = class CreateMagnetModal extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      value: ''
    }

    this.onMagnet = this.onMagnet.bind(this)
  }

  onMagnet() {
    const { value } = this.state
    if (!isMagnetLink(value))
      return

    dispatch('exitModal')
    dispatch('addTorrent', value)
  }

  render () {
    const { value } = this.state

    return (
      <div className='custom-modal create-magnet-modal'>
        <div className="close-btn" onClick={dispatcher('exitModal')}>
          <img src={`${config.STATIC_PATH}/Close.png`} />
        </div>
        <div className="icon-wrapper">
          <img src={`${config.STATIC_PATH}/Light.png`} />
        </div>
        <span className='content-title'>Enter Torrent address or magnet link</span>
        <div className='gray-title'>If you want to upload a torrent file using a torrent address or magnet link,</div>
        <div className='gray-title'>just paste it into the box below</div>
        <div className="input-wrapper">
          <TextField
            placeholder="Paste here"
            value={value}
            onChange={(event, newValue) => this.setState({ value: newValue })}
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
            label="Ok"
            onClick={this.onMagnet}
            style={{ background: `${!isMagnetLink(value) ? '#323443' : '#B169F6'}`, boxShadow: '0px 50px 94px #0A0D11', width: 170, height: 52 }}
          />
        </div>
      </div>
    )
  }
}
