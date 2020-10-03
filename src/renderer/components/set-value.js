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
class SetValue extends React.Component {
  static propTypes () {
    return {
      className: PropTypes.string,
      dialog: PropTypes.object,
      id: PropTypes.string,
      onChange: PropTypes.func,
      title: PropTypes.string.isRequired,
      value: PropTypes.string,
      buttonName: PropTypes.string
    }
  }

  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    
  }

  render () {
    const id = this.props.staticText.replace(':', '').toLowerCase()
    const wrapperStyle = {
      alignItems: 'center',
      display: 'flex',
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

    return (
      <div className={this.props.className} >
        <div className='label' style={labelStyle}>
          {this.props.staticText} {this.props.amount} POP
        </div>
        <div style={wrapperStyle}>
          <TextField
            className='control' id={id} 
            inputStyle={textareaStyle} style={textFieldStyle} placeholder={this.props.placeHolder}
          />
          <RaisedButton
            className='control' label={this.props.buttonName} onClick={this.handleClick}
            style={buttonStyle}
          />
        </div>
      </div>
    )
  }
}

module.exports = SetValue
