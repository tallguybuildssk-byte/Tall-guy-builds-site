import React,{useEffect,useState} from 'react';
import {loadAutoImportStatus} from './operations/auto-import-status.mjs';
import {displayDate} from './operations/contract-source.mjs';
export function AutoImportStatusView({state,onRefresh}){
 if(state.status==='restricted')return null;
 return <section aria-label="Automatic QuickBooks checks" style={{fontSize:12,color:'#596273',lineHeight:1.7,margin:'12px 0'}}>
  <p role="status" style={{margin:'0 0 6px'}}><strong>{state.status==='loading'?'Loading automatic check status…':state.label}</strong></p>
  {state.checked&&<div>Last check: {displayDate(state.checked)}</div>}
  {state.success&&<div>{state.baselineOnly?'Baseline verified':'Last successful hourly check'}: {displayDate(state.success)}</div>}
  {state.error&&<div>{state.error}</div>}
  {state.enabled&&<p style={{margin:'6px 0'}}>Newly accepted estimates may create private Upcoming projects. Possible matches and changes need review. Draft schedules stay off the calendar.</p>}
  {onRefresh&&<button type="button" onClick={onRefresh} style={{border:'1px solid #D1D5DB',borderRadius:6,background:'#fff',color:'#374151',padding:'5px 10px',cursor:'pointer'}}>Refresh status</button>}
 </section>;
}
export default function AutoImportStatus({client}){
 const [state,setState]=useState({status:'loading'}),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let active=true;setState({status:'loading'});
  loadAutoImportStatus(client).then(v=>{if(active)setState(v);}).catch(()=>{
   if(active)setState({status:'unavailable',label:'Automatic check status could not be loaded.'});});
  return()=>{active=false;};
 },[client,attempt]);
 return <AutoImportStatusView state={state} onRefresh={()=>setAttempt(n=>n+1)}/>;
}
