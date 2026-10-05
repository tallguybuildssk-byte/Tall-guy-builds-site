import React,{useEffect,useState} from 'react';
import {loadContractSource,money,displayDate} from './operations/contract-source.mjs';
import AutoImportStatus from './AutoImportStatus';
const box={background:'#fff',border:'1px solid #E5E7EB',borderRadius:12,padding:18,marginBottom:16,color:'#1F2937',fontSize:13,lineHeight:1.6,overflowWrap:'anywhere'};
const muted={color:'#596273',fontSize:12};
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,150px),1fr))',gap:12,margin:'14px 0'};
function Metric({label,value}){return <div><div style={muted}>{label}</div><strong>{value}</strong></div>;}
function Dates({job}){return <div style={grid}>
 <Metric label="Project status" value={job.status||'Not recorded'}/>
 <Metric label="Project dates" value={`${displayDate(job.start_date)} to ${displayDate(job.end_date)}`}/>
 <Metric label="Project value" value={money(job.value)}/><Metric label="Recorded paid" value={money(job.paid)}/>
 <Metric label="Progress" value={job.progress===null||job.progress===undefined?'Not recorded':`${job.progress}%`}/>
 </div>;}

export function ContractSourceView({state,job={},view='contract',onRetry}){
 const scheduleOnly=view==='schedule';
 const title=scheduleOnly?'Contract schedule draft':'Contract source';
 if(state.status==='restricted')return null;
 if(state.status!=='linked')return <section aria-label={title} style={box}>
  <h3 style={{margin:'0 0 8px'}}>{title}</h3>
  <p role="status" style={{margin:0}}>{({loading:'Loading linked estimate…',
   'new-project':'Save the project before linking an estimate.',
   unavailable:'Contract source could not be loaded. Owner read access or the connection may need attention.',
   unlinked:'No estimate is linked to this project yet.'})[state.status]||'Contract source unavailable.'}</p>
  {state.status==='unavailable'&&onRetry&&<button type="button" onClick={onRetry} style={{marginTop:10}}>Try again</button>}
 </section>;
 const s=state.source,scope=Array.isArray(s.scope)?s.scope:[],schedule=s.schedule;
 const tasks=Array.isArray(schedule?.tasks)?schedule.tasks:[];
 const exclusions=Array.isArray(schedule?.exclusions)?schedule.exclusions:[];
 const address=s.address&&typeof s.address==='object'?[s.address.Line1,s.address.Line2,s.address.City,s.address.CountrySubDivisionCode].filter(Boolean).join(', '):'';
 return <section aria-label={title} style={box}>
  <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
   <h3 style={{margin:0}}>{title}</h3><span style={{...muted,background:'#F4F0E6',padding:'2px 8px',borderRadius:8}}>Owner only</span>
  </div>
  <p style={muted}>QuickBooks estimate #{s.estimate_number||s.estimate_id} · Linked revision {s.original_revision}</p>
  <Dates job={job}/>
  {!scheduleOnly&&<>
   <p><strong>{s.client_name||'Customer not recorded'}</strong>{address&&<><br/>{address}</>}</p>
   {!job.client&&<p style={muted}>The estimate identifies the customer above. The project’s client field is still empty.</p>}
   <div style={grid}><Metric label="Contract before tax (CAD)" value={money(s.revenue_cents,{cents:true})}/>
    <Metric label="Source tax (CAD)" value={money(s.tax_cents,{cents:true})}/>
    <Metric label="Source contract total (CAD)" value={money(s.contract_total_cents,{cents:true})}/></div>
   <p style={muted}>Recorded payments above come from this project. Linked invoices do not confirm payment. Cost budget and actual costs are not connected to this contract view.</p>
   <details open><summary style={{cursor:'pointer',fontWeight:700}}>Original linked scope ({scope.length} lines)</summary>
    <ol style={{paddingLeft:22}}>{scope.map((l,i)=><li key={`${l.id||i}-${i}`} style={{margin:'10px 0'}}>
     <span style={{whiteSpace:'pre-wrap'}}>{typeof l.description==='string'?l.description:'Scope description unavailable'}</span>
     <div style={muted}>Source selling price: {money(l.amount)}</div>
    </li>)}</ol>
   </details>
   <p style={muted}>Accepted date: {displayDate(s.accepted_date)}<br/>Source updated: {displayDate(s.source_updated_at)}<br/>
    Linked: {displayDate(s.recorded_at)}. This saved revision may differ from the version originally accepted; it is not signature evidence.</p>
  </>}
  {scheduleOnly&&<>
   <p><strong>Private draft — dates and durations need review.</strong> Confirm completed versus remaining work before scheduling. Existing project dates above are unchanged.</p>
   {tasks.length?<ol style={{paddingLeft:22}}>{tasks.map((t,i)=><li key={`${t.id||i}-${i}`} style={{margin:'12px 0'}}>
    <strong>{t.title}</strong><div style={muted}>{t.startDate?`Proposed: ${displayDate(t.startDate)} to ${displayDate(t.endDate)}`:'Dates to confirm'} · {t.durationDays?`${t.durationDays} working days proposed`:'Duration to confirm'}</div>
    {Array.isArray(t.sourceLineIds)&&t.sourceLineIds.length>0&&<div style={muted}>Source lines: {t.sourceLineIds.join(', ')}</div>}
   </li>)}</ol>:<p>No schedule draft was saved with this estimate.</p>}
   {Array.isArray(schedule?.reviewFlags)&&<ul style={{paddingLeft:22}}>{schedule.reviewFlags.map((f,i)=><li key={i}>{f}</li>)}</ul>}
   <p style={muted}>Draft items are not calendar events and are not shared with clients.</p>
  </>}
  {exclusions.length>0&&<aside style={{padding:12,background:'#FFF8E6',borderRadius:8}}>
   <strong>Separately quoted / excluded items</strong><ul style={{marginBottom:0,paddingLeft:22}}>
    {exclusions.map((e,i)=><li key={i}><strong>{e.title}</strong>: {e.reason}. A $0 source line is not a promise to supply this for free.</li>)}
   </ul></aside>}
  {state.revisionError?<p role="status">Revision checks could not be loaded. {onRetry&&<button type="button" onClick={onRetry}>Try again</button>}</p>:
   state.revisionCount>0?<details><summary style={{cursor:'pointer',fontWeight:700,marginTop:12}}>{state.revisionCount} saved source revision(s) need review</summary>
    <ul>{state.revisions.map(r=><li key={r.revision}>Revision {r.revision}: {money(r.total_cents,{cents:true})} · {r.status||'Status not recorded'} · received {displayDate(r.recorded_at)}</li>)}</ul>
    {state.revisionCount>state.revisions.length&&<p>Showing the latest {state.revisions.length} saved revisions.</p>}
    <p>The original linked contract and project values have not been replaced.</p>
   </details>:<p style={muted}>No additional source revisions are saved.</p>}
 </section>;
}

export default function ContractSourcePanel({client,job,view='contract'}){
 const [state,setState]=useState({status:'loading'}),[attempt,setAttempt]=useState(0);
 const jobId=job?.id;
 useEffect(()=>{let active=true;setState({status:'loading',jobId});
  loadContractSource(client,jobId).then(next=>{if(active)setState({...next,jobId});})
   .catch(()=>{if(active)setState({status:'unavailable',jobId});});
  return()=>{active=false;};
 },[client,jobId,attempt]);
 return <><ContractSourceView state={state.jobId===jobId?state:{status:'loading'}} job={job} view={view} onRetry={()=>setAttempt(n=>n+1)}/>
  {state.jobId===jobId&&state.status==='linked'&&<AutoImportStatus client={client}/>}</>;
}
