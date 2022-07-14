import React from 'react';

export const AnnotationInput = (props)=>{
    const { actions, id } = props;

    const onSelect = (e)=>{
        const reader = new FileReader();
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        actions.setLoading(true);
        actions.setMovesBase([]);
        reader.readAsText(file);
        const file_name = file.name;
        reader.onload = () => {
            let readdata = null;
            try {
                readdata = JSON.parse(reader.result.toString());
            } catch (exception) {
                actions.setLoading(false);
                window.alert(exception);
                return;
            }
            actions.setInputFilename({ annotationFileName: file_name });
            actions.setMovesBase(readdata);
            actions.setAnimatePause(true);
            actions.setTimeBegin(0)
            actions.setTime(0)
            actions.setLoading(false);
        };
    };

    const onClick = (e)=>{
        actions.setInputFilename({ annotationFileName: null });
        actions.setMovesBase([]);
        e.target.value = '';
    };

    return (
        <input type="file" accept=".json"
        id={id}
        onChange={onSelect}
        onClick={onClick}
        />
    );
}
