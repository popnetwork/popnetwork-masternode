const React = require('react')

module.exports = class CustomButton extends React.Component {
  render () {
    const { label, onClick, style, className, img, hoverImg } = this.props
    return (
      <div className={`custom-button ${className}`} onClick={onClick} style={style}>
        {img && <img src={img} draggable="false" className={`${hoverImg ? 'normal' : null}`} />}
        {hoverImg && <img src={hoverImg} className="hover" />}
        <span>{label}</span>
      </div>
    )
  }
}