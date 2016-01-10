import React from 'react'

import { Button, Modal, OverlayTrigger, Popover, Tooltip } from 'react-bootstrap';
import {PureRenderComponent, ImmutablePropComponent} from '../common_components.jsx'

import SimulationAction from '../../actions/simulation_action'

class SourceLineDetail extends PureRenderComponent{
  constructor(props){
    super(props);
    //this.state.showModal = false;
    
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);

  }
  
  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
    this.props.store.reload();
  }

  render(){
    let popover = <Popover title="popover">very popover. such engagement</Popover>;
    let tooltip = <Tooltip>wow.</Tooltip>;
    console.log("render source line detail:", this.state.data.get('data'));
    let data = this.state.data.get('data');
    let threads = [];
    if(data){
      var onclick = (s)=>{
        //console.log(s);
        SimulationAction.replayJumpTo(s.seq);
      }
      for(var thread_id in data.data){
        console.log(thread_id, data.data[thread_id]);
        var method_invocations = data.data[thread_id];
        var mis = [];
        for(var mi in method_invocations){
          var mi_info = (
            <div>
              <h4>{"Method Invocation Frame:" + mi}</h4>
              {method_invocations[mi].map((s)=>{
                return <p><button className="btn btm-sm btn-info" onClick={onclick.bind(null, s)}>Goto</button>{s.signal_type + ":" + (s.value?s.value:s.method_desc)}</p>;
               })}
            </div>
          );
          mis.push(mi_info);
        }
        var thread_info = (
          <div>
            <h3>{"Thread:" + thread_id}</h3>
            {mis}
            <hr/>
          </div>
        );
        threads.push(thread_info);
      }
    }

    return (
      <div>
        <button className="btn btn-sm btn-danger" onClick={this.open}>Query More</button>
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Runtime Detail Information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {threads}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
      
    );
  }

}

export default SourceLineDetail
