import { useState, useRef, useEffect } from "react";

const C={navy:"#1F2A37",navyLight:"#2C3E50",gold:"#C8A96A",muted:"#6B7280",border:"#2E3D4F",warn:"#F59E0B",danger:"#EF4444",white:"#FFFFFF",bg:"#16212E",success:"#4CAF50"};
const font="system-ui,-apple-system,sans-serif";
const fb="system-ui,-apple-system,sans-serif";
const fmt$=v=>`$${Number(v).toLocaleString()}`;
const fmtDate=d=>d?new Date(d+"T12:00:00").toLocaleDateString("en-CA",{month:"short",day:"numeric",year:"numeric"}):"—";
const todayStr=()=>new Date().toISOString().slice(0,10);
const WEATHER=["☀️ Sunny","⛅ Partly Cloudy","☁️ Overcast","🌧️ Rain","❄️ Snow","🌨️ Blowing Snow","🌬️ Windy","🌡️ Extreme Cold"];
const LOGO="data:image/png;base64,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";

const initClients=[
  {id:1,name:"Priya Sharma",phone:"306-555-0420",email:"priya@example.com",notes:"Referred by Mike T."},
  {id:2,name:"Dave Kowalski",phone:"306-555-0771",email:"dave@example.com",notes:"Seen 3 other builders"},
  {id:3,name:"Brian Wilson",phone:"306-555-0199",email:"brian@example.com",notes:"Long-time client"},
];
const initJobs=[
  {id:1,name:"Addison Basement Dev",clientId:1,address:"3518 Green Creek Rd",type:"Basement Development",status:"Active",value:12000,paid:6000,startDate:"2026-02-03",endDate:"2026-04-15",progress:35,notes:"Framing phase underway",sharedWithClient:true,
    milestones:[{id:1,name:"Demo & Prep",status:"Completed",date:"2026-02-10",order:0},{id:2,name:"Framing",status:"In Progress",date:"2026-02-24",order:1},{id:3,name:"Electrical Rough-in",status:"Not Started",date:"2026-03-05",order:2},{id:4,name:"Plumbing Rough-in",status:"Not Started",date:"2026-03-10",order:3},{id:5,name:"Insulation & Drywall",status:"Not Started",date:"2026-03-20",order:4},{id:6,name:"Finishing & Paint",status:"Not Started",date:"2026-04-05",order:5},{id:7,name:"Final Inspection",status:"Not Started",date:"2026-04-15",order:6}],
    docs:[{name:"Approved Estimate.pdf",size:"142 KB",date:"2026-01-15"},{name:"Signed Contract.pdf",size:"88 KB",date:"2026-01-20"}]},
  {id:2,name:"Kowalski Garage",clientId:2,address:"742 Henderson Dr",type:"Garage",status:"Upcoming",value:32000,paid:9600,startDate:"2026-04-20",endDate:"2026-06-30",progress:0,notes:"Permit submitted",sharedWithClient:true,
    milestones:[{id:1,name:"Permit Approval",status:"In Progress",date:"2026-04-10",order:0},{id:2,name:"Site Prep & Foundation",status:"Not Started",date:"2026-04-20",order:1},{id:3,name:"Framing",status:"Not Started",date:"2026-05-05",order:2},{id:4,name:"Roofing",status:"Not Started",date:"2026-05-20",order:3},{id:5,name:"Electrical & Doors",status:"Not Started",date:"2026-06-10",order:4},{id:6,name:"Finishing",status:"Not Started",date:"2026-06-25",order:5}],
    docs:[{name:"Approved Estimate.pdf",size:"98 KB",date:"2026-02-01"}]},
  {id:3,name:"Wilson Deck Replacement",clientId:3,address:"88 Lakeview Cres",type:"Deck",status:"Completed",value:14200,paid:14200,startDate:"2025-09-01",endDate:"2025-10-10",progress:100,notes:"Holdback released",sharedWithClient:true,
    milestones:[{id:1,name:"Demo Old Deck",status:"Completed",date:"2025-09-03",order:0},{id:2,name:"New Posts & Framing",status:"Completed",date:"2025-09-15",order:1},{id:3,name:"Decking & Rails",status:"Completed",date:"2025-09-28",order:2},{id:4,name:"Stairs & Finishing",status:"Completed",date:"2025-10-08",order:3}],docs:[]},
  {id:4,name:"Sharma Deck Addition",clientId:1,address:"3518 Green Creek Rd",type:"Deck",status:"Upcoming",value:8500,paid:0,startDate:"2026-05-01",endDate:"2026-05-25",progress:0,notes:"Adding deck off main floor",sharedWithClient:false,
    milestones:[{id:1,name:"Material Order",status:"Not Started",date:"2026-04-20",order:0},{id:2,name:"Footings",status:"Not Started",date:"2026-05-01",order:1},{id:3,name:"Framing & Decking",status:"Not Started",date:"2026-05-10",order:2},{id:4,name:"Rails & Stairs",status:"Not Started",date:"2026-05-22",order:3}],docs:[]},
];
const initLeads=[
  {id:1,name:"Mike Thornton",phone:"306-555-0192",email:"mike@example.com",type:"Deck",value:18500,stage:"New",notes:"Referred by Sarah H.",date:"2026-02-15"},
  {id:2,name:"Carla Jensen",phone:"306-555-0344",email:"carla@example.com",type:"Basement",value:45000,stage:"Quoted",notes:"Looking to start April",date:"2026-02-10"},
  {id:3,name:"Dave Kowalski",phone:"306-555-0771",email:"dave@example.com",type:"Garage",value:32000,stage:"Won",notes:"Signed contract",date:"2026-02-08"},
  {id:4,name:"Priya Sharma",phone:"306-555-0420",email:"priya@example.com",type:"Bathroom",value:12000,stage:"Won",notes:"Start Mar 3",date:"2026-01-28"},
];
const initSubs=[
  {id:1,name:"Rick Paulson",trade:"Electrical",phone:"306-555-0811",email:"rick@paulsonelectric.ca",rating:5,notes:"Go-to for all electrical",active:true},
  {id:2,name:"Torres Plumbing",trade:"Plumbing",phone:"306-555-0234",email:"info@torresplumbing.ca",rating:4,notes:"Good but books up fast",active:true},
  {id:3,name:"Flatland Concrete",trade:"Concrete",phone:"306-555-0567",email:"jobs@flatland.ca",rating:5,notes:"Best prices in the city",active:true},
  {id:4,name:"Kyle Drywall",trade:"Drywall",phone:"306-555-0399",email:"kyle@kyledrywall.com",rating:3,notes:"Inconsistent finish quality",active:false},
];
const initEvents=[
  {id:1,title:"Addison – Framing Inspection",jobId:1,date:"2026-02-24",time:"10:00",type:"inspection"},
  {id:2,title:"Kowalski – Site Measure",jobId:2,date:"2026-02-26",time:"14:00",type:"site"},
  {id:3,title:"Thornton – Quote Walkthrough",jobId:null,date:"2026-02-28",time:"11:00",type:"quote"},
  {id:4,title:"Rick – Electrical Rough-in",jobId:1,date:"2026-03-05",time:"08:00",type:"sub"},
  {id:5,title:"Kowalski Garage Start",jobId:2,date:"2026-04-20",time:"08:00",type:"site"},
];
const initLogs=[
  {id:1,jobId:1,date:"2026-02-20",weather:"☀️ Sunny",crew:3,hours:8,notes:"Completed interior framing on north and east walls. Started blocking for electrical. All plumb and square.",visibleToClient:true,photos:[]},
  {id:2,jobId:1,date:"2026-02-21",weather:"❄️ Snow",crew:2,hours:6,notes:"Snow slowed material delivery. Continued framing south wall. Crew of 2 due to weather.",visibleToClient:false,photos:[]},
];


const initChangeOrders=[
  {id:1,jobId:1,title:"Additional pot lights in rec room",amount:850,status:"Approved",dateRequested:"2026-02-15",dateApproved:"2026-02-16",notes:"Client wants 6 more pot lights in rec room"},
  {id:2,jobId:1,title:"Move bathroom location 4ft east",amount:1200,status:"Pending",dateRequested:"2026-02-22",dateApproved:"",notes:"Requires additional plumbing rough-in"},
  {id:3,jobId:2,title:"Upgrade to insulated steel door",amount:650,status:"Approved",dateRequested:"2026-02-10",dateApproved:"2026-02-12",notes:"Upgrade from basic to insulated"},
];
const initCosts=[
  {id:1,jobId:1,category:"Materials",description:"Lumber & framing materials",amount:2800,date:"2026-02-10"},
  {id:2,jobId:1,category:"Materials",description:"Electrical rough-in materials",amount:420,date:"2026-02-18"},
  {id:3,jobId:1,category:"Subcontractor",description:"Rick Paulson – Electrical rough-in",amount:1400,date:"2026-03-05"},
  {id:4,jobId:1,category:"Subcontractor",description:"Torres Plumbing – Rough-in",amount:1100,date:"2026-03-10"},
  {id:5,jobId:1,category:"Other",description:"Permit fees",amount:320,date:"2026-02-03"},
  {id:6,jobId:2,category:"Materials",description:"Concrete & rebar",amount:4200,date:"2026-04-20"},
  {id:7,jobId:2,category:"Subcontractor",description:"Flatland Concrete – foundation",amount:3800,date:"2026-04-22"},
];
const CO_STATUSES=["Pending","Approved","Rejected"];
const COST_CATEGORIES=["Materials","Subcontractor","Equipment","Permit","Other"];
const LEAD_STAGES=["New","Quoted","Follow-up","Won","Lost"];
const JOB_STATUSES=["Upcoming","Active","Completed","On Hold"];
const EVENT_TYPES=["inspection","site","quote","sub","meeting","other"];
const EC={inspection:C.warn,site:C.gold,quote:"#60A5FA",sub:C.success,meeting:"#C084FC",other:C.muted};

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

