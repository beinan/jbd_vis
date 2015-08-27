import React from 'react'

import SimulationAction from '../../actions/simulation_action'

const HEAD_PADDING = 10;
const HEAD_BOX_STYLE = {fill:'gray' ,stroke:'black', strokeWidth:2 ,opacity:0.5};
const THREAD_RECT_WIDTH = 20;
//draw actor head box
class ActorHead extends React.Component{ 
  constructor(props){
    super(props);
    this.state = {head_box_style: HEAD_BOX_STYLE};
  //  this._onChange = this._onChange.bind(this);
    
  }
  componentDidMount(){
    //calculate the position and size of the head box
    var b_box = this.refs.text.getDOMNode().getBBox();
    //console.log("bbox", b_box);
    this.props.actor_data.rendering_data = {
      
      x_center: b_box.x + b_box.width / 2,
      head_box:{
        width: b_box.width + 2 * HEAD_PADDING,
        height: b_box.height + 2 * HEAD_PADDING,
        x: b_box.x - HEAD_PADDING,
        y: b_box.y - HEAD_PADDING
      }
    }; 
    SimulationAction.actorDidMounted(this.props.actor_data);
    
    
  }
  
  render(){
    //console.log("ActorHead is rendering", this.props, this.state);
    var head_box;
    if(this.props.actor_data.rendering_data){
      var box = this.props.actor_data.rendering_data.head_box;
      head_box = <rect height={box.height} width={box.width} x={box.x} y={box.y}
                 style={this.state.head_box_style} rx={HEAD_PADDING/2} yx={HEAD_PADDING/2}> </rect>
    }
    return(
      <g>
        <text ref="text" x={0} y={50}>{this.props.title}</text>
        {head_box}
      </g>
    );
  }
 
}

class Actor extends React.Component{
  constructor(props){
    super(props);
    this.state = {};
//this.props;
  //  this._onChange = this._onChange.bind(this);
  }
  
  render(){
    //console.log("Actor is rendering", this.props, this.state);
    var x = 0;
    var thread_rects = [];
    if(this.props.actor_data.rendering_data){
      x = this.props.actor_data.rendering_data.position_x;
      var center_x = this.props.actor_data.rendering_data.x_center;
      var thread_ids = Object.keys(this.props.actor_data.threads);
      for(var i in thread_ids){
        console.log(i, thread_ids[i], center_x);
        var thread_id = thread_ids[i];
        var offset = (i - thread_ids.length/2 + 0.5) * THREAD_RECT_WIDTH;
        this.props.actor_data.threads[thread_id].center_x = center_x + offset;
        var head_box = this.props.actor_data.rendering_data.head_box;
        var head_bottom = head_box.height + head_box.y
        thread_rects.push(<rect key={"thread_rect"+i} width={THREAD_RECT_WIDTH} height={this.props.actor_data.rendering_data.height} 
                                x={center_x+offset - THREAD_RECT_WIDTH/2} y={head_bottom} 
                                style={{fill:(i%2?"#E9967A":"#8FBC8F"), opacity:0.35}}/>);
      }
    }
    return(
      <g transform={"translate(" + x +")"}>
        <ActorHead title={this.props.actor_data.owner} actor_data={this.props.actor_data}/>
        {thread_rects}
      </g>
    );
  }
}

export default Actor;
