import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabase";

const C={navy:"#1F2A37",navyLight:"#2C3E50",gold:"#C8A96A",muted:"#6B7280",border:"#2E3D4F",warn:"#F59E0B",danger:"#EF4444",white:"#FFFFFF",bg:"#16212E",success:"#4CAF50"};
const font="'Georgia',serif";
const fb="system-ui,-apple-system,sans-serif";
const fmt$=v=>"$"+Number(v||0).toLocaleString();
const fmtDate=d=>d?new Date(d+"T12:00:00").toLocaleDateString("en-CA",{month:"short",day:"numeric",year:"numeric"}):"—";
const todayStr=()=>new Date().toISOString().slice(0,10);
const WEATHER=["☀️ Sunny","⛅ Partly Cloudy","☁️ Overcast","🌧️ Rain","❄️ Snow","🌨️ Blowing Snow","🌬️ Windy","🌡️ Extreme Cold"];
const LEAD_STAGES=["New","Quoted","Follow-up","Won","Lost"];
const JOB_STATUSES=["Upcoming","Active","Completed","On Hold"];
const EVENT_TYPES=["inspection","site","quote","sub","meeting","other"];
const EC={inspection:C.warn,site:C.gold,quote:"#60A5FA",sub:C.success,meeting:"#C084FC",other:C.muted};