function Milestones({job,onUpdate}){
  const [items,setItems]=useState(job.milestones||[]);
  const [nm,setNm]=useState("");const [nd,setNd]=useState("");
  const drag=useRef(null);
  function save(u){setItems(u);onUpdate(u);}
  function toggle(id){save(items.map(m=>m.id!==id?m:{...m,status:m.status==="Completed"?"Not Started":m.status==="Not Started"?"In Progress":"Completed"}));}
  function add(){if(!nm.trim())return;save([...items,{id:Date.now(),name:nm.trim(),date:nd,status:"Not Started",order:items.length}]);setNm("");setNd("");}
  function del(id){save(items.filter(m=>m.id!==id));}
  const icon={"Completed":"✅","In Progress":"🔄","Not Started":"○"};
  return <div>
    <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Drag ⠿ to reorder · click icon to cycle status</div>
    {items.length===0&&<div style={{color:C.muted,textAlign:"center",padding:"14px 0",fontSize:12}}>No milestones yet.</div>}
    {items.map((m,i)=>(
      <div key={m.id} draggable
        onDragStart={()=>{drag.current=i;}}
        onDragOver={e=>{e.preventDefault();if(drag.current===null||drag.current===i)return;const u=[...items];const[mv]=u.splice(drag.current,1);u.splice(i,0,mv);drag.current=i;save(u.map((x,idx)=>({...x,order:idx})));}}
        onDragEnd={()=>{drag.current=null;}}
        style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:7,marginBottom:5,background:m.status==="Completed"?"#14532d22":m.status==="In Progress"?C.gold+"11":C.navy,border:`1px solid ${m.status==="Completed"?"#4ade8033":m.status==="In Progress"?C.gold+"44":C.border}`,cursor:"grab"}}>
        <span style={{color:C.muted,fontSize:13,userSelect:"none"}}>⠿</span>
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

function Gantt({jobs}){
  const active=jobs.filter(j=>j.startDate&&j.endDate&&j.status!=="Completed");
  if(active.length===0)return <div style={{color:C.muted,textAlign:"center",padding:28,fontSize:12}}>No active/upcoming projects with dates.</div>;
  const allD=active.flatMap(j=>[new Date(j.startDate),new Date(j.endDate)]);
  const mn=new Date(Math.min(...allD));mn.setDate(mn.getDate()-7);
  const mx=new Date(Math.max(...allD));mx.setDate(mx.getDate()+14);
  const total=Math.ceil((mx-mn)/86400000);
  const months=[];let cur=new Date(mn);
  while(cur<mx){const me=new Date(cur.getFullYear(),cur.getMonth()+1,0);const s=Math.max(0,Math.ceil((new Date(cur.getFullYear(),cur.getMonth(),1)-mn)/86400000));const e=Math.min(total,Math.ceil((me-mn)/86400000));months.push({label:cur.toLocaleDateString("en-CA",{month:"short",year:"2-digit"}),width:e-s});cur=new Date(cur.getFullYear(),cur.getMonth()+1,1);}
  const CELL=26,ROW=42,LEFT=170;
  const todayOff=Math.ceil((new Date()-mn)/86400000);
  const BAR={Active:C.gold,Upcoming:"#60A5FA","On Hold":C.warn};
  return <div style={{overflowX:"auto"}}><div style={{minWidth:LEFT+total*CELL}}>
    <div style={{display:"flex",marginLeft:LEFT,marginBottom:3}}>{months.map((m,i)=><div key={i} style={{width:m.width*CELL,fontSize:10,color:C.muted,borderLeft:`1px solid ${C.border}`,paddingLeft:4,flexShrink:0}}>{m.label}</div>)}</div>
    <div style={{position:"relative"}}>
      {todayOff>0&&todayOff<total&&<div style={{position:"absolute",left:LEFT+todayOff*CELL,top:0,bottom:0,width:2,background:C.danger,zIndex:10,opacity:0.8}}><div style={{position:"absolute",top:-14,left:-10,background:C.danger,color:C.white,fontSize:9,padding:"1px 4px",borderRadius:3,whiteSpace:"nowrap"}}>TODAY</div></div>}
      {active.map(job=>{
        const js=Math.ceil((new Date(job.startDate)-mn)/86400000);
        const je=Math.ceil((new Date(job.endDate)-mn)/86400000);
        const jw=Math.max(1,je-js);
        const bc=BAR[job.status]||C.muted;
        return <div key={job.id} style={{display:"flex",alignItems:"center",height:ROW,borderBottom:`1px solid ${C.border}`}}>
          <div style={{width:LEFT,flexShrink:0,paddingRight:8}}>
            <div style={{fontSize:11,fontWeight:600,color:C.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{job.name}</div>
            <div style={{fontSize:10,color:C.muted}}>{job._clientName||""}</div>
          </div>
          <div style={{position:"relative",flex:1,height:ROW,display:"flex",alignItems:"center"}}>
            {Array.from({length:total}).map((_,d)=><div key={d} style={{position:"absolute",left:d*CELL,width:CELL,height:ROW,borderLeft:d%7===0?`1px solid ${C.border}`:"none"}}/>)}
            <div style={{position:"absolute",left:js*CELL,width:jw*CELL,height:20,background:bc+"33",border:`1px solid ${bc}`,borderRadius:4,overflow:"hidden",display:"flex",alignItems:"center",paddingLeft:4}}>
              <div style={{width:`${job.progress}%`,height:"100%",position:"absolute",left:0,top:0,background:bc+"55"}}/>
              <span style={{position:"relative",fontSize:9,color:C.white,fontWeight:700}}>{job.progress}%</span>
            </div>
            {(job.milestones||[]).filter(m=>m.date).map(m=>{
              const off=Math.ceil((new Date(m.date)-mn)/86400000);
              if(off<0||off>total)return null;
              const mc=m.status==="Completed"?"#4ade80":m.status==="In Progress"?C.gold:C.muted;
              return <div key={m.id} title={`${m.name} — ${fmtDate(m.date)}`} style={{position:"absolute",left:off*CELL-5,width:10,height:10,background:mc,transform:"rotate(45deg)",borderRadius:2,zIndex:5}}/>;
            })}
          </div>
        </div>;
      })}
    </div>
  </div></div>;
}

function Dashboard({jobs,leads,clients,logs,setPage}){
  const active=jobs.filter(j=>j.status==="Active");
  const pipe=leads.filter(l=>!["Won","Lost"].includes(l.stage)).reduce((s,l)=>s+l.value,0);
  const out=jobs.reduce((s,j)=>s+(j.value-j.paid),0);
  const won=leads.filter(l=>l.stage==="Won").reduce((s,l)=>s+l.value,0);
  const getClient=id=>clients.find(c=>c.id===id);
  const recentLogs=[...logs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
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
      {active.map(job=>{
        const cl=getClient(job.clientId);
        const done=job.milestones.filter(m=>m.status==="Completed").length;
        const tot=job.milestones.length;
        return <Card key={job.id} onClick={()=>setPage("jobs")}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:7}}>
            <div><div style={{fontWeight:700,color:C.white,fontSize:14}}>{job.name}</div><div style={{color:C.muted,fontSize:11,marginTop:1}}>{cl?.name} · {job.address}</div></div>
            <Badge label={job.status}/>
          </div>
          <div style={{marginTop:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:3}}><span>{done}/{tot} milestones</span><span>{job.progress}%</span></div>
            <div style={{background:C.border,borderRadius:4,height:5}}><div style={{background:C.gold,borderRadius:4,height:5,width:`${job.progress}%`,transition:"width 0.5s"}}/></div>
          </div>
        </Card>;
      })}
    </div>
    {recentLogs.length>0&&<><h2 style={{fontFamily:font,color:C.white,fontSize:17,marginBottom:10}}>Recent Site Logs</h2>
    <div style={{display:"grid",gap:9,marginBottom:22}}>
      {recentLogs.map(log=>{const job=jobs.find(j=>j.id===log.jobId);return(
        <Card key={log.id} onClick={()=>setPage("logs")} style={{padding:13}}>
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:7}}>
            <div>
              <div style={{fontWeight:700,color:C.white,fontSize:13}}>{job?.name||"General"}</div>
              <div style={{color:C.muted,fontSize:11,marginTop:2}}>{fmtDate(log.date)} · {log.weather} · {log.crew} crew · {log.hours}h</div>
              <div style={{color:C.muted,fontSize:11,marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:280}}>{log.notes}</div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"flex-start",flexShrink:0}}>
              {log.photos.length>0&&<span style={{fontSize:10,color:C.muted}}>📷 {log.photos.length}</span>}
              {log.visibleToClient&&<span style={{fontSize:10,color:"#4ade80"}}>✓ Client</span>}
            </div>
          </div>
        </Card>
      );})}
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

function Clients({clients,setClients,jobs}){
  const [showM,setShowM]=useState(false);const [sel,setSel]=useState(null);const [form,setForm]=useState({});
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  function openNew(){setForm({name:"",phone:"",email:"",notes:""});setSel(null);setShowM(true);}
  function openEdit(c){setForm({...c});setSel(c);setShowM(true);}
  function save(){const u={...form};if(sel)setClients(cs=>cs.map(c=>c.id===sel.id?{...u,id:c.id}:c));else setClients(cs=>[...cs,{...u,id:Date.now()}]);setShowM(false);}
  function del(){if(!sel)return;setClients(cs=>cs.filter(c=>c.id!==sel.id));setShowM(false);}
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
      <h1 style={{fontFamily:font,color:C.white,fontSize:26,margin:0}}>Clients</h1><Btn onClick={openNew}>+ Add Client</Btn>
    </div>
    <div style={{display:"grid",gap:10}}>
      {clients.map(c=>{const cJobs=jobs.filter(j=>j.clientId===c.id);return(
        <Card key={c.id} onClick={()=>openEdit(c)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontWeight:700,color:C.white,fontSize:15}}>{c.name}</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{c.phone} · {c.email}</div>
              {c.notes&&<div style={{fontSize:11,color:C.muted,marginTop:4}}>📝 {c.notes}</div>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:5}}>{cJobs.length} project{cJobs.length!==1?"s":""}</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}>{cJobs.map(j=><Badge key={j.id} label={j.status}/>)}</div>
            </div>
          </div>
          {cJobs.length>0&&<div style={{marginTop:10,display:"flex",gap:5,flexWrap:"wrap"}}>{cJobs.map(j=><span key={j.id} style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:C.navy,color:C.muted,border:`1px solid ${C.border}`}}>{j.name}</span>)}</div>}
        </Card>
      );})}
    </div>
    {showM&&<Modal title={sel?"Edit Client":"Add Client"} onClose={()=>setShowM(false)}>
      <Inp label="Full Name" value={form.name||""} onChange={v=>f("name",v)}/>
      <Inp label="Phone" value={form.phone||""} onChange={v=>f("phone",v)}/>
      <Inp label="Email" value={form.email||""} onChange={v=>f("email",v)} type="email"/>
      <Inp label="Notes" value={form.notes||""} onChange={v=>f("notes",v)} placeholder="Referral source, preferences..."/>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:10}}>
        {sel&&<Btn variant="danger" onClick={del}>Delete</Btn>}
        <Btn variant="ghost" onClick={()=>setShowM(false)}>Cancel</Btn><Btn onClick={save}>Save</Btn>
      </div>
    </Modal>}
  </div>;
}

