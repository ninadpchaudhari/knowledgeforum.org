import React from 'react';
import ScaffoldSelect from '../scaffold/ScaffoldSelect'
import * as annotPlugins from './annotator.service'
import './annotator.css'
import store from '../../store/store';
import { Provider } from 'react-redux';
/*global $*/
class Annotator extends React.Component {

    constructor(props) {
        super(props)
        this.contentRef = React.createRef();
        this.annotatorInitialized = this.annotatorInitialized.bind(this)
        this.annotationCreated = this.annotationCreated.bind(this)
        this.annotationUpdated = this.annotationUpdated.bind(this)
        this.annotator = null

        this.displayEditor = this.displayEditor.bind(this)
        this.displayViewer = this.displayViewer.bind(this)
        this.fixPopupLocation = this.fixPopupLocation.bind(this)
        this.editorHidden = this.editorHidden.bind(this)
        this.loadAnnotations = this.loadAnnotations.bind(this)
        this.onScaffoldSelected = this.onScaffoldSelected.bind(this)
        this.dlg = null
    }

    componentDidMount() {
        const annotatedElem = $(this.contentRef.current)
        annotatedElem.annotator()
        this.scaffoldElem = (
            <Provider store={store}>
                <ScaffoldSelect initVal={0} onScaffoldSelected={this.onScaffoldSelected}/>
            </Provider>)

        annotPlugins.setKFPlugin(annotatedElem, {
            annotationCreated: this.annotationCreated,
            annotationUpdated: this.annotationUpdated,
            annotationDeleted: this.props.onDelete,
            displayEditor: this.displayEditor,
            displayViewer: this.displayViewer,
            annotatorInitialized: this.annotatorInitialized,
            editorHidden: this.editorHidden
        }, this.props.author.userName, this.scaffoldElem)
        this.dlg = $(`#contrib-dialog-${this.props.containerId}`)

    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.annotsFetched === 1 && this.props.annotsFetched !== prevProps.annotsFetched) {
            this.loadAnnotations()
        }
    }

    componentWillUnmount() {
        //Need to remove editor when closing dialog
        if (this.annotator && this.annotator.plugins.RichText.mceditor)
            this.annotator.plugins.RichText.mceditor.remove()
    }
    editorHidden(editor, annotation){
        $(editor.element.find(".annotator-controls")).off()
    }
    loadAnnotations(){
        const annotations = Object.values(this.props.annots).map((annot) => {
            const anno = Object.assign({}, annot.data)
            anno.ranges = [...anno.ranges]
            anno.highlights = [...anno.highlights]
            annotPlugins.m2vm(anno)
            return anno
        })
        this.annotator.loadAnnotations(annotations)
        this.props.onAnnotsLoaded()
    }
    annotatorInitialized(annotator){
        this.annotator = annotator
        this.loadAnnotations()

        var $element = $('div.annotator-adder');
        $element.attr('title', 'Annotation');
        $element.addClass('tooltip1');
        $element.append('<span class="tooltiptext">Annotation</span>');

        document.annotator = this.annotator
        const adder = annotator.adder.get(0)
        this.observer = new MutationObserver(function(mutationsList){
            for(let mutation of mutationsList) {
                if (mutation.type === 'attributes') {
                    //mutation.oldValue.startsWith("display: none") &&
                    if( adder.style.display !== 'none'){
                        this.fixPopupLocation(annotator.adder)
                        this.observer.takeRecords()
                        return
                    }
                }
            }
        }.bind(this));
        //TODO disconnect? when?
        this.observer.observe(adder, { attributes: true, attributeOldValue: true });
    }
    annotationCreated(annotation){
        this.props.onCreate(annotPlugins.vm2m(annotation))
    }
    annotationUpdated(annotation){
        this.props.onUpdate(annotPlugins.vm2m(annotation))
    }
    displayEditor(editor, annotation){
        /* $(editor.element.find(".annotator-controls")).off()*/
        if (!editor.element.hasClass(editor.classes.invert.y)) {
            editor.element.addClass(editor.classes.invert.y);
        }
    }
    fixPopupLocation(popup){
        const dlgOffset = this.dlg.offset()
        const ppOffset = popup.offset()
        popup.offset({top: ppOffset.top - dlgOffset.top, left: ppOffset.left - dlgOffset.left})
    }
    displayViewer(viewer, annotation){
        this.fixPopupLocation(viewer.element)
        viewer.element.addClass(viewer.classes.invert.y);
    }

    onScaffoldSelected(tagCreator, initialText) {
        const mceditor = this.annotator.plugins.RichText.mceditor
        const selected = mceditor.selection.getContent();
        let text = selected.length ? selected : initialText;
        const {tag, supportContentId} = tagCreator(text);
        mceditor.insertContent(tag)
        //select text after insert
        const contentTag = mceditor.dom.get(supportContentId);
        if (contentTag)
            mceditor.selection.setCursorLocation(contentTag)
    }

    render() {
        return (
            <div ref={this.contentRef}>
                <div dangerouslySetInnerHTML={{__html: this.props.content}}>
                </div>
            </div>
        )
    }

}

export default Annotator
