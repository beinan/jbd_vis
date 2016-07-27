import React from 'react'

import {PureRenderComponent, ImmutablePropComponent} from '../common_components.jsx';

import SimulationAction from '../../actions/simulation_action';

import JSONTree from 'react-json-tree';

//const bar_style = {opacity:0.5, fill:"red", stroke: "blud", strokeWidth:1, strokeDasharray: "3,1"};

const status_color= {active:"#83FA8F", runable:"#ABF2B2", block:"#FA3A67", waiting:"#FAFA3A", notify:"#3A8EFA", grant:"#FA9A3A"}
const bg_color = {field_setter:'bg-red', field_getter:'bg-green', method_invoke:'bg-blue', method_return:'bg-black'}
class SignalItem extends React.Component{

  constructor(props){
    super(props);
    this.state = {};
  }
  
  render(){
    var s = this.props.signal;
    var raw_json = null;
    if(this.state.show_json){
      raw_json = (<JSONTree id={s._id} data={s} />)
    }
    
    
    return (
      <div className="info-box">
        <span className={"info-box-icon " + (bg_color[s.signal_type]?bg_color[s.signal_type]:'bg-yellow')}><i className="fa fa-star-o"></i></span>
        <div className="info-box-content">
          <span className="info-box-number"><a onClick={()=>{this.setState({show_json:!this.state.show_json})}}>{s.seq}</a> </span>
          <span className="info-box-text">{s.signal_type.replace('_', ' ')} : {s.class_name} : {s.method_name} : {s.field_name} </span>
          <span className="info-box-number">  {s.value}  {s.args?"("+s.args.join(',')+")":""} </span>
          <span className="info-box-text">{"thread" + s.thread_id}</span>
          <button className="btn btn-default" onClick={()=>{SimulationAction.replayJumpTo(s.seq)}}>Jump To</button>
          <button className="btn btn-info" onClick={()=>{this.setState({show_json:!this.state.show_json})}}> JSON </button>
          {raw_json}
        </div>
      </div>
    );
  }
}
class QueryBox extends React.Component{
  constructor(props){
    super(props);
    this.state = {queryStrings:[]};
    this.handleChange = this.handleChange.bind(this);
    this.filter = this.filter.bind(this);
  }
  
  handleChange(e){
    console.log(e.target.value);
    this.setState({queryStrings : e.target.value.split(' ')});
  }
  
  filter(s){
    var q_arr = this.state.queryStrings;
    if(q_arr.length == 0)
      return true;
   
    s.class_name = "";
    s.field_name = "";
    s.method_name = "";
    if(s.field){
      s.class_name = s.field.split('@')[0];
      s.field_name = s.field.split('@')[1].split(',')[0];
    }
    if(s.method_desc){
      s.class_name = s.method_desc.split('#')[0];
      s.method_name = s.method_desc.split('#')[1].split('(')[0];
    }
    for(var i = 0; i < q_arr.length; i++){
      var q = q_arr[i];
      if(s.class_name.match('^' + q + '$'))
        return true;
      if(s.field_name.match('^' + q + '$'))
        return true;
      if(s.method_name.match('^' + q + '$'))
        return true;
    }
    return false;
  }

  render(){
    var signals = this.props.signals.filter(this.filter).map((s)=>{
      return (
        <div>
          <SignalItem id={s._id} signal = {s} />
        </div>);
    });
    console.log("query singals:", signals);
    return (
      <div>
        <div className="input-group">
        <input type="text" onChange={this.handleChange} className="form-control" placeholder="Search..."/>
        </div>
        {signals}
      </div>
    );
  }
}
export default class QueryPanel extends PureRenderComponent{
  constructor(props){
    super(props);    
    this.state = {'show':false}
  }
  
  render(){
    console.log("rendering query panel", this.props.store);
    return (
      <div>
        <button onClick={()=>{this.setState({'show': !this.state.show});}}>Open/Hide Query Panel</button>
       
      <div style={{backgroundColor:'white', height:500, width:1000, overflow:'auto', display:this.state.show?'block':'none'}}>
         
         <QueryBox signals = {this.props.store.signal_cache}/>
      </div>
      </div>
    );

  }
}
