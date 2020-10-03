const path = require('path')

const colors = require('material-ui/styles/colors')
const electron = require('electron')
const React = require('react')
const PropTypes = require('prop-types')

const remote = electron.remote

const RaisedButton = require('material-ui/RaisedButton').default
const TextField = require('material-ui/TextField').default

// Lets you pick a file or directory.
// Uses the system Open File dialog.
// You can't edit the text field directly.
class StaticValue extends React.Component {
  static propTypes () {
    return {
      className: PropTypes.string,
      dialog: PropTypes.object,
      id: PropTypes.string,
      staticText: PropTypes.string.isRequired,
      value: PropTypes.string,
      fontSize: PropTypes.integer
    }
  }

  constructor (props) {
    super(props)
  }

  render () {
    const wrapperStyle = {      
      fontSize: this.props.fontSize || 14,
      padding: 20
    }

    const labelStyle = {
      float: 'left',
      clear: 'left'
    }
    const valueStyle = {
      float: 'right'
    }

    return (
      <div className={this.props.className} >
        
        <div style={wrapperStyle}>
          <div className='label' style={labelStyle}>
          {this.props.staticText}:
          </div>
          <div className='value' style={valueStyle}>
          {this.props.value}
          </div>
        </div>
      </div>
    )
  }
}

module.exports = StaticValue
