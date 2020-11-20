import React from 'react';

class Iframe extends React.Component {

    constructor(props) {
        super(props);

        this.iframe_ref = null
        this.writeHTML = this.writeHTML.bind(this)
        this.onLoad = this.onLoad.bind(this)
    }
    writeHTML(frame){
        if(!frame) {
            return
        }
        this.iframe_ref = frame
    }

    onLoad(e){
        if (this.props.svg){
            e.target.contentWindow.svgCanvas.setSvgString(this.props.svg)
        }
    }

    render() {

        if (!this.props.source) {
            return <div>Loading...</div>;
        }

        const src = this.props.source;
        return (
                <iframe onLoad={this.onLoad} title={this.props.title} src={src} ref={this.writeHTML} width='100%' height='100%'></iframe>
        );
    }
};

export default Iframe;
