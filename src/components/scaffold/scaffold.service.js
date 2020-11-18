
const newScaffoldTag = (supportId, title, isTemplate, addHyphen) => (initText) => {

    let supportContentId = new Date().getTime().toString();
    var contentTagStr = '<span id="' + supportContentId + '"></span>';
    var text = contentTagStr + initText;
    if (addHyphen) {
        text = ' -&nbsp;' + text + '&nbsp;- ';
    }

    var tag = '';
    tag = tag + '<br>';
    tag = tag + '&nbsp;&nbsp;'; //important for mce
    if (!isTemplate) {
        tag = tag + '<span id="' + supportId + '" class="KFSupportStart mceNonEditable">';
    } else {
        tag = tag + '<span id="' + supportId + '" class="KFSupportStart KFTemplateStart mceNonEditable">';
    }
    tag = tag + createScaffoldStartTag(title, isTemplate);
    tag = tag + '</span>';
    if (isTemplate) {
        tag = tag + '<p class="kfTemplateContent">';
        tag = tag + '<br><br><br><br>';
    }
    tag = tag + text;
    if (isTemplate) {
        tag = tag + '</p>';
    }
    if (!isTemplate) {
        tag = tag + '<span id="' + supportId + '" class="KFSupportEnd mceNonEditable">';
    } else {
        tag = tag + '<span id="' + supportId + '" class="KFSupportEnd KFTemplateEnd mceNonEditable">';
    }
    tag = tag + createScaffoldEndTag(isTemplate);
    tag = tag + '</span>';
    tag = tag + '&nbsp;&nbsp;'; //important for mce
    tag = tag + '<br>';
    return {tag, supportContentId};
};

const createNewScaffoldTag = function(supportId, title, text, isTemplate) {
    var tag = '';
    tag = tag + '<br>';
    tag = tag + '&nbsp;&nbsp;'; //important for mce
    if (!isTemplate) {
        tag = tag + '<span id="' + supportId + '" class="KFSupportStart mceNonEditable">';
    } else {
        tag = tag + '<span id="' + supportId + '" class="KFSupportStart KFTemplateStart mceNonEditable">';
    }
    tag = tag + createScaffoldStartTag(title, isTemplate);
    tag = tag + '</span>';
    if (isTemplate) {
        tag = tag + '<p class="kfTemplateContent">';
        tag = tag + '<br><br><br><br>';
    }
    tag = tag + text;
    if (isTemplate) {
        tag = tag + '</p>';
    }
    if (!isTemplate) {
        tag = tag + '<span id="' + supportId + '" class="KFSupportEnd mceNonEditable">';
    } else {
        tag = tag + '<span id="' + supportId + '" class="KFSupportEnd KFTemplateEnd mceNonEditable">';
    }
    tag = tag + createScaffoldEndTag(isTemplate);
    tag = tag + '</span>';
    tag = tag + '&nbsp;&nbsp;'; //important for mce
    tag = tag + '<br>';
    return tag;
};


const createScaffoldStartTag = function(title, isTemplate) {
    var tag = '';
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

const createScaffoldEndTag = function(isTemplate) {
    var tag = '';
    tag = tag + ' '; //important for mce
    if (!isTemplate) {
        tag = tag + '<span class="kfSupportEndMark"> &nbsp; </span>';
    } else {
        tag = tag + '<span class="kfSupportEndMark kfTemplateEndMark"> &nbsp; </span>';
    }
    tag = tag + ' '; //important for mce
    return tag;
};

export default { createNewScaffoldTag, newScaffoldTag }
