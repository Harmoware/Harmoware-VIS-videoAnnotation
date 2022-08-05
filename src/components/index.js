import React from 'react';
import { MovesInput, PlayButton, PauseButton, ForwardButton, ReverseButton,
  AddMinutesButton, NavigationButton, ElapsedTimeValue, ElapsedTimeRange,
  SpeedValue, SpeedRange } from 'harmoware-vis';
import { ObjectInput } from './object-input.js';
import { AnnotationInput } from './annotation-input';
import { TruckBerthInput } from './truck-berth-input';
import { VideoInput } from './video-input';

const InputNumber = ({caption,value,step,min,max,onChange}) => {
  return(
    <>{caption}<input type="number" value={value} step={step} min={min} max={max}
      onChange={onChange} required className="harmovis_input_number"/></>
  );
};

export default class Controller extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      hiduke: null,
      speed:1,
      videoFps: 30,
      realFrameInterval: (26100/3196)
    }
  }

  updatePos(idx,e){
    const { position, updateState } = this.props;
    position[idx] = Number(e.target.value);
    updateState({position})
  }
  updateOri(idx,e){
    const { getOrientation, updateState } = this.props;
    getOrientation[idx] = Number(e.target.value);
    updateState({getOrientation})
  }
  setViewport() {
    const { objFileData, actions, position:[longitude, latitude] } = this.props;
    if(objFileData) actions.setViewport({longitude, latitude});
  }
  setTime(e){
    const { actions, videoControl } = this.props;
    if(videoControl){
      actions.setTime(+e.target.value);
      videoControl.currentTime = +e.target.value
    }
  }
  setSpeed(e){
    const { videoControl } = this.props;
    if(videoControl){
      const speed = +e.target.value
      this.setState({speed})
      videoControl.speed = speed
    }
  }
  setRealTime(e){
    if(e.target.value.length > 0){
      const hiduke = new Date(e.target.value)
      this.setState({hiduke})
    }else{
      this.setState({hiduke:null})
    }
  }

  render() {
    const { actions, inputFileName, truckBerthData, animateReverse, viewport, leading, objFileData, videoplay, videopause, videorestart, paused,
      settime, timeBegin, timeLength, secperhour, objFileName, position, getOrientation, updateState, videoControl, realtime } = this.props;
    const { movesFileName, annotationFileName, truckBerthFileName } = inputFileName;
    const {currentTime=0,duration=0} = videoControl ? videoControl :{}
    const framecount = truckBerthData!==null ? truckBerthData.length-1 : 1

    return (
        <div className="harmovis_controller">
            <ul className="flex_list">
            <li className="flex_column">
              <VideoInput updateState={updateState}/>
            </li>
            {/*<li className="flex_row">
                <div className="harmovis_input_button_column" title='3D object data selection'>
                <label htmlFor="ObjectInput">
                3D object data selection<ObjectInput actions={actions} id="ObjectInput" updateState={updateState}/>
                </label>
                <div>{objFileName}</div>
                </div>
            </li>*/}
            {/*<li className="flex_row">
                <div className="harmovis_input_button_column" title='3D object data selection'>
                <label htmlFor="AnnotationInput">
                Annotation Data Selection<AnnotationInput actions={actions} id="AnnotationInput"/>
                </label>
                <div>{annotationFileName}</div>
                </div>
            </li>*/}
            <li className="flex_row">
                <div className="harmovis_input_button_column" title='3D object data selection'>
                <label htmlFor="TruckBerthInput">
                TruckBerth Data Selection
                <TruckBerthInput actions={actions} id="TruckBerthInput" updateState={updateState}
                videoFps={this.state.videoFps} realFrameInterval={this.state.realFrameInterval}/>
                </label>
                <div>{truckBerthFileName}</div>
                </div>
            </li>
            <li className="flex_column">
              <label htmlFor="realtime">realtime (sec)</label>
                <input type="number" value={realtime|0} className='harmovis_input_number' disabled id="realtime"/>
            </li>
            <li className="flex_column">
              <label htmlFor="RealTimeInput">start realtime:</label>
                <input type="datetime-local" onChange={this.setRealTime.bind(this)} id="RealTimeInput"/>
            </li>
            <li className="flex_column">
              realtime&nbsp;:&nbsp;<SimulationDateTime hiduke={this.state.hiduke} realtime={realtime|0}/>
            </li>
            {/*<li className="flex_column">
              <ol><li className="flex_row">
              <InputNumber caption="longitude:" value={position[0]} step="0.0001" min="-180" max="180"
              onChange={this.updatePos.bind(this,0)}/>
              </li><li className="flex_row">
              <InputNumber caption="latitude:" value={position[1]} step="0.0001" min="-90" max="90"
              onChange={this.updatePos.bind(this,1)}/>
              </li><li className="flex_row">
              <InputNumber caption="altitude:" value={position[2]} step="0.1"
              onChange={this.updatePos.bind(this,2)}/>
              </li><li className="flex_row">
              <InputNumber caption="pitch:" value={getOrientation[0]} step="1" min="-180" max="180"
              onChange={this.updateOri.bind(this,0)}/>
              </li><li className="flex_row">
              <InputNumber caption="yaw:" value={getOrientation[1]} step="1" min="-180" max="180"
              onChange={this.updateOri.bind(this,1)}/>
              </li><li className="flex_row">
              <InputNumber caption="roll:" value={getOrientation[2]} step="1" min="-180" max="180"
              onChange={this.updateOri.bind(this,2)}/>
              </li></ol>
            </li>
            <li className="flex_row">
              <button onClick={this.setViewport.bind(this)} disabled={objFileData?false:true}
              className="harmovis_button" title='Move to object position'>Move to object position</button>
            </li>*/}
            {/*<li className="flex_row">
                <div className="harmovis_input_button_column" title='PointCloud data selection'>
                <label htmlFor="MovesInput">
                PointCloud data selection<MovesInput actions={actions} id="MovesInput"/>
                </label>
                <div>{movesFileName}</div>
                </div>
            </li>*/}
            {/*<li className="flex_row">
              {animatePause ?
                <PlayButton actions={actions} />:<PauseButton actions={actions} />
              }&nbsp;
              {animateReverse ?
                <ForwardButton actions={actions} />:<ReverseButton actions={actions} />
              }
            </li>
            <li className="flex_row">
              <AddMinutesButton addMinutes={-10} actions={actions} />&nbsp;
              <AddMinutesButton addMinutes={-5} actions={actions} />
            </li>
            <li className="flex_row">
              <AddMinutesButton addMinutes={5} actions={actions} />&nbsp;
              <AddMinutesButton addMinutes={10} actions={actions} />
            </li>
            <li className="flex_row">
              <NavigationButton buttonType="zoom-in" actions={actions} viewport={viewport} />&nbsp;
              <NavigationButton buttonType="zoom-out" actions={actions} viewport={viewport} />&nbsp;
              <NavigationButton buttonType="compass" actions={actions} viewport={viewport} />
            </li>*/}
            <li className="flex_column">
              <label htmlFor="ElapsedTimeRange">videoTime (sec)</label>
                <input type="number" value={currentTime|0} className='harmovis_input_number'
                  min={0} max={duration} onChange={this.setTime.bind(this)} />
            </li>
            <li className="flex_column">
              <input type="range" value={currentTime} min={0} max={duration} step={(duration/framecount)} style={{'width':'100%'}}
                onChange={this.setTime.bind(this)} className='harmovis_input_range' />
            </li>

            {/*<li className="flex_column">
              <label htmlFor="ElapsedTimeRange">elapsedTime
              <ElapsedTimeValue settime={settime} timeBegin={timeBegin} timeLength={timeLength} actions={actions}
              min={leading*-1} />
              sec</label>
              <ElapsedTimeRange settime={settime} timeLength={timeLength} timeBegin={timeBegin} actions={actions}
              min={leading*-1} id="ElapsedTimeRange" />
            </li>*/}
            {/*<li className="flex_column">
              <label htmlFor="SpeedRange">speed
              <SpeedValue secperhour={secperhour} actions={actions} />sec/hour</label>
              <SpeedRange secperhour={secperhour} actions={actions} id="SpeedRange" />
            </li>*/}
            <li className="flex_row">
              {paused ?
              <button onClick={videoplay} className="harmovis_button">play</button>:
              <button onClick={videopause} className="harmovis_button">pause</button>
              }
              <button onClick={videorestart} className="harmovis_button">restart</button>
            </li>
            <li className="flex_column">
              <span>speed&nbsp;</span>
              <input type="range" value={this.state.speed} min={0.1} max={1} step={0.1} style={{'width':'100%'}}
                onChange={this.setSpeed.bind(this)} className='harmovis_input_range' />
            </li>
            </ul>
        </div>
    );
  }
}

const SimulationDateTime = (props)=>{
  const { realtime, hiduke, locales, options, className } = props;
  let date = new Date();
  if(hiduke!==null){
    const unix_hiduke = hiduke.getTime()
    date = new Date((realtime * 1000) + unix_hiduke);
  }
  const dateString = date.toLocaleString(locales, options)

  return (
    <>
    {hiduke === null ? null:
    <span className={className}>
      {dateString}
    </span>}
    </>
  )
}
SimulationDateTime.defaultProps = {
  locales: 'ja-JP',
  options: { year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short' },
}
