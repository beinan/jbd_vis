import {CommonStore, RemoteStore} from './common_stores';
import Immutable from 'immutable';

import {getJson} from '../utils/ajax';

class SourceLineStore extends RemoteStore{
  constructor(props){
    super({},{lazy:true, url:'/api/source_line_detail/' + props.source_file + 
              '/' + props.jvm_id + 
              '/' + props.line_number});
  }

}

export default SourceLineStore;
