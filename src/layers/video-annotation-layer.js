import React from 'react';
import Plyr from 'plyr';

class VideoAnnotationLayer extends React.Component{
    constructor(props){
        super(props)
        this.videoRef = React.createRef()
        this.player = undefined
    }

    componentDidMount(){
        if(this.videoRef.current){
            if(this.player === undefined){
                this.player = new Plyr(this.videoRef.current,{controls:[]});
            }
        }
    }
    componentDidUpdate(prevProps){
        if(this.videoRef.current){
            if(this.player === undefined){
                this.player = new Plyr(this.videoRef.current,{controls:[]});
            }
        }
        if(prevProps.videoUrl !== this.props.videoUrl){
            if(this.player !== undefined){
                this.player.source = this.props.videoUrl
                this.player.restart()
            }
        }
    }

    render(){
        if(this.props.videoUrl){
            const videoWidth = this.videoRef.current ? this.videoRef.current.clientWidth:0
            const videoHeight = this.videoRef.current ? this.videoRef.current.clientHeight:0
            return (    
                <>
                <video ref={this.videoRef} className={this.props.className}
                    id={this.props.id} muted={this.props.muted} loop={this.props.loop}
                    autoPlay={this.props.autoPlay} controls={this.props.controls}
                    src={this.props.videoUrl}>
                    {/*<source src={this.props.videoUrl} />*/}
                </video>
                {this.props.AnnotationPropsArray.map((AnnotationProps,idx)=>
                    <AnnotationLayer key={idx} width={videoWidth} height={videoHeight}
                        className={AnnotationProps.className||this.props.className}
                        data={AnnotationProps.data}/>)}
                </>
            )
        }else{
            return (
                <video ref={this.videoRef} className={this.props.className}
                    id={this.props.id} muted={this.props.muted} >
                </video>
            )
        }
    }
}
VideoAnnotationLayer.defaultProps = {
    id:'#player',
    className:'videoannotationlayer',
    autoPlay: true,
    controls: false,
    muted: false,
    loop: false
}
export default VideoAnnotationLayer

const AnnotationLayer = (props)=>{
    const canvasRef = React.useRef(undefined)
    const [context,setcontext] = React.useState(undefined)

    React.useEffect(()=>{
        if(canvasRef.current !== undefined){
            const context = canvasRef.current.getContext('2d')
            setcontext(context)
        }
    },[canvasRef])

    React.useEffect(()=>{
        if(context !== undefined){
            updateCanvas(context,props.data,props.width,props.height)
        }
    },[context,props.data,props.width,props.height])

    return (
        <canvas className={props.className}
            ref={canvasRef} width={props.width} height={props.height} />
    )
}
AnnotationLayer.defaultProps = {
    width:0, height:0, data:[]
}

const updateCanvas = (context,annotationDataArray,canvasWidth,canvasHeight)=>{
    context.clearRect(0,0,canvasWidth,canvasHeight)
    for(let i=0; i<annotationDataArray.length; i=i+1){
        const annotationData = annotationDataArray[i]
        if(annotationData.path){
            const {coordinate,colorstr} = annotationData.path
            if(coordinate && Array.isArray(coordinate)){
                context.beginPath()
                for(let j=0; j<coordinate.length; j=j+1){
                    if(coordinate[j].length >=2 ){
                        if(j===0){
                            context.moveTo(coordinate[j][0],coordinate[j][1])
                        }else{
                            context.lineTo(coordinate[j][0],coordinate[j][1])
                        }
                    }
                }
                if(colorstr){
                    context.strokeStyle = colorstr
                }else{
                    context.strokeStyle = 'black'
                }
                context.stroke()
            }
        }else
        if(annotationData.polygon){
            const {coordinate,colorstr,strokecolorstr} = annotationData.polygon
            if(coordinate && Array.isArray(coordinate)){
                context.beginPath()
                for(let j=0; j<coordinate.length; j=j+1){
                    if(coordinate[j].length >=2 ){
                        if(j===0){
                            context.moveTo(coordinate[j][0],coordinate[j][1])
                        }else{
                            context.lineTo(coordinate[j][0],coordinate[j][1])
                        }
                    }
                }
                context.closePath()
                if(colorstr){
                    context.fillStyle = colorstr
                }else{
                    context.fillStyle = 'black'
                }
                context.fill()
                if(strokecolorstr){
                    context.strokeStyle = strokecolorstr
                    context.stroke()
                }else{
                    context.strokeStyle = 'black'
                }
            }
        }
    }
}