// ── UI PRIMITIVES ─────────────────────────────────────────────────────────────
function Badge({label}){
  const m={Active:{bg:"#14532d22",t:"#4ade80"},Upcoming:{bg:"#1e3a5f22",t:"#60A5FA"},Completed:{bg:"#1c1c1c",t:C.muted},"On Hold":{bg:"#7c2d1222",t:"#FB923C"},Won:{bg:"#14532d22",t:"#4ade80"},Lost:{bg:"#7f1d1d22",t:"#F87171"},New:{bg:"#1e3a5f22",t:"#60A5FA"},Quoted:{bg:"#78350f22",t:C.gold},"Follow-up":{bg:"#581c8722",t:"#C084FC"},"In Progress":{bg:"#78350f22",t:C.gold},"Not Started":{bg:"#1c1c1c",t:C.muted}};
  const c=m[label]||{bg:"#1c1c1c",t:C.muted};
  return <span style={{background:c.bg,color:c.t,padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>;
}
function Card({children,style={},onClick}){
  const [h,setH]=useState(false);
  return <div onClick={onClick} onMouseEnter={()=>onClick&&setH(true)} onMouseLeave={()=>setH(false)} style={{background:C.navyLight,border:`1px solid ${h?C.gold:C.border}`,borderRadius:10,padding:18,cursor:onClick?"pointer":"default",transition:"border-color 0.15s",...style}}>{children}</div>;
}
function Inp({label,value,onChange,type="text",placeholder=""}){
  return <div style={{marginBottom:11}}>
    {label&&<label style={{display:"block",fontSize:11,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",background:C.navy,border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 11px",color:C.white,fontSize:13,fontFamily:fb,outline:"none",boxSizing:"border-box"}}/>
  </div>;
}
function Txtarea({label,value,onChange,placeholder="",rows=4}){
  return <div style={{marginBottom:11}}>
    {label&&<label style={{display:"block",fontSize:11,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>}
    <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{width:"100%",background:C.navy,border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 11px",color:C.white,fontSize:13,fontFamily:fb,outline:"none",boxSizing:"border-box",resize:"vertical",lineHeight:1.5}}/>
  </div>;
}
function Sel({label,value,onChange,options,display}){
  const opts=display||options;
  return <div style={{marginBottom:11}}>
    {label&&<label style={{display:"block",fontSize:11,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:C.navy,border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 11px",color:C.white,fontSize:13,fontFamily:fb,outline:"none",boxSizing:"border-box"}}>
      {options.map((o,i)=><option key={String(o)} value={o}>{opts?opts[i]:o}</option>)}
    </select>
  </div>;
}
function Btn({children,onClick,variant="primary",size="md",style={}}){
  const v={primary:{background:C.gold,color:C.navy},ghost:{background:"transparent",color:C.gold,border:`1px solid ${C.border}`},danger:{background:"transparent",color:C.danger,border:`1px solid ${C.border}`}};
  const s={sm:{padding:"4px 11px",fontSize:11},md:{padding:"8px 17px",fontSize:13}};
  return <button onClick={onClick} style={{cursor:"pointer",borderRadius:6,fontFamily:fb,fontWeight:600,border:"none",...v[variant],...s[size],...style}}>{children}</button>;
}
function Modal({title,onClose,children,wide=false}){
  return <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
    <div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:12,padding:24,width:"100%",maxWidth:wide?700:500,maxHeight:"92vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <h2 style={{margin:0,color:C.white,fontFamily:font,fontSize:19}}>{title}</h2>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer",lineHeight:1}}>×</button>
      </div>
      {children}
    </div>
  </div>;
}
function Toggle({checked,onChange,label}){
  return <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",userSelect:"none"}}>
    <div onClick={()=>onChange(!checked)} style={{width:38,height:20,borderRadius:10,background:checked?C.gold:C.border,position:"relative",transition:"background 0.2s",flexShrink:0,cursor:"pointer"}}>
      <div style={{position:"absolute",top:3,left:checked?19:3,width:14,height:14,borderRadius:"50%",background:checked?C.navy:C.muted,transition:"left 0.2s"}}/>
    </div>
    {label&&<span style={{fontSize:12,color:checked?C.gold:C.muted}}>{label}</span>}
  </label>;
}

// ── MILESTONES (internal editor) ──────────────────────────────────────────────
function Milestones({jobId}){
  const [items,setItems]=useState([]);
  const [nm,setNm]=useState("");
  const [nd,setNd]=useState("");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    if(!jobId)return;
    supabase.from("milestones").select("*").eq("job_id",jobId).order("order_index").then(({data})=>{
      setItems(data||[]);setLoading(false);
    });
  },[jobId]);

  async function toggle(id){
    const cycle={"Completed":"Not Started","Not Started":"In Progress","In Progress":"Completed"};
    const updated=items.map(m=>m.id!==id?m:{...m,status:cycle[m.status]||"Not Started"});
    setItems(updated);
    const item=updated.find(m=>m.id===id);
    await supabase.from("milestones").update({status:item.status}).eq("id",id);
  }

  async function add(){
    if(!nm.trim())return;
    const newM={job_id:jobId,name:nm.trim(),date:nd||null,status:"Not Started",order_index:items.length};
    const {data}=await supabase.from("milestones").insert(newM).select().single();
    if(data)setItems(prev=>[...prev,data]);
    setNm("");setNd("");
  }

  async function del(id){
    setItems(prev=>prev.filter(m=>m.id!==id));
    await supabase.from("milestones").delete().eq("id",id);
  }

  const icon={"Completed":"✅","In Progress":"🔄","Not Started":"○"};
  if(loading)return <div style={{color:C.muted,fontSize:12,padding:8}}>Loading milestones...</div>;

  return <div>
    <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Click icon to cycle status</div>
    {items.length===0&&<div style={{color:C.muted,textAlign:"center",padding:"14px 0",fontSize:12}}>No milestones yet.</div>}
    {items.map((m)=>(
      <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:7,marginBottom:5,background:m.status==="Completed"?"#14532d22":m.status==="In Progress"?C.gold+"11":C.navy,border:`1px solid ${m.status==="Completed"?"#4ade8033":m.status==="In Progress"?C.gold+"44":C.border}`}}>
        <button onClick={()=>toggle(m.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:15,padding:0,lineHeight:1}}>{icon[m.status]}</button>
        <div style={{flex:1}}>
          <div style={{color:m.status==="Completed"?C.muted:C.white,fontSize:12,fontWeight:600,textDecoration:m.status==="Completed"?"line-through":"none"}}>{m.name}</div>
          {m.date&&<div style={{fontSize:10,color:C.muted}}>{fmtDate(m.date)}</div>}
        </div>
        <Badge label={m.status}/>
        <button onClick={()=>del(m.id)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:15,lineHeight:1}}>×</button>
      </div>
    ))}
    <div style={{display:"flex",gap:7,marginTop:10,alignItems:"flex-end",flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:140}}><Inp label="New Milestone" value={nm} onChange={setNm} placeholder="e.g. Pour footings"/></div>
      <div style={{width:130}}><Inp label="Date" value={nd} onChange={setNd} type="date"/></div>
      <Btn onClick={add} style={{marginBottom:11}}>Add</Btn>
    </div>
  </div>;
}

// ── CLIENT PORTAL ─────────────────────────────────────────────────────────────
function ClientPortal({jobs,logs}){
  const [selJob,setSelJob]=useState(null);
  const [milestones,setMilestones]=useState([]);
  const [loadingM,setLoadingM]=useState(false);
  const [lightbox,setLightbox]=useState(null);

  // Only show jobs that have been toggled on for client sharing
  const sharedJobs=jobs.filter(j=>j.shared_with_client);

  useEffect(()=>{
    if(!selJob)return;
    setLoadingM(true);
    supabase.from("milestones").select("*").eq("job_id",selJob.id).order("order_index").then(({data})=>{
      setMilestones(data||[]);setLoadingM(false);
    });
  },[selJob]);

  // Project list / landing
  if(!selJob){
    return <div>
      <div style={{textAlign:"center",padding:"24px 0 32px"}}>
        <img src="https://tallguybuilds.ca/assets/img-002.webp" alt="Tall Guy Builds" style={{width:72,height:72,borderRadius:14,objectFit:"cover",marginBottom:14,boxShadow:"0 4px 20px #00000050"}}/>
        <h1 style={{fontFamily:font,color:C.white,fontSize:26,margin:0}}>Tall Guy Builds Inc.</h1>
        <div style={{color:C.gold,fontSize:11,letterSpacing:2,fontWeight:600,marginTop:6}}>BUILT RIGHT. DESIGNED TO LAST.</div>
        <p style={{color:C.muted,fontSize:13,marginTop:12,maxWidth:360,margin:"12px auto 0"}}>Welcome to your project portal. Select your project below to view progress, milestones, and site updates.</p>
      </div>

      {sharedJobs.length===0&&(
        <div style={{background:C.navyLight,border:`1px dashed ${C.border}`,borderRadius:12,padding:32,textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:10}}>📋</div>
          <div style={{color:C.muted,fontSize:13}}>No projects are currently shared with the client portal.</div>
          <div style={{color:C.muted,fontSize:11,marginTop:6}}>Open a project and enable "Share with Client Portal" to show it here.</div>
        </div>
      )}

      <div style={{display:"grid",gap:14}}>
        {sharedJobs.map(job=>{
          const jobLogs=logs.filter(l=>l.job_id===job.id&&l.visible_to_client);
          return <div key={job.id} onClick={()=>setSelJob(job)} style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",cursor:"pointer",transition:"border-color 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=C.gold}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <div style={{padding:"18px 20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                <div>
                  <div style={{fontWeight:700,color:C.white,fontSize:17,fontFamily:font}}>{job.name}</div>
                  <div style={{color:C.muted,fontSize:12,marginTop:3}}>{job.address}</div>
                  <div style={{color:C.muted,fontSize:11,marginTop:2}}>{fmtDate(job.start_date)} → {fmtDate(job.end_date)}</div>
                </div>
                <Badge label={job.status}/>
              </div>
              <div style={{marginTop:14}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:5}}>
                  <span>Overall Progress</span>
                  <span style={{color:C.gold,fontWeight:700,fontSize:13}}>{job.progress||0}%</span>
                </div>
                <div style={{background:C.border,borderRadius:6,height:8}}><div style={{background:C.gold,borderRadius:6,height:8,width:`${job.progress||0}%`,transition:"width 0.8s"}}/></div>
              </div>
            </div>
            <div style={{borderTop:`1px solid ${C.border}`,padding:"10px 20px",display:"flex",gap:20}}>
              <div style={{fontSize:11,color:C.muted}}><span style={{color:C.white,fontWeight:600}}>{jobLogs.length}</span> site update{jobLogs.length!==1?"s":""}</div>
              <div style={{fontSize:11,color:C.gold,fontWeight:600}}>View project →</div>
            </div>
          </div>;
        })}
      </div>
    </div>;
  }

  // Individual project view
  const jobLogs=logs.filter(l=>l.job_id===selJob.id&&l.visible_to_client).sort((a,b)=>b.date?.localeCompare(a.date));
  const done=milestones.filter(m=>m.status==="Completed").length;
  const inProgress=milestones.filter(m=>m.status==="In Progress").length;
  const total=milestones.length;
  const pct=total>0?Math.round((done/total)*100):selJob.progress||0;

  return <div>
    <button onClick={()=>{setSelJob(null);setMilestones([]);}} style={{background:"none",border:"none",color:C.gold,cursor:"pointer",fontSize:13,fontFamily:fb,marginBottom:18,display:"flex",alignItems:"center",gap:6,padding:0}}>← All Projects</button>

    {/* Project header card */}
    <div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:14,padding:24,marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <img src="https://tallguybuilds.ca/assets/img-002.webp" alt="TGB" style={{width:44,height:44,borderRadius:10,objectFit:"cover"}}/>
          <div>
            <div style={{fontSize:10,color:C.gold,fontWeight:700,letterSpacing:1.5,marginBottom:3}}>TALL GUY BUILDS INC.</div>
            <h2 style={{fontFamily:font,color:C.white,fontSize:20,margin:0}}>{selJob.name}</h2>
            <div style={{color:C.muted,fontSize:12,marginTop:2}}>{selJob.address}</div>
          </div>
        </div>
        <Badge label={selJob.status}/>
      </div>

      <div style={{fontSize:11,color:C.muted,marginBottom:6}}>
        {fmtDate(selJob.start_date)} → {fmtDate(selJob.end_date)}
      </div>

      {/* Big progress bar */}
      <div style={{marginBottom:6}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:8}}>
          <span style={{color:C.muted}}>Overall Progress</span>
          <span style={{color:C.gold,fontWeight:700,fontSize:18,fontFamily:font}}>{selJob.progress||0}%</span>
        </div>
        <div style={{background:C.border,borderRadius:8,height:12,overflow:"hidden"}}>
          <div style={{background:`linear-gradient(90deg, ${C.gold}, #e8c87a)`,borderRadius:8,height:12,width:`${selJob.progress||0}%`,transition:"width 1s",boxShadow:`0 0 8px ${C.gold}66`}}/>
        </div>
      </div>

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(90px,1fr))",gap:10,marginTop:18}}>
        {[{label:"Milestones Done",value:`${done}/${total}`},{label:"In Progress",value:inProgress},{label:"Site Updates",value:jobLogs.length},{label:"Status",value:selJob.status}].map(s=>(
          <div key={s.label} style={{background:C.navy,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:16,color:C.gold,fontWeight:700,fontFamily:font}}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Milestones */}
    <div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginBottom:20}}>
      <h3 style={{fontFamily:font,color:C.white,fontSize:17,margin:"0 0 16px"}}>Project Milestones</h3>

      {loadingM&&<div style={{color:C.muted,fontSize:12}}>Loading...</div>}
      {!loadingM&&milestones.length===0&&<div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"16px 0"}}>Milestones will appear here as they are added.</div>}

      {milestones.map((m,i)=>{
        const isLast=i===milestones.length-1;
        const statusIcon={"Completed":"✅","In Progress":"🔄","Not Started":"⬜"};
        const lineColor=m.status==="Completed"?"#4ade80":m.status==="In Progress"?C.gold:C.border;
        return <div key={m.id} style={{display:"flex",gap:14,paddingBottom:isLast?0:18,marginBottom:isLast?0:4,position:"relative"}}>
          {!isLast&&<div style={{position:"absolute",left:12,top:28,bottom:0,width:2,background:lineColor,opacity:0.3}}/>}
          <div style={{fontSize:20,flexShrink:0,marginTop:1}}>{statusIcon[m.status]}</div>
          <div style={{flex:1,paddingBottom:4}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:6}}>
              <div>
                <div style={{color:m.status==="Completed"?C.muted:C.white,fontSize:14,fontWeight:600,textDecoration:m.status==="Completed"?"line-through":"none"}}>{m.name}</div>
                {m.date&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>{fmtDate(m.date)}</div>}
              </div>
              <Badge label={m.status}/>
            </div>
          </div>
        </div>;
      })}
    </div>

    {/* Site Updates */}
    <h3 style={{fontFamily:font,color:C.white,fontSize:17,margin:"0 0 14px"}}>Site Updates</h3>

    {jobLogs.length===0&&(
      <div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:12,padding:32,textAlign:"center"}}>
        <div style={{fontSize:28,marginBottom:8}}>🏗️</div>
        <div style={{color:C.muted,fontSize:13}}>No site updates yet. Check back soon!</div>
      </div>
    )}

    <div style={{display:"grid",gap:16}}>
      {jobLogs.map(log=>(
        <div key={log.id} style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
          {/* Log header */}
          <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,background:C.navy+"88"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <div style={{fontFamily:font,color:C.white,fontSize:15,fontWeight:700}}>{fmtDate(log.date)}</div>
              <div style={{display:"flex",gap:14,fontSize:12,color:C.muted}}>
                <span>{log.weather}</span>
                <span>👷 {log.crew} on site</span>
                <span>⏱ {log.hours}h</span>
              </div>
            </div>
          </div>
          {/* Log body */}
          <div style={{padding:"14px 18px"}}>
            <p style={{color:C.muted,fontSize:13,lineHeight:1.8,margin:0,whiteSpace:"pre-wrap"}}>{log.notes}</p>
          </div>
          {/* Photos */}
          {log.photos&&log.photos.length>0&&(
            <div style={{padding:"0 18px 18px"}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Photos ({log.photos.length})</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:8}}>
                {log.photos.map((photo,pi)=>(
                  <div key={pi} onClick={()=>setLightbox(photo)} style={{cursor:"zoom-in",borderRadius:8,overflow:"hidden",aspectRatio:"1",background:C.border,boxShadow:"0 2px 8px #00000040"}}>
                    <img src={photo.url||photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block",transition:"transform 0.2s"}}
                      onMouseEnter={e=>e.target.style.transform="scale(1.05)"}
                      onMouseLeave={e=>e.target.style.transform="scale(1)"}/>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Footer */}
    <div style={{textAlign:"center",padding:"32px 0 16px",borderTop:`1px solid ${C.border}`,marginTop:32}}>
      <div style={{fontSize:11,color:C.gold,letterSpacing:1.5,fontWeight:600}}>BUILT RIGHT. DESIGNED TO LAST.</div>
      <div style={{fontSize:11,color:C.muted,marginTop:4}}>Tall Guy Builds Inc. · Regina, Saskatchewan</div>
    </div>

    {/* Lightbox */}
    {lightbox&&<div onClick={()=>setLightbox(null)} style={{position:"fixed",inset:0,background:"#000000DD",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"zoom-out"}}>
      <img src={lightbox.url||lightbox} alt="" style={{maxWidth:"100%",maxHeight:"90vh",borderRadius:10,boxShadow:"0 0 80px #000"}}/>
      <div style={{position:"absolute",bottom:24,left:"50%",transform:"translateX(-50%)",color:C.muted,fontSize:12}}>click anywhere to close</div>
    </div>}
  </div>;
}

// ── INTERNAL DASHBOARD ────────────────────────────────────────────────────────
function DashboardView({jobs,leads,logs,setPage}){
  const active=jobs.filter(j=>j.status==="Active");
  const pipe=leads.filter(l=>!["Won","Lost"].includes(l.stage)).reduce((s,l)=>s+(l.value||0),0);
  const out=jobs.reduce((s,j)=>s+((j.value||0)-(j.paid||0)),0);
  const won=leads.filter(l=>l.stage==="Won").reduce((s,l)=>s+(l.value||0),0);
  const recentLogs=[...logs].sort((a,b)=>b.date?.localeCompare(a.date)).slice(0,3);
  return <div>
    <h1 style={{fontFamily:font,color:C.white,fontSize:26,marginBottom:3}}>Good morning, Evan.</h1>
    <p style={{color:C.muted,marginBottom:22,fontSize:13}}>Here's where things stand today.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:22}}>
      {[{label:"Active Jobs",value:active.length,sub:"in progress",color:C.gold},{label:"Pipeline",value:fmt$(pipe),sub:"open leads",color:"#60A5FA"},{label:"Outstanding",value:fmt$(out),sub:"receivable",color:C.warn},{label:"Won",value:fmt$(won),sub:"closed",color:"#4ade80"}].map(k=>(
        <Card key={k.label}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{k.label}</div><div style={{fontSize:22,fontFamily:font,color:k.color,marginBottom:1}}>{k.value}</div><div style={{fontSize:10,color:C.muted}}>{k.sub}</div></Card>
      ))}
    </div>
    <h2 style={{fontFamily:font,color:C.white,fontSize:17,marginBottom:10}}>Active Projects</h2>
    <div style={{display:"grid",gap:9,marginBottom:22}}>
      {active.length===0&&<div style={{color:C.muted,fontSize:12}}>No active projects.</div>}
      {active.map(job=>(
        <Card key={job.id} onClick={()=>setPage("jobs")}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:7}}>
            <div><div style={{fontWeight:700,color:C.white,fontSize:14}}>{job.name}</div><div style={{color:C.muted,fontSize:11,marginTop:1}}>{job.client} · {job.address}</div></div>
            <Badge label={job.status}/>
          </div>
          <div style={{marginTop:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:3}}><span>{job.progress||0}% complete</span></div>
            <div style={{background:C.border,borderRadius:4,height:5}}><div style={{background:C.gold,borderRadius:4,height:5,width:`${job.progress||0}%`,transition:"width 0.5s"}}/></div>
          </div>
        </Card>
      ))}
    </div>
    {recentLogs.length>0&&<><h2 style={{fontFamily:font,color:C.white,fontSize:17,marginBottom:10}}>Recent Site Logs</h2>
    <div style={{display:"grid",gap:9,marginBottom:22}}>
      {recentLogs.map(log=>(
        <Card key={log.id} onClick={()=>setPage("logs")} style={{padding:13}}>
          <div style={{fontWeight:700,color:C.white,fontSize:13}}>{log.job_name||"General"}</div>
          <div style={{color:C.muted,fontSize:11,marginTop:2}}>{fmtDate(log.date)} · {log.weather} · {log.crew} crew · {log.hours}h</div>
          <div style={{color:C.muted,fontSize:11,marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:280}}>{log.notes}</div>
        </Card>
      ))}
    </div></>}
    <h2 style={{fontFamily:font,color:C.white,fontSize:17,marginBottom:10}}>Recent Leads</h2>
    <Card>{leads.slice(0,4).map((l,i)=>(
      <div key={l.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<3?`1px solid ${C.border}`:"none",flexWrap:"wrap",gap:7}}>
        <div><span style={{color:C.white,fontWeight:600,fontSize:12}}>{l.name}</span><span style={{color:C.muted,fontSize:11,marginLeft:7}}>{l.type}</span></div>
        <div style={{display:"flex",gap:9,alignItems:"center"}}><span style={{color:C.gold,fontWeight:700,fontSize:12}}>{fmt$(l.value)}</span><Badge label={l.stage}/></div>
      </div>
    ))}</Card>
  </div>;
}

// ── PROJECTS ──────────────────────────────────────────────────────────────────
function Jobs({jobs,setJobs}){
  const [showM,setShowM]=useState(false);
  const [sel,setSel]=useState(null);
  const [form,setForm]=useState({});
  const [tab,setTab]=useState("details");
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  function openNew(){setForm({name:"",client:"",address:"",type:"",status:"Upcoming",value:"",paid:"",start_date:"",end_date:"",progress:0,notes:"",shared_with_client:false});setSel(null);setTab("details");setShowM(true);}
  function openEdit(j){setForm({...j,value:String(j.value||""),paid:String(j.paid||"")});setSel(j);setTab("details");setShowM(true);}

  async function save(){
    const u={...form,value:+form.value||0,paid:+form.paid||0,progress:+form.progress||0};
    if(sel){
      const {data}=await supabase.from("jobs").update(u).eq("id",sel.id).select().single();
      if(data)setJobs(js=>js.map(j=>j.id===sel.id?data:j));
    } else {
      const {data}=await supabase.from("jobs").insert(u).select().single();
      if(data)setJobs(js=>[data,...js]);
    }
    setShowM(false);
  }

  async function del(){
    await supabase.from("jobs").delete().eq("id",sel.id);
    setJobs(js=>js.filter(j=>j.id!==sel.id));
    setShowM(false);
  }

  const statColors={Active:C.gold,Upcoming:"#60A5FA",Completed:C.muted,"On Hold":C.warn};

  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
      <h1 style={{fontFamily:font,color:C.white,fontSize:26,margin:0}}>Projects</h1><Btn onClick={openNew}>+ New Project</Btn>
    </div>
    {jobs.length===0&&<div style={{color:C.muted,textAlign:"center",padding:"40px 0",fontSize:13}}>No projects yet.</div>}
    <div style={{display:"grid",gap:10}}>
      {jobs.map(job=>(
        <Card key={job.id} onClick={()=>openEdit(job)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontWeight:700,color:C.white,fontSize:15}}>{job.name}</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{job.client} · {job.address}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{job.type}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <Badge label={job.status}/>
              <div style={{fontSize:13,color:C.gold,fontWeight:700,marginTop:6}}>{fmt$(job.value)}</div>
              <div style={{fontSize:11,color:C.muted}}>Paid: {fmt$(job.paid)}</div>
              {job.shared_with_client&&<div style={{fontSize:10,color:"#4ade80",marginTop:4}}>◈ In client portal</div>}
            </div>
          </div>
          <div style={{marginTop:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:3}}><span>{fmtDate(job.start_date)} → {fmtDate(job.end_date)}</span><span>{job.progress||0}%</span></div>
            <div style={{background:C.border,borderRadius:4,height:4}}><div style={{background:statColors[job.status]||C.gold,borderRadius:4,height:4,width:`${job.progress||0}%`}}/></div>
          </div>
        </Card>
      ))}
    </div>

    {showM&&<Modal title={sel?"Edit Project":"New Project"} onClose={()=>setShowM(false)} wide>
      <div style={{display:"flex",gap:6,marginBottom:16,borderBottom:`1px solid ${C.border}`,paddingBottom:8}}>
        {["details","milestones"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"5px 13px",borderRadius:6,border:"none",fontFamily:fb,fontSize:12,cursor:"pointer",textTransform:"capitalize",background:tab===t?C.gold:"transparent",color:tab===t?C.navy:C.muted,fontWeight:tab===t?700:400}}>{t}</button>
        ))}
      </div>
      {tab==="details"&&<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
          <Inp label="Project Name" value={form.name||""} onChange={v=>f("name",v)}/>
          <Inp label="Client" value={form.client||""} onChange={v=>f("client",v)}/>
        </div>
        <Inp label="Address" value={form.address||""} onChange={v=>f("address",v)}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
          <Inp label="Type" value={form.type||""} onChange={v=>f("type",v)} placeholder="Basement, Deck, Garage..."/>
          <Sel label="Status" value={form.status||"Upcoming"} onChange={v=>f("status",v)} options={JOB_STATUSES}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
          <Inp label="Contract Value ($)" type="number" value={form.value||""} onChange={v=>f("value",v)}/>
          <Inp label="Amount Paid ($)" type="number" value={form.paid||""} onChange={v=>f("paid",v)}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
          <Inp label="Start Date" type="date" value={form.start_date||""} onChange={v=>f("start_date",v)}/>
          <Inp label="End Date" type="date" value={form.end_date||""} onChange={v=>f("end_date",v)}/>
        </div>
        <div style={{marginBottom:11}}>
          <label style={{display:"block",fontSize:11,color:C.muted,marginBottom:3,textTransform:"uppercase"}}>Progress ({form.progress||0}%)</label>
          <input type="range" min="0" max="100" value={form.progress||0} onChange={e=>f("progress",+e.target.value)} style={{width:"100%",accentColor:C.gold}}/>
        </div>
        <Txtarea label="Notes" value={form.notes||""} onChange={v=>f("notes",v)} rows={3}/>
        {/* Client portal toggle */}
        <div style={{padding:"14px 16px",background:C.navy,borderRadius:10,border:`1px solid ${C.border}`,marginBottom:4}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:13,color:C.white,fontWeight:600}}>Share with Client Portal</div>
              <div style={{fontSize:11,color:C.muted,marginTop:3}}>Client can see progress, milestones, and flagged site updates</div>
            </div>
            <Toggle checked={form.shared_with_client||false} onChange={v=>f("shared_with_client",v)}/>
          </div>
        </div>
      </>}
      {tab==="milestones"&&sel&&<Milestones jobId={sel.id}/>}
      {tab==="milestones"&&!sel&&<div style={{color:C.muted,fontSize:12,padding:"20px 0",textAlign:"center"}}>Save the project first, then add milestones.</div>}
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:14}}>
        {sel&&<Btn variant="danger" onClick={del}>Delete</Btn>}
        <Btn variant="ghost" onClick={()=>setShowM(false)}>Cancel</Btn>
        <Btn onClick={save}>Save</Btn>
      </div>
    </Modal>}
  </div>;
}

