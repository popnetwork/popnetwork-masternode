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
      value: PropTypes.string
    }
  }

  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    
  }

  render () {
    const wrapperStyle = {
      
      width: '100%'
    }
    const labelStyle = {
      flex: '0 auto',
      marginRight: 10,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
    const textareaStyle = {
      color: colors.grey50
    }
    const textFieldStyle = {
      flex: '1'
    }
    let text = this.props.value || ''
    const buttonStyle = {
      marginLeft: 10,
      width: 100
    }
    const xxxLabelStyle = {
      float: 'left'
    }
    const xxxValueStyle = {
      float: 'right'
    }

    return (
      <div className={this.props.className} >
        
        <div style={wrapperStyle}>
          <div className='label xxx-label' style={xxxLabelStyle}>
          {this.props.staticText}:
          </div>
          <div className='label xxx-value' style={xxxValueStyle}>
          {this.props.value}
          </div>
        </div>
      </div>
    )
  }
}

module.exports = StaticValue
