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
    this.drawChart = this.drawChart.bind(this);
  }
  
  drawChart(container){
    if(container){
      let data = this.state.data.get('data');
      let threads = [];
      if(data){
        var chart = new google.visualization.Timeline(container);
        var dataTable = new google.visualization.DataTable();
        //dataTable.addColumn({ type: 'date', id: 'Date' });
       
        dataTable.addColumn({ type: 'string', id: 'Thread' });
        dataTable.addColumn({ type: 'string', id: 'MI'});
        dataTable.addColumn({ type: 'number', id: 'Start' });
        dataTable.addColumn({ type: 'number', id: 'End' });
        var table = [];
        for(var thread_id in data.data){
          console.log(thread_id, data.data[thread_id]);
          var method_invocations = data.data[thread_id];
          var mis = [];
          for(var mi in method_invocations){
            
            var start = (method_invocations[mi].start);
            var end = (method_invocations[mi].end); 
            console.log("row", thread_id, mi, start, end, method_invocations[mi].start, method_invocations[mi].end); 
            table.push(["Thread " + thread_id,  thread_id + "-" +  mi, start, end]);
          }
          
          
        }  
        dataTable.addRows(table);
        
        var options = {
          timeline: { colorByRowLabel: true },
          backgroundColor: '#ffd'
        };

        chart.draw(dataTable, options);
        google.visualization.events.addListener(chart, 'select', (e)=>{
          console.log(e, chart.getSelection());
          //SimulationAction.replayJumpTo(chart.getSelection()[0].row); 
        });
      }
    }
  }
  
  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
    this.props.store.reload();
  }

  render(){
    //let popover = <Popover title="popover">very popover. such engagement</Popover>;
    //let tooltip = <Tooltip>wow.</Tooltip>;
    console.log("render source line detail:", this.state.data.get('data'));
    let data = this.state.data.get('data');
    let threads = [];
    var chart;
    if(data){
      chart = (
       
          <div ref={this.drawChart} style={{height:300}}></div>
       
      )
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
              {method_invocations[mi].signals.map((s)=>{
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
            {chart}
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