// ── LEADS ─────────────────────────────────────────────────────────────────────
function Leads({leads,setLeads}){
  const [showM,setShowM]=useState(false);const [sel,setSel]=useState(null);const [form,setForm]=useState({});
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  function openNew(){setForm({name:"",phone:"",email:"",type:"",value:"",stage:"New",notes:"",date:todayStr()});setSel(null);setShowM(true);}
  function openEdit(l){setForm({...l,value:String(l.value||"")});setSel(l);setShowM(true);}
  async function save(){
    const u={...form,value:+form.value||0};
    if(sel){const {data}=await supabase.from("leads").update(u).eq("id",sel.id).select().single();if(data)setLeads(ls=>ls.map(l=>l.id===sel.id?data:l));}
    else{const {data}=await supabase.from("leads").insert(u).select().single();if(data)setLeads(ls=>[data,...ls]);}
    setShowM(false);
  }
  async function del(){await supabase.from("leads").delete().eq("id",sel.id);setLeads(ls=>ls.filter(l=>l.id!==sel.id));setShowM(false);}
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
      <h1 style={{fontFamily:font,color:C.white,fontSize:26,margin:0}}>Pipeline</h1><Btn onClick={openNew}>+ Add Lead</Btn>
    </div>
    {LEAD_STAGES.map(stage=>{
      const group=leads.filter(l=>l.stage===stage);if(group.length===0)return null;
      return <div key={stage} style={{marginBottom:20}}>
        <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{stage} ({group.length})</div>
        <div style={{display:"grid",gap:8}}>{group.map(l=>(
          <Card key={l.id} onClick={()=>openEdit(l)} style={{padding:13}}>
            <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:7}}>
              <div><div style={{fontWeight:700,color:C.white,fontSize:13}}>{l.name}</div><div style={{color:C.muted,fontSize:11,marginTop:2}}>{l.type} · {fmtDate(l.date)}</div>{l.notes&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>📝 {l.notes}</div>}</div>
              <div style={{textAlign:"right"}}><div style={{color:C.gold,fontWeight:700,fontSize:14}}>{fmt$(l.value)}</div><Badge label={l.stage}/></div>
            </div>
          </Card>
        ))}</div>
      </div>;
    })}
    {leads.length===0&&<div style={{color:C.muted,textAlign:"center",padding:"40px 0",fontSize:13}}>No leads yet.</div>}
    {showM&&<Modal title={sel?"Edit Lead":"Add Lead"} onClose={()=>setShowM(false)}>
      <Inp label="Name" value={form.name||""} onChange={v=>f("name",v)}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        <Inp label="Phone" value={form.phone||""} onChange={v=>f("phone",v)}/>
        <Inp label="Email" value={form.email||""} onChange={v=>f("email",v)} type="email"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        <Inp label="Job Type" value={form.type||""} onChange={v=>f("type",v)} placeholder="Deck, Basement..."/>
        <Inp label="Est. Value ($)" type="number" value={form.value||""} onChange={v=>f("value",v)}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        <Sel label="Stage" value={form.stage||"New"} onChange={v=>f("stage",v)} options={LEAD_STAGES}/>
        <Inp label="Date" type="date" value={form.date||""} onChange={v=>f("date",v)}/>
      </div>
      <Txtarea label="Notes" value={form.notes||""} onChange={v=>f("notes",v)} rows={3}/>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:10}}>
        {sel&&<Btn variant="danger" onClick={del}>Delete</Btn>}
        <Btn variant="ghost" onClick={()=>setShowM(false)}>Cancel</Btn><Btn onClick={save}>Save</Btn>
      </div>
    </Modal>}
  </div>;
}

