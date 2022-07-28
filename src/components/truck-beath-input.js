import React from 'react';

export const TruckBeathInput = (props)=>{
    const { actions, id, videoFps, realFrameInterval } = props;

    const onSelect = (e)=>{
        const reader = new FileReader();
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        actions.setLoading(true);
        props.updateState({truckBeathData:null,beathDataArray:null})
        actions.setMovesBase([]);
        reader.readAsText(file);
        const file_name = file.name;
        reader.onload = () => {
            const linedata = reader.result.toString().split(/\r\n/);
            const readdata = linedata.map((lineArray)=>{
                return lineArray.split(',')
            })
            const titledata = readdata.shift()
            const dataLength = titledata.length
            const filterData = readdata.filter((data)=>data.length===dataLength)
            const ngData = filterData.find((data,idx)=>parseInt(data[0])!==idx)
            if(ngData!==undefined){
                window.alert('CSVデータのフレーム数が不正');
                console.log('CSVデータのフレーム数が不正')
                return
            }
            let beathDataArray = new Array(dataLength-1);
            const truckBeathData = filterData.map((data,idx)=>{
                const frame = parseInt(data[0])
                let beathData = []
                let beathUseCount = 0
                for(let i=0; i<data.length; i=i+1){
                    if(i>0){
                        const setData = parseInt(data[i]) 
                        beathData.push(setData)
                        if(idx===0){
                            beathDataArray[i-1] = []
                        }
                        beathDataArray[i-1].push(setData)
                        beathUseCount = beathUseCount + (setData>0 ? 1 : 0)
                    }
                }
                return {
                    frame:frame,
                    elapsedtime:(frame/videoFps),
                    realtime:(frame*realFrameInterval),
                    beathData:beathData,
                    beathUseRete:(beathUseCount/(data.length-1))
                }
            })
            beathDataArray.reverse()
            actions.setInputFilename({ truckBeathFileName: file_name });
            props.updateState({truckBeathData,beathDataArray})
            //actions.setMovesBase(readdata);
            actions.setAnimatePause(true);
            //actions.setTimeBegin(0)
            //actions.setTime(0)
            actions.setLoading(false);
        };
    };

    const onClick = (e)=>{
        actions.setInputFilename({ truckBeathFileName: null });
        props.updateState({truckBeathData:null,beathDataArray:null})
        actions.setMovesBase([]);
        e.target.value = '';
    };

    return (
        <input type="file" accept=".csv"
        id={id}
        onChange={onSelect}
        onClick={onClick}
        />
    );
}