function DailyLog({logs,setLogs,jobs,clients}){
  const [showM,setShowM]=useState(false);const [sel,setSel]=useState(null);const [form,setForm]=useState({});
  const [lightbox,setLightbox]=useState(null);const [filterJob,setFilterJob]=useState("all");
  const fileRef=useRef(null);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const blank={jobId:"",date:todayStr(),weather:"☀️ Sunny",crew:2,hours:8,notes:"",visibleToClient:false,photos:[]};
  function openNew(){setForm({...blank});setSel(null);setShowM(true);}
  function openEdit(log){setForm({...log,jobId:log.jobId||""});setSel(log);setShowM(true);}
  function save(){const u={...form,crew:+form.crew,hours:+form.hours,jobId:form.jobId?+form.jobId:null};if(sel)setLogs(ls=>ls.map(l=>l.id===sel.id?{...u,id:l.id}:l));else setLogs(ls=>[{...u,id:Date.now()},...ls]);setShowM(false);}
  function del(){if(!sel)return;setLogs(ls=>ls.filter(l=>l.id!==sel.id));setShowM(false);}
  function handlePhotos(e){
    Array.from(e.target.files).forEach(file=>{
      const reader=new FileReader();
      reader.onload=ev=>f("photos",[...(form.photos||[]),{id:Date.now()+Math.random(),name:file.name,url:ev.target.result}]);
      reader.readAsDataURL(file);
    });
    e.target.value="";
  }
  function removePhoto(id){f("photos",(form.photos||[]).filter(p=>p.id!==id));}
  const sorted=[...logs].sort((a,b)=>b.date.localeCompare(a.date));
  const filtered=filterJob==="all"?sorted:sorted.filter(l=>String(l.jobId)===filterJob);
  const getClient=id=>clients.find(c=>c.id===id);
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
      <h1 style={{fontFamily:font,color:C.white,fontSize:26,margin:0}}>Daily Log</h1>
      <Btn onClick={openNew}>+ New Entry</Btn>
    </div>
    <div style={{marginBottom:14,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
      <label style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>Project:</label>
      <select value={filterJob} onChange={e=>setFilterJob(e.target.value)} style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:7,padding:"6px 12px",color:C.white,fontSize:12,fontFamily:fb,outline:"none",cursor:"pointer"}}>
        <option value="all">All Projects</option>
        {jobs.map(j=><option key={j.id} value={j.id}>{j.name}</option>)}
      </select>
      {filterJob!=="all"&&<button onClick={()=>setFilterJob("all")} style={{fontSize:11,color:C.muted,background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Clear</button>}
    </div>
    {filtered.length===0&&<div style={{color:C.muted,textAlign:"center",padding:"40px 0",fontSize:13}}>No log entries yet. Hit "+ New Entry" to start your paper trail.</div>}
    <div style={{display:"grid",gap:12}}>
      {filtered.map(log=>{
        const job=jobs.find(j=>j.id===log.jobId);
        const cl=job?getClient(job.clientId):null;
        return <Card key={log.id} style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontWeight:700,color:C.white,fontSize:14}}>{job?.name||"General"}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{fmtDate(log.date)}{cl?` · ${cl.name}`:""}</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              {log.visibleToClient&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"#14532d22",color:"#4ade80"}}>✓ Client visible</span>}
              <Btn size="sm" variant="ghost" onClick={()=>openEdit(log)}>Edit</Btn>
            </div>
          </div>
          <div style={{padding:"10px 16px",display:"flex",gap:22,flexWrap:"wrap",borderBottom:`1px solid ${C.border}`}}>
            {[{e:"🌤",l:"Weather",v:log.weather},{e:"👷",l:"Crew",v:`${log.crew} workers`},{e:"⏱",l:"Hours",v:`${log.hours}h on site`}].map(s=>(
              <div key={s.l}><div style={{fontSize:10,color:C.muted,marginBottom:2}}>{s.e} {s.l}</div><div style={{fontSize:12,color:C.white,fontWeight:600}}>{s.v}</div></div>
            ))}
          </div>
          <div style={{padding:"10px 16px"}}>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{log.notes||<span style={{fontStyle:"italic"}}>No notes.</span>}</div>
          </div>
          {log.photos&&log.photos.length>0&&(
            <div style={{padding:"0 16px 14px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",gap:6}}>
              {log.photos.map(photo=>(
                <div key={photo.id} onClick={()=>setLightbox(photo)} style={{cursor:"pointer",borderRadius:6,overflow:"hidden",aspectRatio:"1",background:C.border}}>
                  <img src={photo.url} alt={photo.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                </div>
              ))}
            </div>
          )}
        </Card>;
      })}
    </div>
    {lightbox&&<div onClick={()=>setLightbox(null)} style={{position:"fixed",inset:0,background:"#000000CC",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"zoom-out"}}>
      <img src={lightbox.url} alt={lightbox.name} style={{maxWidth:"100%",maxHeight:"90vh",borderRadius:8,boxShadow:"0 0 60px #000"}}/>
      <div style={{position:"absolute",bottom:24,color:C.muted,fontSize:12}}>click to close</div>
    </div>}
    {showM&&<Modal title={sel?"Edit Log Entry":"New Log Entry"} onClose={()=>setShowM(false)} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        <Sel label="Project" value={form.jobId||""} onChange={v=>f("jobId",v)} options={["",...jobs.map(j=>j.id)]} display={["(No project)",...jobs.map(j=>j.name)]}/>
        <Inp label="Date" type="date" value={form.date||""} onChange={v=>f("date",v)}/>
      </div>
      <Sel label="Weather" value={form.weather||"☀️ Sunny"} onChange={v=>f("weather",v)} options={WEATHER}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        <Inp label="Crew on Site" type="number" value={form.crew||""} onChange={v=>f("crew",v)}/>
        <Inp label="Hours Worked" type="number" value={form.hours||""} onChange={v=>f("hours",v)}/>
      </div>
      <Txtarea label="What was done today" value={form.notes||""} onChange={v=>f("notes",v)} placeholder="Work completed, issues, materials used..." rows={5}/>
      <div style={{marginBottom:14}}>
        <label style={{display:"block",fontSize:11,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>Photos</label>
        <button onClick={()=>fileRef.current.click()} style={{padding:"8px 14px",background:"transparent",border:`1px dashed ${C.gold}`,borderRadius:7,color:C.gold,fontSize:12,cursor:"pointer",fontFamily:fb}}>📷 Upload Photos</button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handlePhotos}/>
        {(form.photos||[]).length>0&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(70px,1fr))",gap:6,marginTop:10}}>
            {(form.photos||[]).map(photo=>(
              <div key={photo.id} style={{position:"relative",borderRadius:6,overflow:"hidden",aspectRatio:"1",background:C.border}}>
                <img src={photo.url} alt={photo.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                <button onClick={()=>removePhoto(photo.id)} style={{position:"absolute",top:2,right:2,background:"#00000099",border:"none",borderRadius:"50%",width:18,height:18,color:C.white,cursor:"pointer",fontSize:12,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{marginBottom:14,padding:"12px 14px",background:C.navy,borderRadius:8,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:12,color:C.white,fontWeight:600}}>Visible to Client</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>Client sees this entry and photos in their portal</div>
          </div>
          <Toggle checked={form.visibleToClient||false} onChange={v=>f("visibleToClient",v)}/>
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


// ── CHANGE ORDERS ─────────────────────────────────────────────────────────────
function ChangeOrders({job,changeOrders,setChangeOrders}){
  const jobCOs=changeOrders.filter(c=>c.jobId===job.id);
  const [showM,setShowM]=useState(false);const [sel,setSel]=useState(null);const [form,setForm]=useState({});
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const approved=jobCOs.filter(c=>c.status==="Approved").reduce((s,c)=>s+c.amount,0);
  const pending=jobCOs.filter(c=>c.status==="Pending").reduce((s,c)=>s+c.amount,0);
  function openNew(){setForm({title:"",amount:"",status:"Pending",dateRequested:todayStr(),dateApproved:"",notes:""});setSel(null);setShowM(true);}
  function openEdit(c){setForm({...c,amount:String(c.amount)});setSel(c);setShowM(true);}
  function save(){const u={...form,amount:+form.amount,jobId:job.id};if(sel)setChangeOrders(cs=>cs.map(c=>c.id===sel.id?{...u,id:c.id}:c));else setChangeOrders(cs=>[...cs,{...u,id:Date.now()}]);setShowM(false);}
  function del(){setChangeOrders(cs=>cs.filter(c=>c.id!==sel.id));setShowM(false);}
  const SC={Approved:{bg:"#14532d22",t:"#4ade80"},Pending:{bg:"#78350f22",t:C.warn},Rejected:{bg:"#7f1d1d22",t:"#F87171"}};
  return <div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:14}}>
      {[{label:"Original Contract",val:fmt$(job.value),c:C.white},{label:"Approved Changes",val:fmt$(approved),c:"#4ade80"},{label:"Revised Contract",val:fmt$(job.value+approved),c:C.gold},{label:"Pending Changes",val:fmt$(pending),c:C.warn}].map(k=>(
        <Card key={k.label} style={{padding:11,gridColumn:k.label==="Revised Contract"?"span 1":undefined}}>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",marginBottom:3}}>{k.label}</div>
          <div style={{fontFamily:font,fontSize:16,color:k.c}}>{k.val}</div>
        </Card>
      ))}
    </div>
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}><Btn onClick={openNew}>+ New Change Order</Btn></div>
    {jobCOs.length===0&&<div style={{color:C.muted,textAlign:"center",padding:"28px 0",fontSize:12}}>No change orders yet. Add one when scope changes.</div>}
    {jobCOs.map(co=>{const s=SC[co.status]||{bg:"#1c1c1c",t:C.muted};return(
      <Card key={co.id} onClick={()=>openEdit(co)} style={{marginBottom:8,padding:13,borderLeft:`3px solid ${s.t}`}}>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,color:C.white,fontSize:13}}>{co.title}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>Requested: {fmtDate(co.dateRequested)}{co.dateApproved?` · Approved: ${fmtDate(co.dateApproved)}`:""}</div>
            {co.notes&&<div style={{fontSize:11,color:C.muted,marginTop:4}}>📝 {co.notes}</div>}
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{color:C.gold,fontWeight:700,fontSize:15,marginBottom:4}}>+{fmt$(co.amount)}</div>
            <span style={{fontSize:10,padding:"2px 9px",borderRadius:10,background:s.bg,color:s.t}}>{co.status}</span>
          </div>
        </div>
      </Card>
    );})}
    {showM&&<Modal title={sel?"Edit Change Order":"New Change Order"} onClose={()=>setShowM(false)}>
      <Inp label="Description" value={form.title||""} onChange={v=>f("title",v)} placeholder="e.g. Add pot lights in rec room"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        <Inp label="Amount ($)" type="number" value={form.amount||""} onChange={v=>f("amount",v)}/>
        <Sel label="Status" value={form.status||"Pending"} onChange={v=>f("status",v)} options={CO_STATUSES}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        <Inp label="Date Requested" type="date" value={form.dateRequested||""} onChange={v=>f("dateRequested",v)}/>
        <Inp label="Date Approved" type="date" value={form.dateApproved||""} onChange={v=>f("dateApproved",v)}/>
      </div>
      <Txtarea label="Notes" value={form.notes||""} onChange={v=>f("notes",v)} rows={3} placeholder="Scope details, reason for change..."/>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:10}}>
        {sel&&<Btn variant="danger" onClick={del}>Delete</Btn>}
        <Btn variant="ghost" onClick={()=>setShowM(false)}>Cancel</Btn><Btn onClick={save}>Save</Btn>
      </div>
    </Modal>}
  </div>;
}

