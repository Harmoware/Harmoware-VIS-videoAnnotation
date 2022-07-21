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
      videoUrl: undefined
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
    if(Math.abs(this.currentTime - this.videoRef.current.player.currentTime) > 0.01){
      this.currentTime = this.videoRef.current.player.currentTime
      this.props.actions.setTime(this.currentTime)
    }
  }

  updateState(updateData){
    this.setState(updateData);
  }

  updateCanvas(context){
    if(this.videoRef.current && this.videoRef.current.player){
      const {videoWidth,videoHeight,currentTime} = this.videoRef.current.player
      context.clearRect(0,0,videoWidth,videoHeight)
      context.beginPath()
      context.strokeStyle = 'white'
      context.fillStyle = 'blue'
      context.rect(50,50,videoWidth/2,videoHeight/2)
      context.globalAlpha=0.5
      context.fill()
      context.globalAlpha=1
      context.lineWidth=10
      context.stroke()
      context.beginPath()
      context.strokeStyle = 'lime'
      context.font="30px Arial";
      context.lineWidth=1
      context.strokeText(`${currentTime}`,150,150)
      context.beginPath()
      context.strokeStyle = 'red'
      context.moveTo(100,100)
      context.arcTo(150,100,150,150,30)
      context.lineWidth=5
      context.stroke()
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
    const { position } = this.state;
    const {paused=false,currentTime=0,duration=0} = this.videoRef.current ? this.videoRef.current.player :{}

    return (
      <div>

        <Controller {...this.props} {...this.state} updateState={this.updateState.bind(this)}
          paused={paused ? true : false} videoControl={this.videoRef.current&&this.videoRef.current.player}
          videoplay={this.videoplay.bind(this)} videopause={this.videopause.bind(this)} videorestart={this.videorestart.bind(this)}/>

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
          currentTime:{currentTime ? currentTime : 0}&nbsp;
          duration:{duration ? duration : 0}&nbsp;
          paused:{paused !== undefined ? paused ? 'true' : 'false' : 'undefined'}
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
