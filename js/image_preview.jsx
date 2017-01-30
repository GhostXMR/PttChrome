'use strict';

class ImagePreview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      left: 0,
      top: 0,
      spinning: !!this.props.src,
    };
  }

  componentDidMount() {
    this._mouseMoveListener = this._onMouseMove.bind(this);
    document.addEventListener('mousemove', this._mouseMoveListener);
  }

  componentWillUnmount() {
    if (this._mouseMoveListener) {
      document.removeEventListener('mousemove', this._mouseMoveListener);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.src != nextProps.src) {
      this.setState({spinning: !!nextProps.src});
    }
  }

  _onMouseMove(e) {
    this.setState({
      left: e.clientX,
      top: e.clientY
    });
  }

  _imageStyle() {
    if (!this._preview || this.props.src === '' || this.state.spinning) {
      return {'display': 'none'};
    }

    let mouseHeight = this.state.top;
    let curX = this.state.left;
    let pageHeight = $(window).height();
    let imageHeight = this._preview.clientHeight;
    let imgTop = 20;

    // opening image would pass the bottom of the page
    if (mouseHeight + imageHeight / 2 > pageHeight - 20) {
      if (imageHeight / 2 < mouseHeight) {
        imgTop = pageHeight - 20 - imageHeight;
      }
    } else if (mouseHeight - 20 > imageHeight / 2) {
      imgTop = mouseHeight - imageHeight / 2;
    }

    return {
      'display': this.state.spinning ? 'none' : 'block',
      'position': 'absolute',
      'left': (curX + 20) + 'px',
      'top': imgTop + 'px',
      'maxHeight': '80%',
      'maxWidth': '90%',
      'zIndex': 2
    };
  }

  _spinnerStyle() {
    if (!this.state.spinning) {
      return {'display': 'none'};
    }
    return {
      'position': 'absolute',
      'left': (this.state.left + 20) + 'px',
      'top': this.state.top + 'px',
      'zIndex': 2
    };
  }

  _stopSpinner() {
    this.setState({spinning: false});
  }

  _onImageLoaded() {
    this._stopSpinner();
    // Recalculate position.
    this.forceUpdate();
  }

  render() {
    return (
      <div>
        <img
            key="preview"
            ref={(img) => { this._preview = img; }}
            src={this.props.src}
            style={this._imageStyle()}
            onLoad={this._onImageLoaded.bind(this)}></img>
        <i 
            key="spinner"
            className="glyphicon glyphicon-refresh glyphicon-refresh-animate"
            style={this._spinnerStyle()}></i>
      </div>
    );
  }
}

class BaseAsyncImagePreview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {resolvedSrc: ''};
  }

  componentDidMount() {
    this._startFetch(this.props.src);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.src != nextProps.src) {
      this._startFetch(nextProps.src);
    }
  }

  _startFetch(src) {
    // Remove previous image.
    this.setState({resolvedSrc: ''});
    if (!src) {
      return;
    }
    let p = ImageURL.create(src);
    if (p) {
      let cb = (resolvedSrc) => {
        this._onResolve(resolvedSrc, src);
      };
      p.fetchSrc().then(cb);
    }
  }

  _onResolve(src, forSrc) {
    if (forSrc != this.props.src) {
      // Outdated result.
      return;
    }
    this.setState({resolvedSrc: src});
  }
}

class AsyncImagePreview extends BaseAsyncImagePreview {
  render() {
    return <ImagePreview src={this.state.resolvedSrc} />;
  }
}

function renderImagePreview(cont, src) {
  return ReactDOM.render(<AsyncImagePreview src={src} />, cont);
}

class HyperLinkPreview extends BaseAsyncImagePreview {
  render() {
    if (this.state.resolvedSrc) {
      return <img className="easyReadingImg hyperLinkPreview" src={this.state.resolvedSrc} />;
    } else {
      return <div />;
    }
  }
}