// ── JOB COSTING ───────────────────────────────────────────────────────────────
function JobCosting({job,costs,setCosts}){
  const jobCosts=costs.filter(c=>c.jobId===job.id);
  const [showM,setShowM]=useState(false);const [sel,setSel]=useState(null);const [form,setForm]=useState({});
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  function openNew(){setForm({category:"Materials",description:"",amount:"",date:todayStr()});setSel(null);setShowM(true);}
  function openEdit(c){setForm({...c,amount:String(c.amount)});setSel(c);setShowM(true);}
  function save(){const u={...form,amount:+form.amount,jobId:job.id};if(sel)setCosts(cs=>cs.map(c=>c.id===sel.id?{...u,id:c.id}:c));else setCosts(cs=>[...cs,{...u,id:Date.now()}]);setShowM(false);}
  function del(){setCosts(cs=>cs.filter(c=>c.id!==sel.id));setShowM(false);}
  const totalCost=jobCosts.reduce((s,c)=>s+c.amount,0);
  const grossProfit=job.value-totalCost;
  const margin=job.value>0?Math.round((grossProfit/job.value)*100):0;
  const byCategory=COST_CATEGORIES.reduce((acc,cat)=>({...acc,[cat]:jobCosts.filter(c=>c.category===cat).reduce((s,c)=>s+c.amount,0)}),{});
  const CAT_COLORS={Materials:"#60A5FA",Subcontractor:C.gold,Equipment:"#C084FC",Permit:C.warn,Other:C.muted};
  return <div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:9,marginBottom:14}}>
      {[{label:"Contract Value",val:fmt$(job.value),c:C.white},{label:"Total Costs",val:fmt$(totalCost),c:"#F87171"},{label:"Gross Profit",val:fmt$(grossProfit),c:grossProfit>=0?"#4ade80":"#F87171"},{label:"Margin",val:`${margin}%`,c:margin>=20?"#4ade80":margin>=10?C.warn:"#F87171"}].map(k=>(
        <Card key={k.label} style={{padding:11}}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",marginBottom:3}}>{k.label}</div><div style={{fontFamily:font,fontSize:17,color:k.c}}>{k.val}</div></Card>
      ))}
    </div>
    <Card style={{marginBottom:12,padding:13}}>
      <div style={{fontSize:12,fontWeight:700,color:C.white,marginBottom:10}}>Cost Breakdown</div>
      {COST_CATEGORIES.map(cat=>{const amt=byCategory[cat];if(!amt)return null;const pct=totalCost>0?Math.round((amt/totalCost)*100):0;return(
        <div key={cat} style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
            <span style={{color:CAT_COLORS[cat]||C.muted,fontWeight:600}}>{cat}</span>
            <span style={{color:C.white}}>{fmt$(amt)} <span style={{color:C.muted}}>({pct}%)</span></span>
          </div>
          <div style={{background:C.border,borderRadius:4,height:5}}>
            <div style={{background:CAT_COLORS[cat]||C.muted,borderRadius:4,height:5,width:`${pct}%`,transition:"width 0.5s"}}/>
          </div>
        </div>
      );})}
    </Card>
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}><Btn onClick={openNew}>+ Add Cost</Btn></div>
    {jobCosts.length===0&&<div style={{color:C.muted,textAlign:"center",padding:"28px 0",fontSize:12}}>No costs logged yet. Track materials, subs, and other expenses here.</div>}
    {COST_CATEGORIES.map(cat=>{const cats=jobCosts.filter(c=>c.category===cat);if(!cats.length)return null;return(
      <div key={cat} style={{marginBottom:14}}>
        <div style={{fontSize:11,color:CAT_COLORS[cat]||C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:6,letterSpacing:"0.05em"}}>{cat}</div>
        {cats.map(c=>(
          <Card key={c.id} onClick={()=>openEdit(c)} style={{marginBottom:6,padding:"10px 13px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:7}}>
              <div><div style={{color:C.white,fontSize:12,fontWeight:600}}>{c.description}</div><div style={{color:C.muted,fontSize:10,marginTop:2}}>{fmtDate(c.date)}</div></div>
              <div style={{color:"#F87171",fontWeight:700,fontSize:14}}>{fmt$(c.amount)}</div>
            </div>
          </Card>
        ))}
      </div>
    );})}
    {showM&&<Modal title={sel?"Edit Cost":"Add Cost"} onClose={()=>setShowM(false)}>
      <Sel label="Category" value={form.category||"Materials"} onChange={v=>f("category",v)} options={COST_CATEGORIES}/>
      <Inp label="Description" value={form.description||""} onChange={v=>f("description",v)} placeholder="e.g. 2x6 lumber, Rick Paulson electrical..."/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        <Inp label="Amount ($)" type="number" value={form.amount||""} onChange={v=>f("amount",v)}/>
        <Inp label="Date" type="date" value={form.date||""} onChange={v=>f("date",v)}/>
      </div>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:10}}>
        {sel&&<Btn variant="danger" onClick={del}>Delete</Btn>}
        <Btn variant="ghost" onClick={()=>setShowM(false)}>Cancel</Btn><Btn onClick={save}>Save</Btn>
      </div>
    </Modal>}
  </div>;
}

// ── PHOTO GALLERY ─────────────────────────────────────────────────────────────
function PhotoGallery({job,logs}){
  const [filter,setFilter]=useState("all");const [lightbox,setLightbox]=useState(null);
  const jobLogs=logs.filter(l=>l.jobId===job.id&&l.photos&&l.photos.length>0).sort((a,b)=>a.date.localeCompare(b.date));
  const allPhotos=jobLogs.flatMap(log=>log.photos.map(p=>({...p,date:log.date,weather:log.weather,logId:log.id})));
  const phases=["all","Before","During","After"];
  const tagged=allPhotos.map((p,i)=>{
    const idx=jobLogs.findIndex(l=>l.photos.some(ph=>ph.id===p.id));
    const total=jobLogs.length;
    const phase=total===0?"During":idx===0&&total>1?"Before":idx===jobLogs.length-1&&total>1?"After":"During";
    return {...p,phase};
  });
  const visible=filter==="all"?tagged:tagged.filter(p=>p.phase===filter);
  if(allPhotos.length===0)return(
    <div style={{textAlign:"center",padding:"40px 20px"}}>
      <div style={{fontSize:32,marginBottom:12}}>📷</div>
      <div style={{color:C.muted,fontSize:13}}>No photos yet.</div>
      <div style={{color:C.muted,fontSize:11,marginTop:4}}>Upload photos in Daily Log entries — they'll appear here organized by date.</div>
    </div>
  );
  return <div>
    <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
      {phases.map(ph=><button key={ph} onClick={()=>setFilter(ph)} style={{padding:"4px 12px",borderRadius:20,border:`1px solid ${filter===ph?C.gold:C.border}`,background:filter===ph?C.gold+"22":"transparent",color:filter===ph?C.gold:C.muted,cursor:"pointer",fontSize:11,fontFamily:fb,textTransform:"capitalize"}}>{ph==="all"?`All (${allPhotos.length})`:ph}</button>)}
    </div>
    {jobLogs.filter(l=>l.photos&&l.photos.length>0&&(filter==="all"||l.photos.some(p=>{const idx=jobLogs.indexOf(l);const total=jobLogs.length;const phase=total===0?"During":idx===0&&total>1?"Before":idx===jobLogs.length-1&&total>1?"After":"During";return phase===filter;}))).map(log=>(
      <div key={log.logId||log.date} style={{marginBottom:18}}>
        <div style={{fontSize:11,color:C.muted,marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:C.gold,fontWeight:600}}>{fmtDate(log.date)}</span>
          <span>{log.weather}</span>
          <span style={{flex:1,height:1,background:C.border}}/>
          <span>{log.photos.length} photo{log.photos.length!==1?"s":""}</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:7}}>
          {log.photos.map(photo=>(
            <div key={photo.id} onClick={()=>setLightbox({...photo,date:log.date})}
              style={{cursor:"pointer",borderRadius:8,overflow:"hidden",aspectRatio:"1",background:C.border,position:"relative",border:`1px solid ${C.border}`,transition:"border-color 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.gold}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              <img src={photo.url} alt={photo.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,#00000080 0%,transparent 50%)",opacity:0,transition:"opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0}/>
            </div>
          ))}
        </div>
      </div>
    ))}
    {lightbox&&<div onClick={()=>setLightbox(null)} style={{position:"fixed",inset:0,background:"#000000DD",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"zoom-out"}}>
      <div style={{maxWidth:"90vw",maxHeight:"90vh",position:"relative"}} onClick={e=>e.stopPropagation()}>
        <img src={lightbox.url} alt={lightbox.name} style={{maxWidth:"100%",maxHeight:"85vh",borderRadius:8,boxShadow:"0 0 80px #000",display:"block"}}/>
        <div style={{position:"absolute",bottom:-28,left:0,right:0,textAlign:"center",color:C.muted,fontSize:12}}>{lightbox.name} · {fmtDate(lightbox.date)} · click outside to close</div>
      </div>
    </div>}
  </div>;
}