// ── SCHEDULE ──────────────────────────────────────────────────────────────────
function Schedule({events,setEvents,jobs}){
  const [showM,setShowM]=useState(false);const [sel,setSel]=useState(null);const [form,setForm]=useState({});
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  function openNew(){setForm({title:"",job_id:"",date:todayStr(),time:"09:00",type:"site"});setSel(null);setShowM(true);}
  function openEdit(e){setForm({...e,job_id:e.job_id||""});setSel(e);setShowM(true);}
  async function save(){
    const u={...form,job_id:form.job_id||null};
    if(sel){const {data}=await supabase.from("events").update(u).eq("id",sel.id).select().single();if(data)setEvents(es=>es.map(e=>e.id===sel.id?data:e));}
    else{const {data}=await supabase.from("events").insert(u).select().single();if(data)setEvents(es=>[...es,data]);}
    setShowM(false);
  }
  async function del(){await supabase.from("events").delete().eq("id",sel.id);setEvents(es=>es.filter(e=>e.id!==sel.id));setShowM(false);}
  const sorted=[...events].sort((a,b)=>a.date?.localeCompare(b.date));
  const upcoming=sorted.filter(e=>e.date>=todayStr());
  const past=sorted.filter(e=>e.date<todayStr());
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
      <h1 style={{fontFamily:font,color:C.white,fontSize:26,margin:0}}>Schedule</h1><Btn onClick={openNew}>+ Add Event</Btn>
    </div>
    {upcoming.length===0&&<div style={{color:C.muted,textAlign:"center",padding:"20px 0",fontSize:13}}>No upcoming events.</div>}
    <div style={{display:"grid",gap:8,marginBottom:24}}>
      {upcoming.map(ev=>{const job=jobs.find(j=>j.id===ev.job_id);const tc=EC[ev.type]||C.muted;
        return <Card key={ev.id} onClick={()=>openEdit(ev)} style={{padding:13,borderLeft:`3px solid ${tc}`}}>
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <div><div style={{fontWeight:700,color:C.white,fontSize:13}}>{ev.title}</div>{job&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>📁 {job.name}</div>}</div>
            <div style={{textAlign:"right"}}><div style={{fontSize:12,color:C.white,fontWeight:600}}>{fmtDate(ev.date)}</div>{ev.time&&<div style={{fontSize:11,color:C.muted}}>{ev.time}</div>}</div>
          </div>
        </Card>;
      })}
    </div>
    {past.length>0&&<><div style={{fontSize:11,color:C.muted,textTransform:"uppercase",marginBottom:8}}>Past</div>
    <div style={{display:"grid",gap:6,opacity:0.5}}>{past.slice(-5).reverse().map(ev=>(
      <Card key={ev.id} onClick={()=>openEdit(ev)} style={{padding:10}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:C.muted}}>{ev.title}</span><span style={{fontSize:11,color:C.muted}}>{fmtDate(ev.date)}</span></div></Card>
    ))}</div></>}
    {showM&&<Modal title={sel?"Edit Event":"Add Event"} onClose={()=>setShowM(false)}>
      <Inp label="Event Title" value={form.title||""} onChange={v=>f("title",v)}/>
      <Sel label="Project (optional)" value={form.job_id||""} onChange={v=>f("job_id",v)} options={["",...jobs.map(j=>j.id)]} display={["(No project)",...jobs.map(j=>j.name)]}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        <Inp label="Date" type="date" value={form.date||""} onChange={v=>f("date",v)}/>
        <Inp label="Time" type="time" value={form.time||""} onChange={v=>f("time",v)}/>
      </div>
      <Sel label="Type" value={form.type||"site"} onChange={v=>f("type",v)} options={EVENT_TYPES}/>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:10}}>
        {sel&&<Btn variant="danger" onClick={del}>Delete</Btn>}
        <Btn variant="ghost" onClick={()=>setShowM(false)}>Cancel</Btn><Btn onClick={save}>Save</Btn>
      </div>
    </Modal>}
  </div>;
}

