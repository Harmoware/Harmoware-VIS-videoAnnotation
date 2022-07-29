import React from 'react';
import { PointCloudLayer, SimpleMeshLayer, LineLayer } from 'deck.gl';
import {
  Container, connectToHarmowareVis, HarmoVisLayers, FpsDisplay
} from 'harmoware-vis';
import Controller from '../components';
import VideoAnnotationLayer from '../layers/video-annotation-layer';

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN; //Acquire Mapbox accesstoken

class App extends Container {
  constructor(props) {
    super(props);
    this.state = {
      popup: [0, 0, ''],
      objFileName: '',
      objFileData: null,
      position:[136.906428,35.181453,0],
      getColor:[255,255,255,255],
      getOrientation:[0,0,90],
      opacity: 0.1,
      currentTime: 0,
      videoUrl: undefined,
      truckBeathData: null,
      beathDataArray: null,
    };
    this.videoRef = React.createRef()
    this.currentTime = 0
  }

  componentDidMount(){
    super.componentDidMount();
    const { actions } = this.props;
    const { position } = this.state;
    actions.setInitialViewChange(false);
    actions.setSecPerHour(3600);
    actions.setLeading(0);
    actions.setTrailing(0);
    actions.setAnimatePause(true);
    actions.setDefaultViewport({defaultZoom:20.6,defaultPitch:30});
    actions.setViewport({longitude:position[0],latitude:position[1],maxZoom:25,maxPitch:180,pitch:0});
    if(this.videoRef.current && this.videoRef.current.player){
      /*this.videoRef.current.player.on("timeupdate",()=>{
        this.props.actions.setTime(this.videoRef.current.player.currentTime)
      })*/
      this.videoRef.current.player.on("playing",()=>{
        this.props.actions.setTimeBegin(0)
        this.props.actions.setTimeLength(this.videoRef.current.player.duration)
      })
      this.videoRef.current.player.on("error",(error)=>{
        console.log({error})
      })
    }
  }

  componentDidUpdate(){
    if(Math.abs(this.currentTime - this.videoRef.current.player.currentTime) >= (1/60)){
      this.currentTime = this.videoRef.current.player.currentTime
      this.props.actions.setTime(this.currentTime)
    }
  }

  updateState(updateData){
    this.setState(updateData);
  }