function Jobs({jobs,setJobs,clients,logs,changeOrders,setChangeOrders,costs,setCosts}){
  const [detail,setDetail]=useState(null);const [showM,setShowM]=useState(false);const [sel,setSel]=useState(null);
  const [filter,setFilter]=useState("All");const [tab,setTab]=useState("milestones");const [form,setForm]=useState({});
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const filtered=filter==="All"?jobs:jobs.filter(j=>j.status===filter);
  const getClient=id=>clients.find(c=>c.id===id);
  function openNew(){setForm({name:"",clientId:"",address:"",type:"Deck",status:"Upcoming",value:"",paid:0,startDate:"",endDate:"",progress:0,notes:"",milestones:[],docs:[],sharedWithClient:false});setSel(null);setShowM(true);}
  function openEdit(job){setForm({...job,clientId:job.clientId||""});setSel(job);setShowM(true);}
  function save(){const u={...form,value:+form.value,paid:+form.paid,progress:+form.progress,clientId:form.clientId?+form.clientId:null,milestones:form.milestones||[],docs:form.docs||[]};if(sel)setJobs(js=>js.map(j=>j.id===sel.id?{...u,id:j.id}:j));else setJobs(js=>[...js,{...u,id:Date.now()}]);setShowM(false);}
  function updM(ms){setJobs(js=>js.map(j=>j.id===detail.id?{...j,milestones:ms}:j));setDetail(d=>({...d,milestones:ms}));}
  function toggleShare(jobId){setJobs(js=>js.map(j=>j.id===jobId?{...j,sharedWithClient:!j.sharedWithClient}:j));}
  if(detail){
    const job=jobs.find(j=>j.id===detail.id)||detail;
    const cl=getClient(job.clientId);
    const done=job.milestones.filter(m=>m.status==="Completed").length;
    const jobLogs=(logs||[]).filter(l=>l.jobId===job.id).sort((a,b)=>b.date.localeCompare(a.date));
    return <div>
      <div style={{marginBottom:14}}><Btn variant="ghost" size="sm" onClick={()=>setDetail(null)}>← All Projects</Btn></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div><h1 style={{fontFamily:font,color:C.white,fontSize:22,margin:0}}>{job.name}</h1><div style={{color:C.muted,marginTop:3,fontSize:12}}>{cl?.name} · {job.address}</div></div>
        <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
          <Badge label={job.status}/>
          <button onClick={()=>toggleShare(job.id)} style={{fontSize:11,padding:"4px 10px",borderRadius:20,border:`1px solid ${job.sharedWithClient?"#4ade8044":C.border}`,background:job.sharedWithClient?"#14532d22":"transparent",color:job.sharedWithClient?"#4ade80":C.muted,cursor:"pointer",fontFamily:fb}}>{job.sharedWithClient?"✓ Shared with Client":"Share with Client"}</button>
          <Btn size="sm" variant="ghost" onClick={()=>openEdit(job)}>Edit</Btn>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:9,marginBottom:14}}>
        {[{label:"Contract",value:fmt$(job.value),color:C.white},{label:"Received",value:fmt$(job.paid),color:"#4ade80"},{label:"Outstanding",value:fmt$(job.value-job.paid),color:C.warn},{label:"Milestones",value:`${done}/${job.milestones.length}`,color:C.gold}].map(k=>(
          <Card key={k.label} style={{padding:11}}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",marginBottom:3}}>{k.label}</div><div style={{fontFamily:font,fontSize:17,color:k.color}}>{k.value}</div></Card>
        ))}
      </div>
      <Card style={{marginBottom:12,padding:13}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}><span style={{color:C.muted}}>Overall Progress</span><span style={{color:C.gold,fontWeight:700}}>{job.progress}%</span></div>
        <div style={{background:C.border,borderRadius:6,height:7}}><div style={{background:C.gold,borderRadius:6,height:7,width:`${job.progress}%`,transition:"width 0.5s"}}/></div>
        <div style={{display:"flex",gap:14,marginTop:7,fontSize:11,color:C.muted}}><span>Start: <b style={{color:C.white}}>{fmtDate(job.startDate)}</b></span><span>End: <b style={{color:C.white}}>{fmtDate(job.endDate)}</b></span></div>
      </Card>
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,marginBottom:14,overflowX:"auto"}}>
        {["milestones","gantt","costs","changes","photos","log","documents","details"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{background:"none",border:"none",padding:"8px 13px",cursor:"pointer",color:tab===t?C.gold:C.muted,fontFamily:fb,fontSize:12,fontWeight:tab===t?700:400,borderBottom:tab===t?`2px solid ${C.gold}`:"2px solid transparent",marginBottom:-1,textTransform:"capitalize",whiteSpace:"nowrap"}}>{t}{t==="log"&&jobLogs.length>0?` (${jobLogs.length})`:""}</button>
        ))}
      </div>
      {tab==="milestones"&&<Card><Milestones job={job} onUpdate={updM}/></Card>}
      {tab==="gantt"&&<Card><Gantt jobs={[job]}/></Card>}
      {tab==="log"&&<div>
        {jobLogs.length===0?<div style={{color:C.muted,textAlign:"center",padding:"28px 0",fontSize:12}}>No log entries for this project yet.</div>:jobLogs.map(log=>(
          <Card key={log.id} style={{marginBottom:10,padding:14}}>
            <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:7,marginBottom:8}}>
              <div style={{fontSize:13,fontWeight:600,color:C.white}}>{fmtDate(log.date)}</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {log.visibleToClient&&<span style={{fontSize:10,color:"#4ade80"}}>✓ Client visible</span>}
                <span style={{fontSize:11,color:C.muted}}>{log.weather} · {log.crew} crew · {log.hours}h</span>
              </div>
            </div>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>{log.notes}</div>
            {log.photos&&log.photos.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(60px,1fr))",gap:5,marginTop:10}}>
              {log.photos.map(p=><div key={p.id} style={{borderRadius:5,overflow:"hidden",aspectRatio:"1"}}><img src={p.url} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/></div>)}
            </div>}
          </Card>
        ))}
      </div>}
      {tab==="documents"&&<Card>
        <div style={{fontWeight:700,color:C.white,fontSize:13,marginBottom:11}}>📁 Project Documents</div>
        {(job.docs||[]).length===0?<div style={{color:C.muted,textAlign:"center",padding:"14px 0",fontSize:12}}>No documents yet.</div>:(job.docs).map((doc,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:9,background:C.navy,borderRadius:7,padding:"8px 11px",marginBottom:6}}>
            <span style={{fontSize:16}}>📄</span><div><div style={{color:C.white,fontSize:12,fontWeight:600}}>{doc.name}</div><div style={{color:C.muted,fontSize:10}}>{doc.size} · {fmtDate(doc.date)}</div></div>
          </div>
        ))}
      </Card>}
      {tab==="costs"&&<JobCosting job={job} costs={costs} setCosts={setCosts}/>}
      {tab==="changes"&&<ChangeOrders job={job} changeOrders={changeOrders} setChangeOrders={setChangeOrders}/>}
      {tab==="photos"&&<PhotoGallery job={job} logs={logs}/>}
      {tab==="details"&&<Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:11}}>
          {[["Client",cl?.name||"—"],["Email",cl?.email||"—"],["Address",job.address],["Type",job.type],["Start",fmtDate(job.startDate)],["End",fmtDate(job.endDate)]].map(([k,v])=>(
            <div key={k} style={{background:C.navy,borderRadius:7,padding:10}}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",marginBottom:2}}>{k}</div><div style={{fontSize:12,fontWeight:600,color:C.white}}>{v}</div></div>
          ))}
        </div>
        {job.notes&&<div style={{color:C.muted,fontSize:11}}>📝 {job.notes}</div>}
      </Card>}
      {showM&&<Modal title="Edit Project" onClose={()=>setShowM(false)}>
        <Inp label="Project Name" value={form.name||""} onChange={v=>f("name",v)}/>
        <Sel label="Client" value={form.clientId||""} onChange={v=>f("clientId",v)} options={["",...clients.map(c=>c.id)]} display={["(No client)",...clients.map(c=>c.name)]}/>
        <Inp label="Address" value={form.address||""} onChange={v=>f("address",v)}/>
        <Sel label="Type" value={form.type||"Deck"} onChange={v=>f("type",v)} options={["Deck","Basement","Garage","Bathroom","Fence","Addition","Other"]}/>
        <Sel label="Status" value={form.status||"Upcoming"} onChange={v=>f("status",v)} options={JOB_STATUSES}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}><Inp label="Contract Value" type="number" value={form.value||""} onChange={v=>f("value",v)}/><Inp label="Amount Received" type="number" value={form.paid||""} onChange={v=>f("paid",v)}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}><Inp label="Start Date" type="date" value={form.startDate||""} onChange={v=>f("startDate",v)}/><Inp label="End Date" type="date" value={form.endDate||""} onChange={v=>f("endDate",v)}/></div>
        <div style={{marginBottom:11}}><label style={{display:"block",fontSize:11,color:C.muted,marginBottom:3,textTransform:"uppercase"}}>Progress ({form.progress||0}%)</label><input type="range" min={0} max={100} value={form.progress||0} onChange={e=>f("progress",e.target.value)} style={{width:"100%",accentColor:C.gold}}/></div>
        <Inp label="Notes" value={form.notes||""} onChange={v=>f("notes",v)}/>
        <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:8}}><Btn variant="ghost" onClick={()=>setShowM(false)}>Cancel</Btn><Btn onClick={save}>Save Project</Btn></div>
      </Modal>}
    </div>;
  }
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
      <h1 style={{fontFamily:font,color:C.white,fontSize:26,margin:0}}>Projects</h1><Btn onClick={openNew}>+ New Project</Btn>
    </div>
    <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
      {["All",...JOB_STATUSES].map(s=><button key={s} onClick={()=>setFilter(s)} style={{padding:"4px 11px",borderRadius:20,border:`1px solid ${filter===s?C.gold:C.border}`,background:filter===s?C.gold+"22":"transparent",color:filter===s?C.gold:C.muted,cursor:"pointer",fontSize:11,fontFamily:fb}}>{s}</button>)}
    </div>
    <div style={{display:"grid",gap:10}}>
      {filtered.map(job=>{
        const cl=getClient(job.clientId);
        const done=(job.milestones||[]).filter(m=>m.status==="Completed").length;
        const tot=(job.milestones||[]).length;
        const logCount=(logs||[]).filter(l=>l.jobId===job.id).length;
        return <Card key={job.id} onClick={()=>setDetail(job)}>
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontWeight:700,color:C.white,fontSize:14}}>{job.name}</div>
              <div style={{color:C.muted,fontSize:11}}>{cl?.name} · {job.address}</div>
              <div style={{color:C.muted,fontSize:10,marginTop:2}}>{fmtDate(job.startDate)} → {fmtDate(job.endDate)}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <Badge label={job.status}/>
              {job.sharedWithClient&&<div style={{fontSize:9,color:"#4ade80",marginTop:4}}>✓ Client can view</div>}
              <div style={{color:C.gold,fontWeight:700,fontSize:15,marginTop:4}}>{fmt$(job.value)}</div>
              <div style={{color:C.muted,fontSize:10}}>{tot>0?`${done}/${tot} milestones`:""}{logCount>0?` · ${logCount} logs`:""}</div>
            </div>
          </div>
          {tot>0&&<div style={{marginTop:9}}><div style={{background:C.border,borderRadius:4,height:4}}><div style={{background:job.progress===100?"#4ade80":C.gold,borderRadius:4,height:4,width:`${job.progress}%`}}/></div></div>}
        </Card>;
      })}
    </div>
    {showM&&<Modal title="New Project" onClose={()=>setShowM(false)}>
      <Inp label="Project Name" value={form.name||""} onChange={v=>f("name",v)}/>
      <Sel label="Client" value={form.clientId||""} onChange={v=>f("clientId",v)} options={["",...clients.map(c=>c.id)]} display={["(No client)",...clients.map(c=>c.name)]}/>
      <Inp label="Address" value={form.address||""} onChange={v=>f("address",v)}/>
      <Sel label="Type" value={form.type||"Deck"} onChange={v=>f("type",v)} options={["Deck","Basement","Garage","Bathroom","Fence","Addition","Other"]}/>
      <Sel label="Status" value={form.status||"Upcoming"} onChange={v=>f("status",v)} options={JOB_STATUSES}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}><Inp label="Contract Value" type="number" value={form.value||""} onChange={v=>f("value",v)}/><Inp label="Amount Received" type="number" value={form.paid||""} onChange={v=>f("paid",v)}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}><Inp label="Start Date" type="date" value={form.startDate||""} onChange={v=>f("startDate",v)}/><Inp label="End Date" type="date" value={form.endDate||""} onChange={v=>f("endDate",v)}/></div>
      <Inp label="Notes" value={form.notes||""} onChange={v=>f("notes",v)}/>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:8}}><Btn variant="ghost" onClick={()=>setShowM(false)}>Cancel</Btn><Btn onClick={save}>Save Project</Btn></div>
    </Modal>}
  </div>;
}

