import React from 'react';

export const VideoInput = (props)=>{
    const inputRef = React.useRef(undefined)
    const [urlCheck,setUrlCheck] = React.useState(false)
    const { updateState } = props;

    const onClick = ()=>{
        updateState({ videoUrl:inputRef.current.value });
    };

    const onChange = (e)=>{
        const checkStr = e.target.value
        const result = /^https?:\/\/[\w!?/+\-_~;.,*&@#$%()'[\]]+/.test(checkStr)
        setUrlCheck(result)
    };

    return (
        <ol className="video_input">
            <li className="flex_row">
                <input type="url" ref={inputRef} style={{'width':'100%'}}
                onChange={onChange} value="https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4"/>
            </li>
            <li className="flex_row">
                <button onClick={onClick} style={{'width':'100%'}}
                    className="harmovis_button">{urlCheck?'Set URL':'Please enter URL'}</button>
            </li>
        </ol>
    );
}
