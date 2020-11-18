import React from 'react';
import Dialog from '../dialog/Dialog.js'
import { connect } from 'react-redux'

class DrawDialog extends React.Component {

    constructor(props) {
        super(props);
        this.onConfirm = this.onConfirm.bind(this);
        this.onLoad = this.onLoad.bind(this);
        this.getIframeRef = this.getIframeRef.bind(this);
    }

    onConfirm(){
        var wnd1 = this.iframe_ref.contentWindow;
        var bg = wnd1.svgCanvas.current_drawing_.all_layers[0];
        var wnd2 = wnd1.svgCanvas.current_drawing_.all_layers[1];

        var widd = wnd2[1].getBBox().width;
        var heig = wnd2[1].getBBox().height;

        wnd1.svgCanvas.current_drawing_.svgElem_.setAttribute("width", widd);
        wnd1.svgCanvas.current_drawing_.svgElem_.setAttribute("height", heig);
        bg[1].childNodes[1].setAttribute("width", widd);
        bg[1].childNodes[1].setAttribute("height", heig);

        wnd1.svgCanvas.selectAllInCurrentLayer();
        wnd1.svgCanvas.groupSelectedElements();
        wnd1.svgCanvas.alignSelectedElements('l', 'page');
        wnd1.svgCanvas.alignSelectedElements('t', 'page');
        wnd1.svgCanvas.ungroupSelectedElement();
        wnd1.svgCanvas.clearSelection();

        wnd1.svgCanvas.current_drawing_.svgElem_.setAttribute("padding", '2em');
        wnd1.svgCanvas.setResolution('fit', 100);
        var svg = wnd1.svgCanvas.getSvgString();

        var canvas = document.createElement("canvas");

        canvas.width = widd + 4;
        canvas.height = heig + 4;

        var ctx = canvas.getContext("2d");

        var img = document.createElement("img");

        img.setAttribute("src", "data:image/svg+xml;base64," + btoa(svg));

        img.onload = function () {
            ctx.drawImage(img, 0, 0);
            var p = canvas.toDataURL("image/png");
            const drawing = "<img alt='" + svg + "' src='" + p + "'/>";

            this.props.onConfirm(drawing);
        }.bind(this);
    }

    getIframeRef(frame) {
        if(!frame) {
            return
        }
        this.iframe_ref = frame
    }

    onLoad(e){
        const svg = this.props.note.editSvg
        if (svg){
            e.target.contentWindow.svgCanvas.setSvgString(svg)
        }
    }

    render() {
        return (
            <Dialog
                title='DrawTool'
                style={{zIndex: 3000}}
                onClose={this.props.onClose}
                onConfirm={this.onConfirm}
                confirmButton='Add'>


                <iframe onLoad={this.onLoad} title='DrawingTool' src='/drawing-tool/svg/index.html' ref={this.getIframeRef} width='100%' height='100%'></iframe>
            </Dialog>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        note: state.notes[ownProps.noteId],
    }
}

/* const mapDispatchToProps = { editNote, openDrawDialog, removeDrawing, editSvgDialog} */

export default connect(
    mapStateToProps,
)(DrawDialog)
