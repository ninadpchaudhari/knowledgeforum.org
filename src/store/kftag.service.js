import $ from 'jquery'
import {postLink, deleteLink} from './api.js'

//Count words inside scaffold labels
export const scaffoldWordCount = (text) => {
    const doc = '<div>' + text + '</div>';
    const jq = $(doc); //convert to jquery dom element
    let labels = jq.find('.kfSupportStartLabel')
    let numwords = 0;
    for (let i = 0; i< labels.length; i++){
        numwords += labels[i].innerHTML.split(' ').length
    }
    return numwords
}

const createScaffoldStartTag = (title, isTemplate) => {
    let tag = '';
    tag = tag + ' '; //important for mce
    if (!isTemplate) {
        tag = tag + '<span class="kfSupportStartMark"> &nbsp; </span>';
    } else {
        tag = tag + '<span class="kfSupportStartMark kfTemplateStartMark"> &nbsp; </span>';
    }
    tag = tag + ' '; //important for mce
    if (!isTemplate) {
        tag = tag + '<span class="kfSupportStartLabel">' + title + '</span>';
    } else {
        tag = tag + '<span class="kfSupportStartLabel kfTemplateStartLabel">' + title + '</span>';
    }
    tag = tag + ' '; //important for mce
    return tag;
};

const createScaffoldEndTag = (isTemplate) => {
    let tag = '';
    tag = tag + ' '; //important for mce
    if (!isTemplate) {
        tag = tag + '<span class="kfSupportEndMark"> &nbsp; </span>';
    } else {
        tag = tag + '<span class="kfSupportEndMark kfTemplateEndMark"> &nbsp; </span>';
    }
    tag = tag + ' '; //important for mce
    return tag;
};

const createReferenceTag = (contId, title, authors, text) => {
    const authorText = '(missing authors)'//TODO $community.makeAuthorStringByIds(authors);
    let tag = '';
    if (text && text.length > 0) {
        tag = tag + '<span class="KFReferenceQuote"><span>"</span><span class="KFReferenceText">' + text + '</span><span>"</span></span>';
    }
    tag = tag + '<span> (<a href="contribution/' + contId + '" target="' + contId + '">';
    tag = tag + '<img src="/manual_assets/kf4images/icon-note-unread-othr-.gif">"' + title + '"</a>';
    tag = tag + '<span class="KFReferenceAuthor"> by ' + authorText + '</span>)</span>';
    tag = tag + '</span>';
    return tag;
};

export const preProcess = (body, toConnections, fromConnections) => {
    const doc = '<div>' + body + '</div>';
    const jq = $(doc);

    const supportStart = jq.find('.KFSupportStart')
    supportStart.addClass('mceNonEditable');
    for (let i = 0; i < supportStart.length; i++) {
        const elem = supportStart[i]
        if (!elem.id.startsWith('supportid_')) {
            const isTemplate = $(elem).hasClass('KFTemplateStart');
            const ref = toConnections.filter((conn) => conn._id === elem.id)
            if (ref.length) {
                elem.innerHTML =createScaffoldStartTag(ref[0]._from.title, isTemplate);
            } else {
                if(toConnections !== 'Annotation'){
                    elem.innerHTML = createScaffoldStartTag('(missing link)', isTemplate);
                }
            }
        }
    }
    const supportEnd = jq.find('.KFSupportEnd')
    supportEnd.addClass('mceNonEditable');
    for (let i = 0; i < supportEnd.length; i++) {
        const elem = supportEnd[i]
        const isTemplate = $(elem).hasClass('KFTemplateEnd');
        elem.innerHTML = createScaffoldEndTag(isTemplate);
    }

    const references = jq.find('.KFReference')
    references.addClass('mceNonEditable');
    for (let i = 0; i < references.length; i++) {
        const elem = supportEnd[i]
        let ref = fromConnections.filter((conn) => conn._id === elem.id)
        if (ref.length) {
            ref = ref[0]
            let text = '';
            if (ref.data) {
                text = ref.data.text;
            }
            elem.innerHTML = createReferenceTag(ref.to, ref._to.title, ref._to.authors, text);
        } else {
            elem.innerHTML = createReferenceTag('', '(missing link)', '', '');
        }
    }
    return jq.html();
};

export const postProcess = async (text, contributionId, toConnections, fromConnections, handler) => {
    const doc = '<div>' + text + '</div>';
    const jq = $(doc); //convert to jquery dom element
    const endtags = {};
    const supportLinksIds = toConnections.filter((each) => each.type === 'supports')
          .map((each) => each._id) //get only toConnections of type = supports
    let supportStarts = jq.find('.KFSupportStart')
    const supportEnds = jq.find('.KFSupportEnd')
    const toCreate = []
    const supportStartsIds = []

    for (let i = 0; i < supportEnds.length; i++) {
        const elem = supportEnds[i]
        elem.innerHTML = '';
        var id = elem.id;
        endtags[id] = elem;
    }
    for (let i = 0; i < supportStarts.length; i++) {
        const elem = supportStarts[i]
        let supportId = elem.id;
        elem.innerHTML = '';
        if (supportId.startsWith('supportid_')) {
            supportId = supportId.split('_')[1];
        }
        supportStartsIds.push(supportId)
        if (!supportLinksIds.includes(supportId)) {//Is a new supportLink
            //promise to create link
            toCreate.push(postLink(supportId, contributionId, 'supports').then((link) => {
                //Replace id with id of new created link
                const oldId = elem.id;
                const newId = link._id;
                elem.id = newId;
                if (endtags[oldId]) {
                    endtags[oldId].id = newId;
                }
            }))
        }
    }
    const toDeleteSupports = supportLinksIds.filter((each) => !supportStartsIds.includes(each))
          .map((each) => deleteLink(each)) //Select toConnections that no longer appear in the tinymce text


    const referenceLinksIds = fromConnections.filter((each) => each.type === 'references').map((each) => each._id) //get only ids of fromConnections of type=references
    const kfReferences = jq.find('.KFReferenceText') //Get references dom elements
    const kfreferenceIds = []

    for (var i = 0; i < kfReferences.length; i++) {
        const elem = kfReferences[i]
        const data = {text:$(elem).find('.KFReferenceText').html()}
        elem.innerHTML = '';
        const referenceId = elem.id;
        kfreferenceIds.push(referenceId)
        if (!referenceLinksIds.includes(referenceId)) {//Is a new supportLink
            //promise to create link
            toCreate.push(postLink(contributionId, referenceId, 'references', data).then((link) => {
                //Replace id with id of new created link
                const oldId = elem.id;
                const newId = link._id;
                elem.id = newId;
                if (endtags[oldId]) {
                    endtags[oldId].id = newId;
                }
            }))
        }
    }

    const toDeleteReferences = referenceLinksIds.filter((each) => !kfreferenceIds.includes(each)).map((each) => deleteLink(each)) //Select fromConnections that no longer appear in the tinymce text

    await Promise.all(toDeleteSupports)
    await Promise.all(toDeleteReferences)
    await Promise.all(toCreate)
    return jq
}