function Schedule({events,setEvents,jobs}){
  const [view,setView]=useState("list");const [showM,setShowM]=useState(false);const [sel,setSel]=useState(null);
  const [form,setForm]=useState({});const [drag,setDrag]=useState(null);const [cal,setCal]=useState(new Date());
  const [pf,setPf]=useState("all");const [dayModal,setDayModal]=useState(null);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const yr=cal.getFullYear(),mo=cal.getMonth();
  const firstDay=new Date(yr,mo,1).getDay();
  const dim=new Date(yr,mo+1,0).getDate();
  const MN=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const milestoneEvents=jobs.flatMap(j=>(j.milestones||[]).filter(m=>m.date).map(m=>({id:`ms-${j.id}-${m.id}`,title:`${j.name}: ${m.name}`,date:m.date,time:"00:00",type:"milestone",jobId:j.id})));const allEvents=[...events,...milestoneEvents];const fe=pf==="all"?allEvents:pf==="none"?allEvents.filter(e=>!e.jobId):allEvents.filter(e=>e.jobId===+pf);
  const upcoming=[...fe].sort((a,b)=>a.date.localeCompare(b.date)).filter(e=>e.date>=todayStr()).slice(0,10);
  function openNew(){setForm({title:"",jobId:"",date:todayStr(),time:"09:00",type:"site"});setSel(null);setShowM(true);}
  function openEdit(ev){setForm({...ev,jobId:ev.jobId||""});setSel(ev);setShowM(true);}
  function save(){const ev={...form,jobId:form.jobId?+form.jobId:null};if(sel)setEvents(es=>es.map(e=>e.id===sel.id?{...ev,id:e.id}:e));else setEvents(es=>[...es,{...ev,id:Date.now()}]);setShowM(false);}
  function del(id){setEvents(es=>es.filter(e=>e.id!==id));}
  function dayEvs(d){const ds=`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;return fe.filter(e=>e.date===ds);}
  function drop(e,d){e.preventDefault();if(!drag)return;const nd=`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;setEvents(es=>es.map(ev=>ev.id===drag.id?{...ev,date:nd}:ev));setDrag(null);}
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
      <h1 style={{fontFamily:font,color:C.white,fontSize:26,margin:0}}>Schedule</h1>
      <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
        {["list","calendar"].map(v=><button key={v} onClick={()=>setView(v)} style={{padding:"5px 11px",borderRadius:6,border:`1px solid ${view===v?C.gold:C.border}`,background:view===v?C.gold+"22":"transparent",color:view===v?C.gold:C.muted,cursor:"pointer",fontSize:11,fontFamily:fb,textTransform:"capitalize"}}>{v}</button>)}
        <Btn onClick={openNew}>+ Add Event</Btn>
      </div>
    </div>
    <div style={{marginBottom:14,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
      <label style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>Project:</label>
      <select value={pf} onChange={e=>setPf(e.target.value)} style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:7,padding:"6px 12px",color:C.white,fontSize:12,fontFamily:fb,outline:"none",cursor:"pointer"}}>
        <option value="all">All Projects</option>
        <option value="none">No Project (General)</option>
        {jobs.map(j=><option key={j.id} value={j.id}>{j.name}</option>)}
      </select>
      {pf!=="all"&&<button onClick={()=>setPf("all")} style={{fontSize:11,color:C.muted,background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Clear</button>}
    </div>
    {view==="list"&&<div style={{display:"grid",gap:8}}>
      {upcoming.length===0&&<div style={{color:C.muted,textAlign:"center",padding:28,fontSize:12}}>No upcoming events. Add one above.</div>}
      {upcoming.map(ev=>{const job=jobs.find(j=>j.id===ev.jobId);const color=EC[ev.type]||C.muted;return(
        <Card key={ev.id} style={{padding:11,borderLeft:`3px solid ${color}`}}>
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:7}}>
            <div><div style={{color:C.white,fontWeight:700,fontSize:13}}>{ev.title}</div><div style={{color:C.muted,fontSize:11,marginTop:2}}>📅 {fmtDate(ev.date)} at {ev.time}{job&&<span style={{color:C.gold}}> · {job.name}</span>}</div></div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:color+"22",color}}>{ev.type}</span><Btn size="sm" variant="ghost" onClick={()=>openEdit(ev)}>Edit</Btn><Btn size="sm" variant="danger" onClick={()=>del(ev.id)}>×</Btn></div>
          </div>
        </Card>
      );})}
    </div>}
    {view==="calendar"&&<Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <button onClick={()=>setCal(new Date(yr,mo-1,1))} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:6,padding:"3px 10px",cursor:"pointer"}}>‹</button>
        <span style={{color:C.white,fontWeight:700,fontFamily:font,fontSize:15}}>{MN[mo]} {yr}</span>
        <button onClick={()=>setCal(new Date(yr,mo+1,1))} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:6,padding:"3px 10px",cursor:"pointer"}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:2}}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:C.muted,padding:"2px 0"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`} style={{height:80}}/>)}
        {Array.from({length:dim}).map((_,i)=>{
          const d=i+1;
          const ds=`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
          const de=dayEvs(d);
          const isT=ds===todayStr();
          const shown=de.slice(0,2);
          const extra=de.length-2;
          return <div key={d}
            onDragOver={e=>e.preventDefault()} onDrop={e=>drop(e,d)}
            style={{height:80,background:isT?C.gold+"22":C.navy,border:`1px solid ${isT?C.gold:C.border}`,borderRadius:5,padding:"4px 5px",overflow:"hidden",boxSizing:"border-box",cursor:de.length>0?"pointer":"default"}}
            onClick={de.length>2?()=>setDayModal({ds,de}):undefined}>
            <div style={{fontSize:10,color:isT?C.gold:C.muted,fontWeight:isT?700:400,marginBottom:3}}>{d}</div>
            {shown.map(ev=>(
              <div key={ev.id} draggable onDragStart={e=>{e.stopPropagation();setDrag(ev);}} onClick={e=>{e.stopPropagation();openEdit(ev);}}
                style={{fontSize:9,padding:"2px 4px",borderRadius:3,marginBottom:2,background:(EC[ev.type]||C.muted)+"33",color:EC[ev.type]||C.muted,cursor:"grab",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                {ev.title}
              </div>
            ))}
            {extra>0&&<div style={{fontSize:9,color:C.muted,textAlign:"right",cursor:"pointer"}} onClick={e=>{e.stopPropagation();setDayModal({ds,de});}}>+{extra} more</div>}
          </div>;
        })}
      </div>
      <div style={{marginTop:7,fontSize:10,color:C.muted}}>💡 Drag events to reschedule · click "+N more" to see all events for a day</div>
    </Card>}
    {dayModal&&<Modal title={fmtDate(dayModal.ds)} onClose={()=>setDayModal(null)}>
      <div style={{display:"grid",gap:8}}>
        {dayModal.de.map(ev=>{const color=EC[ev.type]||C.muted;const job=jobs.find(j=>j.id===ev.jobId);return(
          <div key={ev.id} style={{padding:"10px 12px",borderRadius:8,background:C.navy,borderLeft:`3px solid ${color}`}}>
            <div style={{color:C.white,fontWeight:600,fontSize:13}}>{ev.title}</div>
            <div style={{color:C.muted,fontSize:11,marginTop:2}}>{ev.time}{job&&<span style={{color:C.gold}}> · {job.name}</span>}</div>
            <div style={{marginTop:8,display:"flex",gap:7}}>
              <Btn size="sm" variant="ghost" onClick={()=>{openEdit(ev);setDayModal(null);}}>Edit</Btn>
              <Btn size="sm" variant="danger" onClick={()=>{del(ev.id);setDayModal(null);}}>Delete</Btn>
            </div>
          </div>
        );})}
      </div>
    </Modal>}
    {showM&&<Modal title={sel?"Edit Event":"New Event"} onClose={()=>setShowM(false)}>
      <Inp label="Title" value={form.title||""} onChange={v=>f("title",v)}/>
      <Sel label="Type" value={form.type||"site"} onChange={v=>f("type",v)} options={EVENT_TYPES}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}><Inp label="Date" type="date" value={form.date||""} onChange={v=>f("date",v)}/><Inp label="Time" type="time" value={form.time||""} onChange={v=>f("time",v)}/></div>
      <Sel label="Linked Project (optional)" value={form.jobId||""} onChange={v=>f("jobId",v)} options={["",...jobs.map(j=>j.id)]} display={["(None)",...jobs.map(j=>j.name)]}/>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:10}}>
        {sel&&<Btn variant="danger" onClick={()=>{del(sel.id);setShowM(false);}}>Delete</Btn>}
        <Btn variant="ghost" onClick={()=>setShowM(false)}>Cancel</Btn><Btn onClick={save}>Save</Btn>
      </div>
    </Modal>}
  </div>;
}

