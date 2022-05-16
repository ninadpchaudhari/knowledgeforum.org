import React from 'react'
import { Editor } from '@tinymce/tinymce-react'
import Mark from '../../../node_modules/mark.js/dist/mark.min'
import tinymce from 'tinymce'
/* import './editor.css' */

class MCEditor extends React.Component {
  componentDidMount() {
    console.log(this.props)
  }
  componentDidUpdate() {
    const iframe = document.querySelector('iframe')
    if (iframe) {
      const innerDoc = iframe.contentDocument || iframe.contentWindow.document
      const context = innerDoc.querySelector('#tinymce')
      const instance = new Mark(context)
      console.log(tinymce.activeEditor)
      this.highlightTest(instance, context)
    }
  }
  highlightTest = (instance, context) => {
    const keywords = ['Thinking', 'Self Organization', 'Emergence', 'chaos', 'Design', 'Knowledge Creation',
    'Explanatory', 'Real, Authentic', 'Improvable Ideas', 'Idea Diversity', 
    'Epistemic Agency', 'Democratizing Knowledge']
    instance.unmark({
      done: () => {
        instance.mark(keywords)
        tinymce.activeEditor.selection.select(tinymce.activeEditor.getBody(), true)
        tinymce.activeEditor.selection.collapse(false)
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