// ── SUBS ──────────────────────────────────────────────────────────────────────
function Subs({subs,setSubs}){
  const [showM,setShowM]=useState(false);const [sel,setSel]=useState(null);const [form,setForm]=useState({});
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  function openNew(){setForm({name:"",trade:"",phone:"",email:"",rating:5,notes:"",active:true});setSel(null);setShowM(true);}
  function openEdit(s){setForm({...s});setSel(s);setShowM(true);}
  async function save(){
    const u={...form,rating:+form.rating||5};
    if(sel){const {data}=await supabase.from("subs").update(u).eq("id",sel.id).select().single();if(data)setSubs(ss=>ss.map(s=>s.id===sel.id?data:s));}
    else{const {data}=await supabase.from("subs").insert(u).select().single();if(data)setSubs(ss=>[...ss,data]);}
    setShowM(false);
  }
  async function del(){await supabase.from("subs").delete().eq("id",sel.id);setSubs(ss=>ss.filter(s=>s.id!==sel.id));setShowM(false);}
  const active=subs.filter(s=>s.active);const inactive=subs.filter(s=>!s.active);
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
      <h1 style={{fontFamily:font,color:C.white,fontSize:26,margin:0}}>Subtrades</h1><Btn onClick={openNew}>+ Add Sub</Btn>
    </div>
    <div style={{display:"grid",gap:10,marginBottom:20}}>{active.map(s=>(
      <Card key={s.id} onClick={()=>openEdit(s)}>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div><div style={{fontWeight:700,color:C.white,fontSize:14}}>{s.name}</div><div style={{fontSize:12,color:C.gold,marginTop:2}}>{s.trade}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{s.phone} · {s.email}</div>{s.notes&&<div style={{fontSize:11,color:C.muted,marginTop:4}}>📝 {s.notes}</div>}</div>
          <div style={{color:C.gold}}>{"★".repeat(s.rating||0)}{"☆".repeat(5-(s.rating||0))}</div>
        </div>
      </Card>
    ))}</div>
    {inactive.length>0&&<><div style={{fontSize:11,color:C.muted,textTransform:"uppercase",marginBottom:8}}>Inactive</div>
    <div style={{display:"grid",gap:8,opacity:0.5}}>{inactive.map(s=>(
      <Card key={s.id} onClick={()=>openEdit(s)} style={{padding:12}}><div style={{fontWeight:600,color:C.muted,fontSize:13}}>{s.name} <span style={{fontWeight:400,fontSize:11}}>· {s.trade}</span></div></Card>
    ))}</div></>}
    {showM&&<Modal title={sel?"Edit Sub":"Add Sub"} onClose={()=>setShowM(false)}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        <Inp label="Name" value={form.name||""} onChange={v=>f("name",v)}/>
        <Inp label="Trade" value={form.trade||""} onChange={v=>f("trade",v)} placeholder="Electrical, Plumbing..."/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        <Inp label="Phone" value={form.phone||""} onChange={v=>f("phone",v)}/>
        <Inp label="Email" value={form.email||""} onChange={v=>f("email",v)} type="email"/>
      </div>
      <Sel label="Rating" value={String(form.rating||5)} onChange={v=>f("rating",+v)} options={["5","4","3","2","1"]} display={["★★★★★","★★★★☆","★★★☆☆","★★☆☆☆","★☆☆☆☆"]}/>
      <Txtarea label="Notes" value={form.notes||""} onChange={v=>f("notes",v)} rows={2}/>
      <div style={{marginBottom:14,padding:"10px 14px",background:C.navy,borderRadius:8,border:`1px solid ${C.border}`}}>
        <Toggle checked={form.active!==false} onChange={v=>f("active",v)} label="Active subtrade"/>
      </div>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:10}}>
        {sel&&<Btn variant="danger" onClick={del}>Delete</Btn>}
        <Btn variant="ghost" onClick={()=>setShowM(false)}>Cancel</Btn><Btn onClick={save}>Save</Btn>
      </div>
    </Modal>}
  </div>;
}

