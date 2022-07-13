import React from 'react';
import {OBJLoader} from '@loaders.gl/obj';
import {parse} from '@loaders.gl/core';

export const ObjectInput = (props)=>{
    const { actions, id, i18n, className, style, updateState } = props;

    const onSelect = (e)=>{
        const reader = new FileReader();
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        actions.setLoading(true);
        reader.readAsText(file);
        const objFileName = file.name;
        reader.onload = () => {
            const objFileData = parse(reader.result, OBJLoader);
            updateState({ objFileData, objFileName });
            actions.setLoading(false);
        };
    };

    const onClick = (e)=>{
        updateState({ objFileData:null, objFileName:'' });
        e.target.value = '';
    };

    return (
        <input type="file" accept=".obj"
        id={id} className={className} style={style}
        onChange={onSelect}
        onClick={onClick}
        />
    );
}
ObjectInput.defaultProps = {
    i18n: {
        formatError: 'データ形式不正'
    }
};
