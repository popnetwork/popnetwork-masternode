const React = require('react')

const config = require('../../config')

const CustomButton = require('./custom-button')
const TextField = require('material-ui/TextField').default
const { dispatch, dispatcher } = require('../lib/dispatcher')

module.exports = class DeleteTorrentModal extends React.Component {
  constructor(props) {
    super(props)

    this.onDeleteTorrent = this.onDeleteTorrent.bind(this)
  }

  onDeleteTorrent() {
    const state = this.props.state
    dispatch('deleteTorrent', state.modal.infoHash, state.modal.deleteData)
    dispatch('exitModal')
  }

  render () {
    return (
      <div className='custom-modal create-magnet-modal' style={{ width: 678 }}>
        <div className="close-btn" onClick={dispatcher('exitModal')}>
          <img src={`${config.STATIC_PATH}/Close.png`} />
        </div>
        <div className="icon-wrapper">
          <img src={`${config.STATIC_PATH}/ShieldFail.png`} />
        </div>
        <span className='content-title'>Are you sure to delete?</span>
        <div className='gray-title'>The video will be permanently deleted if you</div> 
        <div className='gray-title'>click "Yes"</div>
        <div className="button-container" style={{ marginTop: '50px' }}>
          <CustomButton
            label="Cancel"
            onClick={dispatcher('exitModal')}
            style={{ background: '#1F202A', boxShadow: '0px 50px 94px #0A0D11', width: 170, height: 52, marginRight: 25 }}
          />
          <CustomButton
            label="Yes"
            onClick={this.onDeleteTorrent}
            style={{ background: '#B169F6', boxShadow: '0px 50px 94px #0A0D11', width: 170, height: 52 }}
          />
        </div>
      </div>
    )
  }
}