function Leads({leads,setLeads}){
  const [showM,setShowM]=useState(false);const [sel,setSel]=useState(null);const [form,setForm]=useState({});
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  function openNew(){setForm({name:"",phone:"",email:"",type:"Deck",value:"",stage:"New",notes:"",date:todayStr()});setSel(null);setShowM(true);}
  function openEdit(l){setForm({...l});setSel(l);setShowM(true);}
  function save(){const u={...form,value:+form.value};if(sel)setLeads(ls=>ls.map(l=>l.id===sel.id?{...u,id:l.id}:l));else setLeads(ls=>[...ls,{...u,id:Date.now()}]);setShowM(false);}
  const byStage=LEAD_STAGES.reduce((acc,s)=>({...acc,[s]:leads.filter(l=>l.stage===s)}),{});
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h1 style={{fontFamily:font,color:C.white,fontSize:26,margin:0}}>Pipeline</h1><Btn onClick={openNew}>+ New Lead</Btn></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
      {LEAD_STAGES.map(stage=><div key={stage}>
        <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",marginBottom:7,fontWeight:700,letterSpacing:"0.06em"}}>{stage} <span style={{color:C.gold}}>({byStage[stage].length})</span></div>
        {byStage[stage].map(l=><Card key={l.id} onClick={()=>openEdit(l)} style={{marginBottom:7,padding:11}}>
          <div style={{fontWeight:700,color:C.white,fontSize:13,marginBottom:3}}>{l.name}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{l.type}</div>
          <div style={{color:C.gold,fontWeight:700,fontSize:12}}>{fmt$(l.value)}</div>
          {l.notes&&<div style={{fontSize:10,color:C.muted,marginTop:4}}>{l.notes}</div>}
        </Card>)}
      </div>)}
    </div>
    {showM&&<Modal title={sel?"Edit Lead":"New Lead"} onClose={()=>setShowM(false)}>
      <Inp label="Name" value={form.name||""} onChange={v=>f("name",v)}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}><Inp label="Phone" value={form.phone||""} onChange={v=>f("phone",v)}/><Inp label="Email" value={form.email||""} onChange={v=>f("email",v)} type="email"/></div>
      <Sel label="Type" value={form.type||"Deck"} onChange={v=>f("type",v)} options={["Deck","Basement","Garage","Bathroom","Fence","Addition","Other"]}/>
      <Inp label="Estimated Value" type="number" value={form.value||""} onChange={v=>f("value",v)}/>
      <Sel label="Stage" value={form.stage||"New"} onChange={v=>f("stage",v)} options={LEAD_STAGES}/>
      <Inp label="Notes" value={form.notes||""} onChange={v=>f("notes",v)}/>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:10}}>
        {sel&&<Btn variant="danger" onClick={()=>{setLeads(ls=>ls.filter(l=>l.id!==sel.id));setShowM(false);}}>Delete</Btn>}
        <Btn variant="ghost" onClick={()=>setShowM(false)}>Cancel</Btn><Btn onClick={save}>Save</Btn>
      </div>
    </Modal>}
  </div>;
}

function Subs({subs,setSubs}){
  const [showM,setShowM]=useState(false);const [sel,setSel]=useState(null);const [form,setForm]=useState({});
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  function openNew(){setForm({name:"",trade:"",phone:"",email:"",rating:5,notes:"",active:true});setSel(null);setShowM(true);}
  function openEdit(s){setForm({...s});setSel(s);setShowM(true);}
  function save(){const u={...form,rating:+form.rating};if(sel)setSubs(ss=>ss.map(s=>s.id===sel.id?{...u,id:s.id}:s));else setSubs(ss=>[...ss,{...u,id:Date.now()}]);setShowM(false);}
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h1 style={{fontFamily:font,color:C.white,fontSize:26,margin:0}}>Subtrades</h1><Btn onClick={openNew}>+ Add Sub</Btn></div>
    <div style={{display:"grid",gap:9}}>
      {subs.map(s=><Card key={s.id} onClick={()=>openEdit(s)}>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:7}}>
          <div><div style={{fontWeight:700,color:C.white,fontSize:14}}>{s.name}</div><div style={{color:C.muted,fontSize:12}}>{s.trade}</div><div style={{fontSize:11,color:C.muted,marginTop:3}}>{s.phone} · {s.email}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:15}}>{"⭐".repeat(s.rating)}</div><span style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:s.active?"#14532d22":"#1c1c1c",color:s.active?"#4ade80":C.muted}}>{s.active?"Active":"Inactive"}</span></div>
        </div>
        {s.notes&&<div style={{fontSize:11,color:C.muted,marginTop:6}}>📝 {s.notes}</div>}
      </Card>)}
    </div>
    {showM&&<Modal title={sel?"Edit Subtrade":"Add Subtrade"} onClose={()=>setShowM(false)}>
      <Inp label="Name" value={form.name||""} onChange={v=>f("name",v)}/><Inp label="Trade" value={form.trade||""} onChange={v=>f("trade",v)}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}><Inp label="Phone" value={form.phone||""} onChange={v=>f("phone",v)}/><Inp label="Email" value={form.email||""} onChange={v=>f("email",v)}/></div>
      <div style={{marginBottom:11}}><label style={{display:"block",fontSize:11,color:C.muted,marginBottom:3,textTransform:"uppercase"}}>Rating ({form.rating}/5)</label><input type="range" min={1} max={5} value={form.rating||5} onChange={e=>f("rating",e.target.value)} style={{width:"100%",accentColor:C.gold}}/></div>
      <Inp label="Notes" value={form.notes||""} onChange={v=>f("notes",v)}/>
      <div style={{marginBottom:11}}><label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer"}}><input type="checkbox" checked={form.active??true} onChange={e=>f("active",e.target.checked)} style={{accentColor:C.gold}}/><span style={{color:C.muted,fontSize:12}}>Active</span></label></div>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:8}}>
        {sel&&<Btn variant="danger" onClick={()=>{setSubs(ss=>ss.filter(s=>s.id!==sel.id));setShowM(false);}}>Delete</Btn>}
        <Btn variant="ghost" onClick={()=>setShowM(false)}>Cancel</Btn><Btn onClick={save}>Save</Btn>
      </div>
    </Modal>}
  </div>;
}