  updateCanvas(context,width,height,truckBeathData){
    const clientHeight = 250
    const start_x = 150
    const framecount = truckBeathData!==null ? truckBeathData.length : 0
    const graphwidth = width-start_x-50
    const framePerPx = framecount>0 ? graphwidth/framecount:0
    const rateStart_y = clientHeight+20
    context.clearRect(0,0,width,height)
    context.strokeStyle = '#CCCCCC'
    context.fillStyle = '#CCCCCC'
    context.textAlign="left";
    context.textBaseline="top";
    context.font = '12px sans-serif'
    context.lineWidth = 1
    context.fillText(`beath use rate`,30,rateStart_y)
    context.strokeRect(start_x,rateStart_y,graphwidth,100)
    if(framecount>0){
      context.beginPath()
      for(let j=0; j<truckBeathData.length; j=j+100){
        context.moveTo(start_x+(j*framePerPx),rateStart_y-15)
        context.lineTo(start_x+(j*framePerPx),rateStart_y)
        context.fillText(`${j}`,start_x+(j*framePerPx)+2,rateStart_y-15)
      }
      context.stroke()
      context.strokeStyle = 'yellow'
      context.beginPath()
      for(let j=0; j<truckBeathData.length; j=j+1){
        const value = (truckBeathData[j].beathUseRete*100)-100
        if(j===0){
          context.moveTo(start_x+(j*framePerPx),rateStart_y-value)
        }else{
          context.lineTo(start_x+(j*framePerPx),rateStart_y-value)
        }
      }
      context.stroke()
      const operation = truckBeathData.map((data,idx)=>{
        const wk_x = start_x+(idx*framePerPx)
        const beathText = data.beathData.map((beathData,idx)=>{
          const condition = beathData===1 ? 'open' : beathData===2 ? 'close' :""
          return {fillText:{text:`${condition}`,x:wk_x+2,y:clientHeight+155+(idx*30)},fillStyle:"lime"}
        })
        return {...data,
          path:{coordinate:[[wk_x,rateStart_y-30],[wk_x,rateStart_y+565]],strokeStyle:"lime"},
          text:[{fillText:{text:`${data.frame}`,x:wk_x+2,y:rateStart_y-20},fillStyle:"lime"},
                {fillText:{text:`${(data.beathUseRete*100)|0}%`,x:wk_x+2,y:rateStart_y+112},fillStyle:"lime"},
                ...beathText]
        }
      })
      const movesbase = [{operation}]
      this.props.actions.setMovesBase(movesbase)
    }
    let beathCount = 15
    if(this.state.beathDataArray !== null){
      beathCount = this.state.beathDataArray.length
    }
    for(let i=0; i<beathCount; i=i+1){
      context.strokeStyle = '#CCCCCC'
      const start_y = clientHeight+140+(i*30)
      context.fillText(`beath no.${i+1}`,50,start_y)
      context.strokeRect(start_x,start_y,graphwidth,24)
      context.strokeStyle = 'red'
      if(this.state.beathDataArray !== null){
        const currentdata = this.state.beathDataArray[i]
        const dataLength = currentdata.length
        context.beginPath()
        for(let j=0; j<dataLength; j=j+1){
          const value = (currentdata[j]*12)-24
          if(j===0){
            context.moveTo(start_x+(j*framePerPx),start_y-value)
          }else{
            context.lineTo(start_x+(j*framePerPx),start_y-value)
          }
        }
        context.stroke()
      }
    }
  }

  onHover(el) {
    if (el && el.object) {
      let disptext = '';
      const objctlist = Object.entries(el.object);
      for (let i = 0, lengthi = objctlist.length; i < lengthi; i=(i+1)|0) {
        const strvalue = objctlist[i][1].toString();
        disptext = disptext + (disptext.length > 0 ? '\n' : '');
        disptext = disptext + (`${objctlist[i][0]}: ${strvalue}`);
      }
      this.setState({ popup: [el.x, el.y, disptext] });
    } else {
      this.setState({ popup: [0, 0, ''] });
    }
  }

  getPointCloudLayer(PointCloudData){
    return PointCloudData.map((pointCloudElements, idx)=>{
      const {pointCloud} = pointCloudElements;
      const onHover = this.onHover.bind(this);
      return new PointCloudLayer({
        id: 'PointCloudLayer-' + String(idx),
        data: pointCloud,
        getColor: x => x.color || [0,255,0,128+x.position[3]*1.28],
        sizeUnits: 'meters',
        pointSize: 0.025,
        onHover
      });
    });
  }

  videoplay(){
    if(this.videoRef.current && this.videoRef.current.player){
      this.videoRef.current.player.play()
    }
  }
  videopause(){
    if(this.videoRef.current && this.videoRef.current.player){
      this.videoRef.current.player.pause()
    }
  }
  videorestart(){
    if(this.videoRef.current && this.videoRef.current.player){
      this.videoRef.current.player.restart()
      this.videoRef.current.player.play()
    }
  }

