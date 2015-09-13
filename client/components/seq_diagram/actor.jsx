import React from 'react'

import SimulationAction from '../../actions/simulation_action'
import {ImmutablePropComponent, PureRenderComponent} from '../common_components.jsx';
const HEAD_PADDING = 10;
const HEAD_BOX_STYLE = {fill:'gray' ,stroke:'black', strokeWidth:2 ,opacity:0.5};
const THREAD_RECT_WIDTH = 20;
//draw actor head box


class Actor extends PureRenderComponent{
  constructor(props){
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this);
    //this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
  }
  //shouldComponentUpdate(nextProps, nextState) {
    //var shallowEqual = require('shallow-equals')
    //console.log("should update:",shallowEqual(this.state, nextState), this.state, nextState);
    //return !shallowEqual(this.props, nextProps) ||
      //     !shallowEqual(this.state, nextState);
  //}
  componentDidMount(){
    //super.componentDidMount();
    //calculate the position and size of the head box
    super.componentDidMount();
    var b_box = this.refs.text.getDOMNode().getBBox();
      
    var head_box = {
      width: b_box.width + 2 * HEAD_PADDING,
      height: b_box.height + 2 * HEAD_PADDING,
      x: b_box.x - HEAD_PADDING,
      y: b_box.y - HEAD_PADDING
      
    }; 
    SimulationAction.actorDidMounted(this.props.jvm_id, this.state.data.get("_id"), head_box);
        
  }
  
  componentDidUpdate(prevProps, prevState){
    var thread_ids = this.state.data.get("threads").toArray();
    for(var thread_id of thread_ids){
      var b_box = this.refs["thread_rect_" + thread_id].getDOMNode().getBBox();
      var center_x = b_box.width/2 + b_box.x + this.state.data.get('position_x');
      SimulationAction.threadRectDidMounted(prevProps.jvm_id, prevState.data.get("_id"), thread_id, center_x);
    } 
  }

  render(){
    console.log("Actor is rendering", this, this.props, this.state);
    var x = 0;
    var thread_rects = [];
    var box = this.state.data.get("head_box");
       
    if(this.state.data.get("position_x")){
      x = this.state.data.get("position_x");
      var center_x = this.state.data.get("center_x");
      var thread_ids = this.state.data.get("threads").toArray();
      for(var i in thread_ids){
        var thread_id = thread_ids[i];
        console.log("drawing thread rect", i, thread_id, center_x);
        var offset = (i - thread_ids.length/2 + 0.5) * THREAD_RECT_WIDTH;;        ;
        //this.props.actor_data.threads[thread_id].center_x = center_x + offset;
        var height = this.state.data.get("height");
        var head_bottom = box.height + box.y
        thread_rects.push(<rect key={"thread_rect_"+i} width={THREAD_RECT_WIDTH}
                                ref = {"thread_rect_" + thread_id}
                                height={height} 
                                x={center_x + offset - THREAD_RECT_WIDTH/2} 
                                y={head_bottom} 
                                style={{fill:(i%2?"#E9967A":"#8FBC8F"), opacity:0.35}}/>);
      }
    }
    var head_box;
    if(box){    
      head_box = <rect height={box.height} width={box.width} x={box.x} y={box.y}
                 style={HEAD_BOX_STYLE} rx={HEAD_PADDING/2} yx={HEAD_PADDING/2}> </rect>
    
    }

    return(
      <g transform={"translate(" + x +")"}>
        <g>
          <text ref="text" x={0} y={50}>{this.state.data.get("owner")}</text>
          {head_box}
        </g>

        {thread_rects}
      </g>
    );
  }
}

export default Actor;