// ── DAILY LOG ─────────────────────────────────────────────────────────────────
function DailyLog({logs,setLogs,jobs}){
  const [showM,setShowM]=useState(false);const [sel,setSel]=useState(null);const [form,setForm]=useState({});
  const [filterJob,setFilterJob]=useState("all");
  const fileRef=useRef(null);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const blank={job_id:"",date:todayStr(),weather:"☀️ Sunny",crew:2,hours:8,notes:"",visible_to_client:false,photos:[]};
  function openNew(){setForm({...blank});setSel(null);setShowM(true);}
  function openEdit(log){setForm({...log,job_id:log.job_id||""});setSel(log);setShowM(true);}
  async function save(){
    const u={...form,crew:+form.crew||0,hours:+form.hours||0,job_id:form.job_id||null,photos:form.photos||[]};
    if(sel){const {data}=await supabase.from("daily_logs").update(u).eq("id",sel.id).select().single();if(data)setLogs(ls=>ls.map(l=>l.id===sel.id?data:l));}
    else{const {data}=await supabase.from("daily_logs").insert(u).select().single();if(data)setLogs(ls=>[data,...ls]);}
    setShowM(false);
  }
  async function del(){await supabase.from("daily_logs").delete().eq("id",sel.id);setLogs(ls=>ls.filter(l=>l.id!==sel.id));setShowM(false);}
  function handlePhotos(e){
    Array.from(e.target.files).forEach(file=>{
      const reader=new FileReader();
      reader.onload=ev=>f("photos",[...(form.photos||[]),{id:Date.now()+Math.random(),name:file.name,url:ev.target.result}]);
      reader.readAsDataURL(file);
    });e.target.value="";
  }
  const sorted=[...logs].sort((a,b)=>b.date?.localeCompare(a.date));
  const filtered=filterJob==="all"?sorted:sorted.filter(l=>String(l.job_id)===filterJob);
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
      <h1 style={{fontFamily:font,color:C.white,fontSize:26,margin:0}}>Daily Log</h1><Btn onClick={openNew}>+ New Entry</Btn>
    </div>
    <div style={{marginBottom:14}}>
      <select value={filterJob} onChange={e=>setFilterJob(e.target.value)} style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:7,padding:"6px 12px",color:C.white,fontSize:12,fontFamily:fb,outline:"none"}}>
        <option value="all">All Projects</option>
        {jobs.map(j=><option key={j.id} value={j.id}>{j.name}</option>)}
      </select>
    </div>
    {filtered.length===0&&<div style={{color:C.muted,textAlign:"center",padding:"40px 0",fontSize:13}}>No log entries yet.</div>}
    <div style={{display:"grid",gap:12}}>
      {filtered.map(log=>{
        const job=jobs.find(j=>j.id===log.job_id);
        return <Card key={log.id} style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <div><div style={{fontWeight:700,color:C.white,fontSize:14}}>{job?.name||"General"}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{fmtDate(log.date)}</div></div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {log.visible_to_client&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"#14532d22",color:"#4ade80"}}>✓ Client visible</span>}
              <Btn size="sm" variant="ghost" onClick={()=>openEdit(log)}>Edit</Btn>
            </div>
          </div>
          <div style={{padding:"10px 16px",display:"flex",gap:22,flexWrap:"wrap",borderBottom:`1px solid ${C.border}`}}>
            <div><div style={{fontSize:10,color:C.muted}}>Weather</div><div style={{fontSize:12,color:C.white,fontWeight:600}}>{log.weather}</div></div>
            <div><div style={{fontSize:10,color:C.muted}}>Crew</div><div style={{fontSize:12,color:C.white,fontWeight:600}}>{log.crew} workers</div></div>
            <div><div style={{fontSize:10,color:C.muted}}>Hours</div><div style={{fontSize:12,color:C.white,fontWeight:600}}>{log.hours}h</div></div>
          </div>
          <div style={{padding:"10px 16px"}}><div style={{fontSize:12,color:C.muted,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{log.notes}</div></div>
          {log.photos&&log.photos.length>0&&(
            <div style={{padding:"0 16px 14px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",gap:6}}>
              {log.photos.map((photo,pi)=>(
                <div key={pi} style={{borderRadius:6,overflow:"hidden",aspectRatio:"1",background:C.border}}>
                  <img src={photo.url||photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                </div>
              ))}
            </div>
          )}
        </Card>;
      })}
    </div>
    {showM&&<Modal title={sel?"Edit Log Entry":"New Log Entry"} onClose={()=>setShowM(false)} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        <Sel label="Project" value={form.job_id||""} onChange={v=>f("job_id",v)} options={["",...jobs.map(j=>j.id)]} display={["(No project)",...jobs.map(j=>j.name)]}/>
        <Inp label="Date" type="date" value={form.date||""} onChange={v=>f("date",v)}/>
      </div>
      <Sel label="Weather" value={form.weather||"☀️ Sunny"} onChange={v=>f("weather",v)} options={WEATHER}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        <Inp label="Crew on Site" type="number" value={form.crew||""} onChange={v=>f("crew",v)}/>
        <Inp label="Hours Worked" type="number" value={form.hours||""} onChange={v=>f("hours",v)}/>
      </div>
      <Txtarea label="What was done today" value={form.notes||""} onChange={v=>f("notes",v)} rows={5}/>
      <div style={{marginBottom:14}}>
        <label style={{display:"block",fontSize:11,color:C.muted,marginBottom:6,textTransform:"uppercase"}}>Photos</label>
        <button onClick={()=>fileRef.current.click()} style={{padding:"8px 14px",background:"transparent",border:`1px dashed ${C.gold}`,borderRadius:7,color:C.gold,fontSize:12,cursor:"pointer",fontFamily:fb}}>📷 Upload Photos</button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handlePhotos}/>
        {(form.photos||[]).length>0&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(70px,1fr))",gap:6,marginTop:10}}>
            {(form.photos||[]).map((photo,pi)=>(
              <div key={pi} style={{position:"relative",borderRadius:6,overflow:"hidden",aspectRatio:"1",background:C.border}}>
                <img src={photo.url||photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                <button onClick={()=>f("photos",(form.photos||[]).filter((_,i)=>i!==pi))} style={{position:"absolute",top:2,right:2,background:"#00000099",border:"none",borderRadius:"50%",width:18,height:18,color:C.white,cursor:"pointer",fontSize:12,lineHeight:"18px",padding:0}}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{marginBottom:14,padding:"12px 14px",background:C.navy,borderRadius:8,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:12,color:C.white,fontWeight:600}}>Visible to Client</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>Client sees this update in their portal</div></div>
          <Toggle checked={form.visible_to_client||false} onChange={v=>f("visible_to_client",v)}/>
        </div>
      </div>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:8}}>
        {sel&&<Btn variant="danger" onClick={del}>Delete</Btn>}
        <Btn variant="ghost" onClick={()=>setShowM(false)}>Cancel</Btn>
        <Btn onClick={save}>Save Entry</Btn>
      </div>
    </Modal>}
  </div>;
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
function Settings(){
  async function handleSignOut(){await supabase.auth.signOut();window.location.href="/";}
  return <div>
    <h1 style={{fontFamily:font,color:C.white,fontSize:26,marginBottom:20}}>Settings</h1>
    <Card style={{marginBottom:16}}>
      <div style={{fontWeight:700,color:C.white,fontSize:15,marginBottom:6}}>Tall Guy Builds Inc.</div>
      <div style={{fontSize:12,color:C.gold,fontWeight:600,letterSpacing:1}}>BUILT RIGHT.</div>
      <div style={{fontSize:12,color:C.gold,fontWeight:600,letterSpacing:1}}>DESIGNED TO LAST.</div>
      <div style={{fontSize:11,color:C.muted,marginTop:8}}>Regina, Saskatchewan</div>
    </Card>
    <Card>
      <div style={{fontWeight:600,color:C.white,fontSize:14,marginBottom:10}}>Account</div>
      <Btn variant="danger" onClick={handleSignOut}>Sign Out</Btn>
    </Card>
  </div>;
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
const NAV=[
  {id:"dashboard",label:"Dashboard",icon:"▣"},
  {id:"jobs",label:"Projects",icon:"⬡"},
  {id:"leads",label:"Pipeline",icon:"◎"},
  {id:"schedule",label:"Schedule",icon:"▦"},
  {id:"subs",label:"Subtrades",icon:"◆"},
  {id:"logs",label:"Daily Log",icon:"📋"},
  {id:"portal",label:"Client Portal",icon:"◈"},
  {id:"settings",label:"Settings",icon:"⚙"},
];

export default function App(){
  const [page,setPage]=useState("dashboard");
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [jobs,setJobs]=useState([]);
  const [leads,setLeads]=useState([]);
  const [subs,setSubs]=useState([]);
  const [events,setEvents]=useState([]);
  const [logs,setLogs]=useState([]);

  useEffect(()=>{
    async function load(){
      try{
        const [j,l,s,e,lg]=await Promise.all([
          supabase.from("jobs").select("*").order("created_at",{ascending:false}),
          supabase.from("leads").select("*").order("created_at",{ascending:false}),
          supabase.from("subs").select("*").order("name"),
          supabase.from("events").select("*").order("date"),
          supabase.from("daily_logs").select("*").order("date",{ascending:false}),
        ]);
        if(j.error)throw j.error;
        setJobs(j.data||[]);setLeads(l.data||[]);setSubs(s.data||[]);setEvents(e.data||[]);setLogs(lg.data||[]);
      }catch(err){setError("Could not connect to database: "+err.message);}
      finally{setLoading(false);}
    }
    load();
  },[]);

  if(loading)return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:C.gold,fontFamily:font,fontSize:18}}>Loading...</div>;
  if(error)return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:C.danger,fontFamily:fb,fontSize:14,padding:24,textAlign:"center"}}>{error}</div>;

  return <div style={{background:C.bg,minHeight:"100vh",display:"flex",fontFamily:fb}}>
    <div style={{width:220,background:C.navy,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,height:"100vh",zIndex:100}}>
      <div style={{padding:"20px 16px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src="https://tallguybuilds.ca/assets/img-002.webp" alt="TGB" style={{width:40,height:40,borderRadius:8,objectFit:"cover"}}/>
          <div>
            <div style={{color:C.white,fontWeight:700,fontSize:13,fontFamily:font}}>Tall Guy Builds</div>
            <div style={{color:C.gold,fontSize:9,letterSpacing:1,fontWeight:600}}>BUILT RIGHT.</div>
            <div style={{color:C.gold,fontSize:9,letterSpacing:1,fontWeight:600}}>DESIGNED TO LAST.</div>
          </div>
        </div>
      </div>
      <nav style={{flex:1,padding:"12px 8px",overflowY:"auto"}}>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>setPage(n.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",borderRadius:8,border:"none",background:page===n.id?C.gold+"22":"transparent",color:page===n.id?C.gold:C.muted,fontFamily:fb,fontSize:13,fontWeight:page===n.id?700:400,cursor:"pointer",textAlign:"left",marginBottom:2,transition:"all 0.1s"}}>
            <span style={{fontSize:14}}>{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>
    </div>
    <div style={{marginLeft:220,flex:1,padding:24,boxSizing:"border-box"}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        {page==="dashboard"&&<DashboardView jobs={jobs} leads={leads} logs={logs} setPage={setPage}/>}
        {page==="jobs"&&<Jobs jobs={jobs} setJobs={setJobs}/>}
        {page==="leads"&&<Leads leads={leads} setLeads={setLeads}/>}
        {page==="schedule"&&<Schedule events={events} setEvents={setEvents} jobs={jobs}/>}
        {page==="subs"&&<Subs subs={subs} setSubs={setSubs}/>}
        {page==="logs"&&<DailyLog logs={logs} setLogs={setLogs} jobs={jobs}/>}
        {page==="portal"&&<ClientPortal jobs={jobs} logs={logs}/>}
        {page==="settings"&&<Settings/>}
      </div>
    </div>
  </div>;
}