  render() {
    const { actions, viewport, movedData, movesbase } = this.props;
    const PointCloudData = movedData.filter(x=>x.pointCloud);
    const PathData = movedData
    const {beathUseRete,realtime,frame} = movedData.length>0 ? movedData[0] : {beathUseRete:0,realtime:0,frame:0}
    const { position } = this.state;
    const {paused=false,currentTime=0,duration=0} = this.videoRef.current ? this.videoRef.current.player :{}
    const {clientWidth=0,clientHeight=0} = this.videoRef.current ? this.videoRef.current.videoRef.current :{}

    return (
      <div>

        <Controller {...this.props} {...this.state} updateState={this.updateState.bind(this)} realtime={realtime}
          paused={paused ? true : false} videoControl={this.videoRef.current&&this.videoRef.current.player}
          videoplay={this.videoplay.bind(this)} videopause={this.videopause.bind(this)} videorestart={this.videorestart.bind(this)}/>

          <CanvasComponent className="videoannotationlayer" videoUrl={this.state.videoUrl}
            width={clientWidth} height={900} updateCanvas={this.updateCanvas.bind(this)} truckBeathData={this.state.truckBeathData}/>

          <VideoAnnotationLayer ref={this.videoRef}
          videoUrl={this.state.videoUrl}
          AnnotationPropsArray={[{data:PathData}]}/>

          {/*<div className="harmovis_area">
          <HarmoVisLayers
            mapStyle={null}
            viewport={viewport} actions={actions} visible={false}
            layers={[
                this.state.objFileData ?
                new SimpleMeshLayer({
                  id:'SimpleMeshLayer',
                  data:[{position}],
                  mesh:this.state.objFileData,
                  getColor:this.state.getColor,
                  getOrientation:this.state.getOrientation,
                  opacity:this.state.opacity,
                }):null,
                new LineLayer({
                  id:'LineLayer',
                  data: [
                    {sourcePosition:[position[0],position[1],10],targetPosition:[position[0],position[1],-10],color:[255,0,0,255]},
                    {sourcePosition:[position[0],position[1]+0.0001,0],targetPosition:[position[0],position[1]-0.0001,0],color:[0,255,0,255]},
                    {sourcePosition:[position[0]+0.0001,position[1],0],targetPosition:[position[0]-0.0001,position[1],0],color:[0,0,255,255]},
                  ],
                  widthUnits: 'meters',
                  getWidth: 0.025,
                  widthMinPixels: 0.1,
                  getColor: (x) => x.color || [255,255,255,255],
                  opacity: this.state.opacity,
                }),
                PointCloudData.length > 0 ? this.getPointCloudLayer(PointCloudData):null,
            ]}
          />
        </div>*/}
        <div className="harmovis_footer">
          {/*longitude:{viewport.longitude}&nbsp;
          latitude:{viewport.latitude}&nbsp;
          zoom:{viewport.zoom}&nbsp;
          bearing:{viewport.bearing}&nbsp;
          pitch:{viewport.pitch}&nbsp;*/}
          videoWidth:{clientWidth}&nbsp;
          videoHeight:{clientHeight}&nbsp;
          beathUseRete:{(beathUseRete*100)|0}%&nbsp;
          realtime:{realtime|0}&nbsp;
          frame:{frame}&nbsp;
          videoDuration:{duration ? duration : 0}&nbsp;
          videoTime:{currentTime ? currentTime : 0}&nbsp;
        </div>
        {/*<svg width={viewport.width} height={viewport.height} className="harmovis_overlay">
          <g fill="white" fontSize="12">
            {this.state.popup[2].length > 0 ?
              this.state.popup[2].split('\n').map((value, index) =>
                <text
                  x={this.state.popup[0] + 10} y={this.state.popup[1] + (index * 12)}
                  key={index.toString()}
                >{value}</text>) : null
            }
          </g>
        </svg>*/}
        <FpsDisplay />
      </div>
    );
  }
}
export default connectToHarmowareVis(App);

const CanvasComponent = (props)=>{
  const canvas = React.useRef(undefined);

  React.useEffect(()=>{
    if(canvas.current !== undefined){
      if(props.videoUrl){
        const context = canvas.current.getContext('2d');
        props.updateCanvas(context,props.width,props.height,props.truckBeathData);
      }
    }
  },[canvas,props.videoUrl,props.width,props.height,props.truckBeathData])

  const Result = React.useMemo(()=>
    <canvas ref={canvas} width={props.width} height={props.height} className={props.className}/>
  ,[props])

  return Result
}
