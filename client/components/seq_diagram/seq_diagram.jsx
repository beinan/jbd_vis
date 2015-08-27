import React from 'react'

import Actor from './actor.jsx'
import Signal from './signal.jsx'
import Lifeline from './lifeline.jsx'

class SeqDiagram extends React.Component{
  constructor(props){
    super(props);
    this.data_store = this.props.seq_data;
    this.state = this.data_store.getData();
    this._onChange = this._onChange.bind(this);
    
  }
  
  componentDidMount() {
    this.data_store.addUpdateEventListener(this._onChange);
  }

  componentWillUnmount() {
    this.data_store.removeUpdateEventListener(this._onChange);
  }

  _onChange() {
    console.log("seq diagram on change");
    this.setState(this.data_store.getData());
  }

  render(){
    console.log("seq diagram is rendering", this.state,this.props);
    var actors = [];
    var signals = [];
    var lifelines = [];
    if(this.state.status === "ready"){
      actors = this.data_store.getData().data.actors.map(
        (actor_data)=>{
          console.log("actor data", actor_data);
          return <Actor key={"actor_"+actor_data._id} actor_data ={actor_data} />
        }
      );
      signals = this.data_store.getData().data.signals.map(
        (signal_data) => {
          console.log("signal data", signal_data);
          return <Signal key={"signal_" + signal_data._id} signal_data ={signal_data} max_width={this.data_store.x}/> 
        }
      )
      lifelines = this.data_store.getData().data.lifelines.map(
        (lifeline_data)=> {
          return <Lifeline key={"lifeline_" + lifeline_data._id} lifeline_data = {lifeline_data} />
        }
      );
    }
    var marker='<marker id="end" viewBox="0 -5 10 10" refX="10" refY="0" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,-5L10,0L0,5"></path></marker>';
    return(
      <svg width={this.data_store.x} height={this.data_store.y}>
        <defs dangerouslySetInnerHTML={{__html: marker}}>          
        </defs>
        {actors}
        {signals}
        {lifelines}
      </svg>
    );
  }
}

export default SeqDiagram;
