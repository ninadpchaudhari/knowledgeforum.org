import React from 'react';

const Properties = props => {

    const onPermissionChange = (evt) => {
        props.onChange({permission: evt.target.value})
    }
    //TODO
    const isTemplateChange = (evt) => {
        props.onChange({data: {isTemplate: evt.target.checked}})
    }

    return (
        <div className="m-2">
            <div>
                <label className='mt-1 font-weight-bold'>Permission:</label>
                <div>
                    <table className="KFPermission table table-sm">
                        <thead>
                            <tr>
                                <th>&nbsp;</th>
                                <th>Authors</th>
                                <th>Group Members</th>
                                <th>Others</th>
                            </tr>
                        </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <form action="">
                                                <div className="form-check form-check-inline">
                                                    <input className="form-check-input" type="radio" name='permission' value="private" id="contrib-permission1"
                                                           onChange={onPermissionChange} checked={props.contribution.permission === 'private'}
                                                    />
                                                        <label className="form-check-label font-weight-normal" htmlFor="contrib-permission1">
        &nbsp;private
                                                        </label>
                                                </div>
                                            </form>
                                        </td>
                                        <td>rw</td>
                                        <td>rw</td>
                                        <td>-</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <form action="">
                                                <div className="form-check form-check-inline">
                                                    <input className="form-check-input" type="radio" value="protected" id="contrib-permission2" name='permission'
                                                           onChange={onPermissionChange} checked={props.contribution.permission === 'protected'}
                                                    />
                                                        <label className="form-check-label font-weight-normal" htmlFor="contrib-permission2">
        &nbsp;protected
                                                        </label>
                                                </div>
                                            </form>
                                        </td>
                                        <td>rw</td>
                                        <td>rw</td>
                                        <td>r</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <form action="">
                                                <div className="form-check form-check-inline">
                                                    <input className="form-check-input" type="radio" value="public" id="contrib-permission3" name='public'
                                                           onChange={onPermissionChange} checked={props.contribution.permission === 'public'}
                                                    />
                                                        <label className="form-check-label font-weight-normal" htmlFor="contrib-permission3">
        &nbsp;public
                                                        </label>
                                                </div>
                                            </form>
                                        </td>
                                        <td>rw</td>
                                        <td>rw</td>
                                        <td>rw</td>
                                    </tr>
                                </tbody>
                    </table>
                </div>
                <label className="mt-1 font-weight-bold">Status:</label>
                <div className="ml-2">
                    {props.contribution.status}
                </div>
                <label className="mt-2 font-weight-bold">Template:</label>
                <form className="ml-2" action="">
                    <div className="form-check  form-check-inline">
                        <input className="form-check-input" type="checkbox" id="c-isTemplate" checked={props.contribution.data.isTemplate} onChange={isTemplateChange}/>

                            <label className="form-check-label font-weight-normal" htmlFor="c-isTemplate">
                                isTemplate
                            </label>
                    </div>
                </form>
            </div>
            {/* { props.contribution.type === 'Note' &&
                (<div>
                <label className="mt-1 mr-1 font-weight-bold">Riseabove:</label>
                {
                (props.contribution.type === 'Note' && props.contribution.data && props.contribution.data.riseabove && props.contribution.data.riseabove.viewId) ?

                "This note has riseabove view. Please look it at 'Read' tab."
                :

                <button type="submit" className="btn btn-primary btn-sm" onClick={makeRiseAbove()}>MakeRiseabove</button>
                }
                </div>)
                } */}
        </div>

    )
}

export default Properties
