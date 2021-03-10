let authorRequirementTable = {
    private: {
        r: true,
        w: true
    },
    protected: {
        r: false,
        w: true
    },
    public: {
        r: false,
        w: false
    }
};

export let fullfillRequirement = (object, author, requiredPermission) => {
    if (!object || !author) {
        return false;
    }

    if (author.role === 'manager') {
        return true;
    }

    if (authorRequirementTable[object.permission][requiredPermission] === false) {
        return true;
    }

    //author requirement
    return isAuthorOrGroupMember(object, author);
};

export let isAuthorOrGroupMember = (object, author) => {
    return isAuthor(object, author) || isGroupMember(object, author);
};

export let isAuthor = (object, author) => {
    return object.authors.includes(author._id)
};

export let isGroupMember = (object, author) => {
    if (!object._groupMembers) {
        return false;
    }
    return object._groupMembers.includes(author._id)    
};

export let isManager = function(author) {
    if (!author) {
        return false;
    }
    return author.role === 'manager';
};

export let isEditable = (object, author) => {
    return fullfillRequirement(object, author, 'w')
};