function ClientPortal({jobs,clients,logs}){
  const [email,setEmail]=useState("priya@example.com");const [sub,setSub]=useState(false);
  const [selId,setSelId]=useState(null);const [err,setErr]=useState("");
  const clientObj=clients.find(c=>c.email===email);
  const clientJobs=clientObj?jobs.filter(j=>j.clientId===clientObj.id&&j.sharedWithClient):[];
  const job=clientJobs.find(j=>j.id===selId)||clientJobs[0];
  const jobLogs=job?(logs||[]).filter(l=>l.jobId===job.id&&l.visibleToClient).sort((a,b)=>b.date.localeCompare(a.date)):[];
  function tryLogin(){setErr("");if(!clientObj){setErr("No client account found for this email.");return;}if(clientJobs.length===0){setErr("No projects have been shared with this account yet.");return;}setSub(true);}
  if(!sub)return <div>
    <h1 style={{fontFamily:font,color:C.white,fontSize:26,marginBottom:4}}>Client Portal Preview</h1>
    <p style={{color:C.muted,marginBottom:20,fontSize:13}}>Only projects marked "Share with Client" are visible. Try <b style={{color:C.gold}}>priya@example.com</b> or <b style={{color:C.gold}}>dave@example.com</b></p>
    <Card style={{maxWidth:380,marginBottom:14}}>
      <Inp label="Client Email" value={email} onChange={v=>{setEmail(v);setErr("");}} type="email" placeholder="client@example.com"/>
      {err&&<div style={{color:C.danger,fontSize:12,marginBottom:10,padding:"7px 10px",background:"#EF444422",borderRadius:6,borderLeft:`3px solid ${C.danger}`}}>{err}</div>}
      <Btn onClick={tryLogin}>View Portal</Btn>
    </Card>
    <div style={{padding:14,background:C.navyLight,borderRadius:8,border:`1px solid ${C.border}`,maxWidth:380}}>
      <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",marginBottom:8,letterSpacing:"0.06em"}}>Access Control</div>
      {jobs.map(j=>{const cl=clients.find(c=>c.id===j.clientId);return(
        <div key={j.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${C.border}`,fontSize:12}}>
          <span style={{color:C.white}}>{j.name}</span>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{color:C.muted,fontSize:10}}>{cl?.name}</span>
            <span style={{fontSize:10,padding:"1px 7px",borderRadius:10,background:j.sharedWithClient?"#14532d22":"#1c1c1c",color:j.sharedWithClient?"#4ade80":C.muted}}>{j.sharedWithClient?"Shared":"Hidden"}</span>
          </div>
        </div>
      );})}
    </div>
  </div>;
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
      <h1 style={{fontFamily:font,color:C.white,fontSize:26,margin:0}}>Client Portal Preview</h1>
      <Btn size="sm" variant="ghost" onClick={()=>setSub(false)}>← Change Email</Btn>
    </div>
    <p style={{color:C.muted,marginBottom:14,fontSize:12}}>Portal for: <b style={{color:C.gold}}>{email}</b> — {clientJobs.length} project{clientJobs.length!==1?"s":""} shared</p>
    {clientJobs.length>1&&<div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
      {clientJobs.map(j=><button key={j.id} onClick={()=>setSelId(j.id)} style={{padding:"5px 13px",borderRadius:20,border:`1px solid ${job?.id===j.id?C.gold:C.border}`,background:job?.id===j.id?C.gold+"22":"transparent",color:job?.id===j.id?C.gold:C.muted,cursor:"pointer",fontFamily:fb,fontSize:12}}>{j.name}</button>)}
    </div>}
    {job&&<div>
      <Card style={{marginBottom:11}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:12}}>
          <div><div style={{fontFamily:font,fontSize:19,color:C.white}}>{job.name}</div><div style={{color:C.muted,fontSize:12}}>{job.address}</div></div>
          <Badge label={job.status}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:4}}><span>Overall Progress</span><span style={{color:C.gold}}>{job.progress}% Complete</span></div>
        <div style={{background:C.border,borderRadius:6,height:7}}><div style={{background:C.gold,borderRadius:6,height:7,width:`${job.progress}%`,transition:"width 0.5s"}}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginTop:11}}>
          <div style={{background:C.navy,borderRadius:7,padding:11}}><div style={{fontSize:10,color:C.muted,marginBottom:2}}>Start Date</div><div style={{color:C.white,fontWeight:600,fontSize:12}}>{fmtDate(job.startDate)}</div></div>
          <div style={{background:C.navy,borderRadius:7,padding:11}}><div style={{fontSize:10,color:C.muted,marginBottom:2}}>Est. Completion</div><div style={{color:C.white,fontWeight:600,fontSize:12}}>{fmtDate(job.endDate)}</div></div>
        </div>
      </Card>
      <Card style={{marginBottom:11}}>
        <div style={{fontWeight:700,color:C.white,marginBottom:11,fontSize:13}}>🎯 Project Milestones</div>
        {(job.milestones||[]).map((m,i)=>{const done=m.status==="Completed";const act=m.status==="In Progress";return(
          <div key={m.id} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 0",borderBottom:i<job.milestones.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:done?"#4ade8033":act?C.gold+"33":C.border,border:`2px solid ${done?"#4ade80":act?C.gold:C.muted}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11}}>{done?"✓":act?"●":i+1}</div>
            <div style={{flex:1}}><div style={{color:done?C.muted:C.white,fontSize:12,fontWeight:600,textDecoration:done?"line-through":"none"}}>{m.name}</div>{m.date&&<div style={{fontSize:10,color:C.muted}}>{fmtDate(m.date)}</div>}</div>
            <Badge label={m.status}/>
          </div>
        );})}
      </Card>
      {jobLogs.length>0&&<Card style={{marginBottom:11}}>
        <div style={{fontWeight:700,color:C.white,marginBottom:11,fontSize:13}}>📋 Site Updates</div>
        {jobLogs.map((log,i)=>(
          <div key={log.id} style={{paddingBottom:14,marginBottom:i<jobLogs.length-1?14:0,borderBottom:i<jobLogs.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6,marginBottom:6}}>
              <div style={{fontSize:12,fontWeight:600,color:C.white}}>{fmtDate(log.date)}</div>
              <div style={{fontSize:11,color:C.muted}}>{log.weather} · {log.crew} crew · {log.hours}h</div>
            </div>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.6,marginBottom:log.photos&&log.photos.length>0?10:0}}>{log.notes}</div>
            {log.photos&&log.photos.length>0&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(70px,1fr))",gap:5}}>
                {log.photos.map(p=><div key={p.id} style={{borderRadius:5,overflow:"hidden",aspectRatio:"1"}}><img src={p.url} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/></div>)}
              </div>
            )}
          </div>
        ))}
      </Card>}
    </div>}
  </div>;
}

const NAV=[
  {id:"dashboard",label:"Dashboard",icon:"◈"},
  {id:"clients",label:"Clients",icon:"👤"},
  {id:"jobs",label:"Projects",icon:"🏗"},
  {id:"gantt",label:"Gantt",icon:"📊"},
  {id:"logs",label:"Daily Log",icon:"📋"},
  {id:"leads",label:"Pipeline",icon:"🎯"},
  {id:"schedule",label:"Schedule",icon:"📅"},
  {id:"subs",label:"Subtrades",icon:"👷"},
  {id:"client",label:"Client Portal",icon:"👁"},
];

export default function App(){
  const [page,setPage]=useState("dashboard");
  const [navOpen,setNavOpen]=useState(false);
  const [clients,setClients]=useState(initClients);
  const [jobs,setJobs]=useState(initJobs);
  const [leads,setLeads]=useState(initLeads);
  const [subs,setSubs]=useState(initSubs);
  const [events,setEvents]=useState(initEvents);
  const [logs,setLogs]=useState(initLogs);
  const [changeOrders,setChangeOrders]=useState(initChangeOrders);
  const [costs,setCosts]=useState(initCosts);
  const navRef=useRef(null);
  useEffect(()=>{
    function handle(e){if(navOpen&&navRef.current&&!navRef.current.contains(e.target))setNavOpen(false);}
    document.addEventListener("mousedown",handle);return()=>document.removeEventListener("mousedown",handle);
  },[navOpen]);
  const enrichedJobs=jobs.map(j=>({...j,_clientName:clients.find(c=>c.id===j.clientId)?.name||""}));
  function navigate(id){setPage(id);setNavOpen(false);}
  const render=()=>{switch(page){
    case"dashboard":return <Dashboard jobs={enrichedJobs} leads={leads} clients={clients} logs={logs} setPage={setPage}/>;
    case"clients":return <Clients clients={clients} setClients={setClients} jobs={jobs}/>;
    case"jobs":return <Jobs jobs={jobs} setJobs={setJobs} clients={clients} logs={logs} changeOrders={changeOrders} setChangeOrders={setChangeOrders} costs={costs} setCosts={setCosts}/>;
    case"gantt":return <div><h1 style={{fontFamily:font,color:C.white,fontSize:26,marginBottom:4}}>Gantt Chart</h1><p style={{color:C.muted,marginBottom:14,fontSize:12}}>All active & upcoming projects. Diamonds = milestones.</p><Card><Gantt jobs={enrichedJobs}/></Card></div>;
    case"logs":return <DailyLog logs={logs} setLogs={setLogs} jobs={jobs} clients={clients}/>;
    case"leads":return <Leads leads={leads} setLeads={setLeads}/>;
    case"schedule":return <Schedule events={events} setEvents={setEvents} jobs={jobs}/>;
    case"subs":return <Subs subs={subs} setSubs={setSubs}/>;
    case"client":return <ClientPortal jobs={jobs} clients={clients} logs={logs}/>;
    default:return null;
  }};
  return <div style={{display:"flex",minHeight:"100vh",background:C.navy,fontFamily:fb,color:C.white,position:"relative"}}>
    {navOpen&&<div onClick={()=>setNavOpen(false)} style={{position:"fixed",inset:0,background:"#00000060",zIndex:999}}/>}
    <div ref={navRef} style={{position:"fixed",top:0,left:0,bottom:0,width:200,background:C.bg,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",zIndex:1000,transform:navOpen?"translateX(0)":"translateX(-100%)",transition:"transform 0.25s ease"}}>
      <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <img src={LOGO} alt="Tall Guy Builds Inc." style={{width:80,height:80,objectFit:"contain"}}/>
        <button onClick={()=>setNavOpen(false)} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer",lineHeight:1,padding:0}}>×</button>
      </div>
      <nav style={{flex:1,padding:"7px 6px",overflowY:"auto"}}>
        {NAV.map(n=><button key={n.id} onClick={()=>navigate(n.id)} style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"8px 9px",borderRadius:7,border:"none",background:page===n.id?C.gold+"20":"transparent",color:page===n.id?C.gold:C.muted,cursor:"pointer",fontFamily:fb,fontSize:12,fontWeight:page===n.id?700:400,marginBottom:1,textAlign:"left"}}><span style={{fontSize:14}}>{n.icon}</span>{n.label}</button>)}
      </nav>
      <div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`,fontSize:9,color:C.muted}}>Built Right. Designed to Last.</div>
    </div>
    <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      <div style={{position:"sticky",top:0,zIndex:100,background:C.bg,borderBottom:`1px solid ${C.border}`,padding:"8px 16px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>setNavOpen(o=>!o)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:7,padding:"6px 9px",cursor:"pointer",display:"flex",flexDirection:"column",gap:4}}>
          <div style={{width:18,height:2,background:C.white,borderRadius:2}}/><div style={{width:18,height:2,background:C.white,borderRadius:2}}/><div style={{width:18,height:2,background:C.white,borderRadius:2}}/>
        </button>
        <img src={LOGO} alt="Tall Guy Builds" style={{height:38,objectFit:"contain"}}/>
        <div style={{flex:1}}/>
        <div style={{fontSize:11,color:C.muted,fontFamily:font}}>{NAV.find(n=>n.id===page)?.label||""}</div>
      </div>
      <div style={{flex:1,overflow:"auto"}}>
        <div style={{maxWidth:900,margin:"0 auto",padding:"20px 16px"}}>{render()}</div>
      </div>
    </div>
  </div>;
}