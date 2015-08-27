import React from 'react'

import SimulationStore from '../../stores/simulation_store';
import JvmsAction from '../../actions/jvm_action';
import {ContentSection, ContentBox, UploadFileForm} from '../common_components.jsx';

import {Button, Input, Label, Fade, Collapse,Badge, Grid, Row, Col, Well} from 'react-bootstrap';

import SeqDiagram from '../seq_diagram/seq_diagram.jsx'

class SimulationView extends React.Component{
  
  constructor(props){
    super(props);
    this.state = SimulationStore.getData();
    this._onChange = this._onChange.bind(this);
  }
  
  componentDidMount() {
    SimulationStore.addUpdateEventListener(this._onChange);
  }

  componentWillUnmount() {
    SimulationStore.removeUpdateEventListener(this._onChange);
  }

  _onChange() {
    this.setState(SimulationStore.getData());
  }

 
  render(){
    console.log("rendering simulation_view", this.state);
    var seq_diagrams = [];
    for(var jvm_name in this.state.seq_diagrams){
      console.log(jvm_name, this.state.seq_diagrams[jvm_name]);
      seq_diagrams.push(<SeqDiagram key={"seq_diag_" + jvm_name} title={jvm_name} seq_data ={ this.state.seq_diagrams[jvm_name]} />);
    }
    return (
      <div>
        {/*header*/}
        <section className="content-header">
          <h1>
            Execution Simulation 
            <small></small>
          </h1>
          <ol className="breadcrumb">
            <li><i className="fa fa-dashboard"></i> Home</li>
            <li className="active">Execution Simulation</li>
          </ol>
        </section>
        {/*content*/}
        <div className="content body">
          <div className="row" style={{overflow:'auto'}}>
            {seq_diagrams}
          </div>
          
        </div>
      </div>
    )
  }

}

export default SimulationView;
