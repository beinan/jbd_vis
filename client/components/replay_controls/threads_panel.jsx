import React from 'react'

import {PureRenderComponent, ImmutablePropComponent} from '../common_components.jsx';

import SimulationAction from '../../actions/simulation_action'

//const bar_style = {opacity:0.5, fill:"red", stroke: "blud", strokeWidth:1, strokeDasharray: "3,1"};

const status_color= {active:"#83FA8F", runable:"#ABF2B2", block:"#FA3A67", waiting:"#FAFA3A", notify:"#3A8EFA", grant:"#FA9A3A"}
export default class ThreadsPanel extends PureRenderComponent{
  constructor(props){
    super(props);    
    this.state = {'show':false}
  }
  
  render(){
    console.log("rendering threads panel", this.props.store);
    var threads_head = [];
    var signals = [];
    var threads = [];
    var threads_status = {}
    var threads_last_sig = {}
    if(this.state.show){
      this.props.store.signal_cache.forEach(
        (s)=>{
          var thread_index = threads.indexOf(s.thread_id);
          if(thread_index == -1){
            threads.push(s.thread_id)
            threads_status[s.thread_id] = 'runable';
              //thread_index = threads.length - 1;
          }        
          //fields.push(<th><span title={class_name}>{field_name}</span></th>);
          //values.push(<td>{this.props.store.get('data')[f]}</td>);
        }      
      );
      threads.sort();
      threads.forEach((t_id)=>threads_head.push(<th>{"Thread:" + t_id}</th>))
      console.log("threads panel: threads", threads);
      

      this.props.store.signal_cache.forEach(
        (s)=>{
          var thread_index = threads.indexOf(s.thread_id);
          var signal_tds = [];
          var sigOnClick = (s) => {
            if(s && s.seq)
              SimulationAction.replayJumpTo(s.seq);
          }
          threads.forEach((t_id)=>{
            if(t_id == s.thread_id){
              threads_last_sig[s.thread_id] = s;
              if(s.signal_type=="MonitorRequest")
                threads_status[s.thread_id] ='block';
              else if(s.signal_type=="MonitorEnter")
                threads_status[s.thread_id] = 'grant';
              else if(s.method_desc && s.method_desc.indexOf("wait")!= -1)
                threads_status[s.thread_id] ='waiting';
              else if(s.method_desc && s.method_desc.indexOf("notify")!= -1)
                threads_status[s.thread_id] ='notify';
              else
                threads_status[s.thread_id] ='active';
            
              signal_tds.push(<td onClick = {sigOnClick.bind(null, s)} style={{lineHeight:0.5, fontSize:8, backgroundColor:status_color[threads_status[s.thread_id]]}}>{s.signal_type}</td>)
            }else{
              //console.log("threads_status",threads_status, t_id);
              signal_tds.push(<td onClick = {sigOnClick.bind(null, threads_last_sig[t_id])} style={{lineHeight:0.5, fontSize:8, backgroundColor:status_color[threads_status[t_id]]}}></td>);
            }
            if(s.signal_type=="MonitorRequest")
              threads_status[s.thread_id] ='block';
            else if(s.signal_type=="MonitorEnter")
              threads_status[s.thread_id] ='runable';
            else if(s.method_desc && s.method_desc.indexOf("wait")!= -1)
              threads_status[s.thread_id] ='waiting';
            else
              threads_status[s.thread_id] ='runable';
               

          });
          signals.push(<tr>{signal_tds}</tr>) 
          //fields.push(<th><span title={class_name}>{field_name}</span></th>);
          //values.push(<td>{this.props.store.get('data')[f]}</td>);
        }      
      );
    }
    return (
      <div>
        <button onClick={()=>{this.setState({'show': !this.state.show});}}>Open/Hide Threads View</button>
       
      <div style={{backgroundColor:'white', height:500, width:1000, overflow:'auto', display:this.state.show?'block':'none'}}>
         <table className="table table-bordered table-hover" style={{fontSize:8}}>
          <thead>
            <tr>
              {threads_head}
            </tr>
          </thead>
          <tbody>            
            {signals}            
          </tbody>
        </table>
      </div>
      </div>
    );

  }
}
