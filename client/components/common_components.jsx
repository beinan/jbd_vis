
import React from 'react/addons'  //react with all addons

import JobStore from '../stores/job_store'

import StoreFactory from '../stores/store_factory'

/**
 * Common abstracted React.js component with PureRenderMixin
 * Each property passed in this Component has to be immutable(such as string, number, immutable object and etc..)
 * @see https://facebook.github.io/immutable-js/docs/
 * @see https://facebook.github.io/react/docs/pure-render-mixin.html
 */
export class ImmutablePropComponent extends React.Component{
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = React.addons.PureRenderMixin.shouldComponentUpdate.bind(this);
  }
} 

/**
 * Common abstracted cmponent with a common store {@link StoreFactory}
 * store in props is mandatory
 * @example 
 * class MyComponent extends PureRenderCommponent{
 *  ...
 * }
 * <MyComponent store={StoreFactory.getAppStore()} />
 */
export class PureRenderCommponent extends ImmutablePropComponent{
  constructor(props) {
    super(props);
    this.state = {data : props.store.getData()};
    this._onChange = this._onChange.bind(this);
  }

  componentDidMount() {
    this.props.store.addEventListener(this._onChange);
  }

  componentWillUnmount() {
    this.props.store.removeEventListener(this._onChange);
  }

  _onChange() {
    this.setState({data:this.props.store.getData()});
  }
}

export class ContentSection extends React.Component{
  
  constructor(props){
    super(props);
  }
  
  render() {
    return (
      <section id={this.props.section_id}>
        <h2 className="page-header"><a href={"#" + this.props.section_id}>{this.props.title}</a></h2>
        <p className="lead">
          {this.props.desc} 
        </p>
        {this.props.content}
      </section>
    );
  }
}

export class ContentBox extends React.Component{
  
  constructor(props){
    super(props);
  }
  
  render() {
    return (
      <div className="box box-primary">
        <div className="box-header with-border">
          <h3 className="box-title">{this.props.title}</h3>
          <span className="label label-primary pull-right"><i className="fa fa-html5"></i></span>
        </div>
        <div className="box-body">
          {this.props.children}
        </div>
      </div>
    );
  }
}


export class UploadFileForm extends React.Component{
  
  constructor(props){
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {status:"success", msg:'Upload your test cases.'}; //init with 'success' status.
  }
  

  handleSubmit(e){
    e.preventDefault();
    this.setState({status: 'warning', msg: "Uploading, don't close your browser."});
    var formData = new FormData(React.findDOMNode(this.refs.uploadForm));
    $.ajax({
      url: this.props.url,  //Server script to process data
      type: 'POST',
      data: formData,
      cache: false,
      contentType: false,
      processData: false
    }).then(
      (data) => { //ajax request successed
        this.setState({status: 'success', msg: "Upload success."}); 
        console.log("upload successful",data);
        this.setState({job_id: data.job_id});
      },
      (jqXHR, textStatus, errorThrown) => { //ajax request failed
        this.setState({status:'error', msg:"Error" + errorThrown});
      }
    );
  }
  render() {
    var job_output;
    return (
      <form encType="multipart/form-data" onSubmit={this.handleSubmit} id="file_upload_form" ref="uploadForm">
        <div className={"form-group has-" + this.state.status}>          
          <label className="control-label" htmlFor="uploadFile">{this.state.msg}</label>
          <input type="file" name="file" id="uploadFile" />
          <p className="help-block">{this.props.desc}</p>
        </div>
        <button type="submit" className="btn btn-primary">
          <i className="fa fa-upload"></i> Upload
        </button>
               
      </form>
      
    );
  }
}

