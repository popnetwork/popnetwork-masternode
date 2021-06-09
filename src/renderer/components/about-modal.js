const React = require('react')

const config = require('../../config')

const { dispatch, dispatcher } = require('../lib/dispatcher')

module.exports = class AboutModal extends React.Component {
  render () {
    return (
      <div className='about-modal' onClick={dispatcher('exitModal')}>
        <div className="close-btn">
          <img src={`${config.STATIC_PATH}/Close.png`} />
        </div>
        <div className="icon-wrapper">
          <img src={`${config.STATIC_PATH}/Shield.png`} />
        </div>
        <span className='content-title'>POP Network</span>
        <span className="gray-title">{`Version ${require('../../../package.json').version} () ${process.arch === 'x64' ? '(64-bit)' : '(32-bit)'}`}</span>
      </div>
    )
  }
}
