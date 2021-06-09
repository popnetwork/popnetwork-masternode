const React = require('react')

module.exports = class CustomButton extends React.Component {
  render () {
    const { label, onOk, style, img } = this.props
    return (
      <div className="custom-botton" onClick={onOk} style={style}>
        {img && <img src={img} style={{ marginRight: 10 }} />}
        <span>{label}</span>
      </div>
    )
  }
}