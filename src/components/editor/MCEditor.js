import React from 'react'
import { Editor } from '@tinymce/tinymce-react'
import Mark from '../../../node_modules/mark.js/dist/mark.min'
/* import './editor.css' */

class MCEditor extends React.Component {
  componentDidMount() {
    console.log(this.props)
  }
  componentDidUpdate() {
    const iframe = document.querySelector('iframe')
    const innerDoc = iframe.contentDocument || iframe.contentWindow.document
    const context = innerDoc.querySelector('#tinymce')
    const instance = new Mark(context)
    console.log(instance)
    this.highlightTest(instance, context)
  }
  highlightTest = (instance, context) => {
    const keywords = ['Thinking Fast and Slow', 'Self Organization', 'Emergence', 'Edge of chaos', 'Design Thinking', 'Knowledge Creation', 'Centralized Mindset',
    'Explanatory Coherence', 'Real Ideas, Authentic Problems', 'Improvable Ideas', 'Idea Diversity', 'Rise Above', 'Epistemic Agency',
    'Collective Responsibility for Community Knowledge', 'Democratizing Knowledge', 'Symmetric Knowledge Advancement', 'Pervasive Knowledge Building',
    'Constructive Uses of Authoritative Sources', 'Knowledge Building Discourse', 'Embedded, Concurrent and Transformative Assessment', 'Knowledge society']
    instance.unmark({
      done: () => {
        instance.mark(keywords)
        context.focus()
      },
    })
  }

  render() {
    return (
      <div>
        <Editor
          value={this.props.value}
          apiKey='arg05azt52qbujpnf831szuswhmyhoqute0q48btk5bqigoj'
          init={{
            setup: editor => {
              this.props.onEditorSetup(editor)
            },
            content_css: '/editor.css',
            height: 300,
            menubar: false,
            statusbar: false,
            media_live_embeds: true,
            plugins: ['advlist autolink lists link image charmap print preview anchor', 'searchreplace visualblocks code fullscreen', 'insertdatetime media table paste code wordcount media help'],
            external_plugins: {
              drawingTool: '/drawing-tool/plugin.min.js',
            },
            toolbar: 'styleselect | bold italic underline strikethrough | forecolor backcolor bullist numlist | link code | ltr rtl | charmap | drawingTool media',
          }}
          onEditorChange={this.props.onEditorChange}
        />
      </div>
    )
  }
}

export default MCEditor