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
const EVENT_TYPES=["site","inspection","quote","sub","meeting","delivery","other"];
const ET_LABELS={site:"Site Visit",inspection:"Inspection",quote:"Quote",sub:"Subtrade",meeting:"Meeting",delivery:"Delivery",other:"Other"};
const EC={site:"#F59E0B",inspection:"#3B82F6",quote:"#06B6D4",sub:"#22C55E",meeting:"#A855F7",delivery:"#F97316",other:"#6B7280",milestone:"#EC4899"};

// ── EMAIL HELPER (EmailJS REST — no SDK needed) ───────────────────────────────
async function sendMilestoneEmail(job, milestoneName){
  try{
    const s=JSON.parse(localStorage.getItem("tgb_emailjs")||"{}");
    if(!s.service_id||!s.template_id||!s.public_key)return;
    if(!job?.client_email)return;
    const res=await fetch("https://api.emailjs.com/api/v1.0/email/send",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        service_id:s.service_id,
        template_id:s.template_id,
        user_id:s.public_key,
        template_params:{
          to_email:job.client_email,
          client_name:job.client||"",
          project_name:job.name||"",
          milestone_name:milestoneName,
          portal_url:"https://app.tallguybuilds.ca",
          contractor_name:"Tall Guy Builds Inc.",
          contractor_phone:"(306)737-5407",
        }
      })
    });
    if(!res.ok){const text=await res.text();console.warn("EmailJS failed:",res.status,text);}
  }catch(e){console.warn("Email send failed:",e);}
}

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

// ── MESSAGE THREAD ────────────────────────────────────────────────────────────
function MessageThread({jobId,senderType,senderName}){
  const [msgs,setMsgs]=useState([]);
  const [body,setBody]=useState("");
  const [loading,setLoading]=useState(true);
  const [sending,setSending]=useState(false);
  const bottomRef=useRef(null);

  useEffect(()=>{
    if(!jobId)return;
    loadMsgs();
    // Mark all unread messages as read for this viewer role
    supabase.from("messages")
      .update(senderType==="admin"?{read_by_admin:true}:{read_by_client:true})
      .eq("job_id",jobId)
      .eq(senderType==="admin"?"read_by_admin":"read_by_client",false)
      .then(()=>{});
    const iv=setInterval(loadMsgs,8000);
    return ()=>clearInterval(iv);
  },[jobId]);

  async function loadMsgs(){
    const {data}=await supabase.from("messages").select("*").eq("job_id",jobId).order("created_at");
    setMsgs(data||[]);setLoading(false);
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),60);
  }

  async function send(){
    if(!body.trim()||sending)return;
    setSending(true);
    const m={job_id:jobId,sender_type:senderType,sender_name:senderName||null,body:body.trim(),read_by_admin:senderType==="admin",read_by_client:senderType==="client"};
    const {data}=await supabase.from("messages").insert(m).select().single();
    if(data)setMsgs(p=>[...p,data]);
    setBody("");setSending(false);
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),60);
  }

  const fmtTs=ts=>{
    const d=new Date(ts);
    return d.toLocaleDateString("en-CA",{month:"short",day:"numeric"})+" "+d.toLocaleTimeString("en-CA",{hour:"2-digit",minute:"2-digit"});
  };

  if(!jobId)return <div style={{color:C.muted,fontSize:13,padding:16,textAlign:"center"}}>Save the project first to enable messaging.</div>;
  if(loading)return <div style={{color:C.muted,fontSize:13,padding:16,textAlign:"center"}}>Loading messages…</div>;

  return <div style={{display:"flex",flexDirection:"column",height:400}}>
    <div style={{flex:1,overflowY:"auto",paddingRight:4,marginBottom:12}}>
      {msgs.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted,fontSize:13}}>
        <div style={{fontSize:28,marginBottom:8}}>💬</div>No messages yet — start the conversation.
      </div>}
      {msgs.map(m=>{
        const isMe=m.sender_type===senderType;
        return <div key={m.id} style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start",marginBottom:10}}>
          <div style={{maxWidth:"76%"}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:3,textAlign:isMe?"right":"left"}}>
              {m.sender_name||(m.sender_type==="admin"?"Tall Guy Builds":"Client")} · {fmtTs(m.created_at)}
            </div>
            <div style={{background:isMe?C.gold:C.navy,color:isMe?C.navy:C.white,borderRadius:isMe?"12px 12px 3px 12px":"12px 12px 12px 3px",padding:"10px 14px",fontSize:13,lineHeight:1.5,border:`1px solid ${isMe?C.gold+"99":C.border}`,wordBreak:"break-word"}}>
              {m.body}
            </div>
          </div>
        </div>;
      })}
      <div ref={bottomRef}/>
    </div>
    <div style={{display:"flex",gap:8,alignItems:"flex-end",borderTop:`1px solid ${C.border}`,paddingTop:12}}>
      <textarea value={body} onChange={e=>setBody(e.target.value)}
        onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
        placeholder="Type a message… (Enter to send)"
        rows={2}
        style={{flex:1,background:C.navy,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 11px",color:C.white,fontSize:13,fontFamily:fb,outline:"none",resize:"none",lineHeight:1.5}}
      />
      <Btn onClick={send} style={{opacity:sending||!body.trim()?0.45:1}}>Send</Btn>
    </div>
  </div>;
}

// ── MILESTONES (internal editor) ──────────────────────────────────────────────
function Milestones({jobId,job,onAdd,onDelete}){
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
    if(item.status==="Completed"&&job)sendMilestoneEmail(job,item.name);
  }

  async function add(){
    if(!nm.trim())return;
    const newM={job_id:jobId,name:nm.trim(),date:nd||null,status:"Not Started",order_index:items.length};
    const {data}=await supabase.from("milestones").insert(newM).select().single();
    if(data){setItems(prev=>[...prev,data]);onAdd&&onAdd(data);}
    setNm("");setNd("");
  }

  async function del(id){
    setItems(prev=>prev.filter(m=>m.id!==id));
    onDelete&&onDelete(id);
    await supabase.from("milestones").delete().eq("id",id);
  }

  const icon={"Completed":"✅","In Progress":"🔄","Not Started":"○"};
  if(loading)return <div style={{color:C.muted,fontSize:12,padding:8}}>Loading milestones...</div>;

  return <div style={{display:"flex",flexDirection:"column"}}>
    <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Click icon to cycle status · {items.length} milestone{items.length!==1?"s":""}</div>
    {/* Scrollable list — Add form stays pinned below regardless of count */}
    <div style={{maxHeight:340,overflowY:"auto",marginBottom:4,paddingRight:2}}>
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
    </div>
    {/* Add form — always visible, never pushed off screen */}
    <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10,display:"flex",gap:7,alignItems:"flex-end",flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:140}}><Inp label="New Milestone" value={nm} onChange={setNm} placeholder="e.g. Pour footings"/></div>
      <div style={{width:130}}><Inp label="Date" value={nd} onChange={setNd} type="date"/></div>
      <Btn onClick={add} style={{marginBottom:11}}>Add</Btn>
    </div>
  </div>;
}

// ── PAYMENT SCHEDULE EDITOR ───────────────────────────────────────────────────
function PaymentScheduleEditor({schedule,contractValue,onChange}){
  const [form,setForm]=useState({label:"",amount:"",due_date:""});
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const totalScheduled=(schedule||[]).reduce((s,p)=>s+(+p.amount||0),0);
  const remaining=contractValue-totalScheduled;

  function add(){
    if(!form.label||!form.amount)return;
    const item={id:Date.now(),label:form.label,amount:+form.amount,due_date:form.due_date||null,paid:false};
    onChange([...(schedule||[]),item]);
    setForm({label:"",amount:"",due_date:""});
  }
  function togglePaid(id){onChange((schedule||[]).map(p=>p.id===id?{...p,paid:!p.paid}:p));}
  function remove(id){onChange((schedule||[]).filter(p=>p.id!==id));}

  const PRESETS=["Deposit","Rough-in Complete","Framing Complete","Drywall Complete","Final Payment"];

  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div style={{fontSize:13,color:C.white,fontWeight:700}}>Payment Schedule</div>
      {contractValue>0&&<div style={{fontSize:11,color:remaining===0?C.success:C.muted}}>
        {fmt$(totalScheduled)} scheduled of {fmt$(contractValue)} contract
        {remaining>0&&<span style={{color:C.warn}}> · {fmt$(remaining)} unscheduled</span>}
      </div>}
    </div>

    {/* Quick presets */}
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
      {PRESETS.map(p=><button key={p} onClick={()=>setForm(prev=>({...prev,label:p}))}
        style={{fontSize:10,padding:"3px 9px",borderRadius:20,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,cursor:"pointer",fontFamily:fb}}>{p}</button>)}
    </div>

    {/* Existing items */}
    {(schedule||[]).length===0&&<div style={{color:C.muted,fontSize:12,textAlign:"center",padding:"12px 0",marginBottom:8}}>No payments scheduled yet.</div>}
    {(schedule||[]).map(p=>(
      <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:8,marginBottom:6,background:p.paid?"#14532d22":C.navy,border:`1px solid ${p.paid?"#4ade8033":C.border}`}}>
        <button onClick={()=>togglePaid(p.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,padding:0,lineHeight:1,flexShrink:0}}>{p.paid?"✅":"⬜"}</button>
        <div style={{flex:1}}>
          <div style={{color:p.paid?C.muted:C.white,fontSize:13,fontWeight:600,textDecoration:p.paid?"line-through":"none"}}>{p.label}</div>
          {p.due_date&&<div style={{fontSize:10,color:C.muted}}>Due {fmtDate(p.due_date)}</div>}
        </div>
        <div style={{fontSize:14,color:p.paid?C.success:C.gold,fontWeight:700}}>{fmt$(p.amount)}</div>
        <button onClick={()=>remove(p.id)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:15,lineHeight:1}}>×</button>
      </div>
    ))}

    {/* Add row */}
    <div style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:7,marginTop:8,alignItems:"flex-end"}}>
      <Inp label="Payment Label" value={form.label} onChange={v=>f("label",v)} placeholder="e.g. Deposit"/>
      <div style={{width:100}}><Inp label="Amount ($)" type="number" value={form.amount} onChange={v=>f("amount",v)}/></div>
      <div style={{width:120}}><Inp label="Due Date" type="date" value={form.due_date} onChange={v=>f("due_date",v)}/></div>
      <Btn onClick={add} style={{marginBottom:11}}>Add</Btn>
    </div>
  </div>;
}

// ── CLIENT CALENDAR (read-only calendar view for portal) ─────────────────────
function ClientCalendar({events,milestones,loading}){
  const [calDate,setCalDate]=useState(()=>new Date(Date.UTC(new Date().getFullYear(),new Date().getMonth(),1)));
  const DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const calYear=calDate.getUTCFullYear();
  const calMonth=calDate.getUTCMonth();
  const today=new Date().toISOString().slice(0,10);

  function calDays(){
    const mm=String(calMonth+1).padStart(2,"0");
    const firstDay=new Date(Date.UTC(calYear,calMonth,1)).getUTCDay();
    const total=new Date(Date.UTC(calYear,calMonth+1,0)).getUTCDate();
    const days=[];
    for(let i=0;i<firstDay;i++)days.push(null);
    for(let d=1;d<=total;d++)days.push(d);
    while(days.length%7!==0)days.push(null);
    return days;
  }
  function calStr(d){
    if(!d)return"";
    const mm=String(calMonth+1).padStart(2,"0"),dd=String(d).padStart(2,"0");
    return`${calYear}-${mm}-${dd}`;
  }
  function evColor(ev){return ev.color||(EC[ev.type]||C.muted);}

  if(loading)return <div style={{color:C.muted,fontSize:12,padding:"20px 0",textAlign:"center"}}>Loading schedule...</div>;
  if(!events.length&&!milestones.length)return(
    <div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:12,padding:40,textAlign:"center"}}>
      <div style={{fontSize:32,marginBottom:10}}>📅</div>
      <div style={{color:C.muted,fontSize:13}}>No schedule items yet.</div>
    </div>
  );

  return <div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
    {/* Month nav */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",borderBottom:`1px solid ${C.border}`,background:C.navy}}>
      <button onClick={()=>setCalDate(new Date(Date.UTC(calYear,calMonth-1,1)))} style={{background:"none",border:"none",color:C.gold,fontSize:22,cursor:"pointer",padding:"0 8px"}}>‹</button>
      <div style={{fontWeight:800,color:C.white,fontSize:17}}>{MONTHS[calMonth]} {calYear}</div>
      <button onClick={()=>setCalDate(new Date(Date.UTC(calYear,calMonth+1,1)))} style={{background:"none",border:"none",color:C.gold,fontSize:22,cursor:"pointer",padding:"0 8px"}}>›</button>
    </div>
    {/* Legend */}
    <div style={{display:"flex",gap:12,flexWrap:"wrap",padding:"10px 16px",borderBottom:`1px solid ${C.border}`,background:C.navy}}>
      {Object.entries(ET_LABELS).map(([k,lbl])=>(
        <div key={k} style={{display:"flex",alignItems:"center",gap:4}}>
          <div style={{width:8,height:8,borderRadius:2,background:EC[k]}}/>
          <span style={{fontSize:10,color:C.muted}}>{lbl}</span>
        </div>
      ))}
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        <div style={{width:8,height:8,borderRadius:2,background:EC.milestone}}/>
        <span style={{fontSize:10,color:C.muted}}>Milestone</span>
      </div>
    </div>
    {/* Day headers */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:C.navy,borderBottom:`1px solid ${C.border}`}}>
      {DAYS.map((d,i)=><div key={d} style={{textAlign:"center",padding:"8px 0",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:i===0||i===6?"#4B5563":C.muted}}>{d}</div>)}
    </div>
    {/* Cells */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
      {calDays().map((d,i)=>{
        const ds=calStr(d);
        const isToday=ds===today;
        const isWeekend=i%7===0||i%7===6;
        const dayEvents=events.filter(e=>{
          if(!d)return false;
          if(e.date_end&&e.date_end>e.date)return ds>=e.date&&ds<=e.date_end;
          return e.date===ds;
        });
        const dayMilestones=milestones.filter(m=>m.date===ds);
        const total=dayEvents.length+dayMilestones.length;
        return <div key={i} style={{
          minHeight:90,padding:"6px 6px 4px",
          borderRight:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,
          background:isToday?C.gold+"0D":isWeekend?"#1a2535":"transparent",
          opacity:d?1:0.3,
        }}>
          {d&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",fontSize:12,fontWeight:isToday?800:400,background:isToday?C.gold:"transparent",color:isToday?C.navy:C.muted}}>{d}</div>
            {total>2&&<span style={{fontSize:9,color:C.muted}}>+{total-2}</span>}
          </div>}
          {dayEvents.slice(0,2).map(ev=>{
            const tc=evColor(ev);
            const isStart=ev.date===ds;
            const isMultiDay=ev.date_end&&ev.date_end>ev.date;
            return <div key={"e"+ev.id} style={{
              background:tc,borderRadius:isMultiDay?(isStart?"4px 0 0 4px":"0 4px 4px 0"):4,
              padding:"2px 6px",marginBottom:2,fontSize:10,fontWeight:600,color:"#fff",
              overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",
            }}>
              {(ev.time&&isStart?ev.time.slice(0,5)+" ":"")+ev.title}
            </div>;
          })}
          {dayMilestones.slice(0,2-Math.min(dayEvents.length,2)).map(m=>(
            <div key={"m"+m.id} style={{background:EC.milestone,borderRadius:4,padding:"2px 6px",marginBottom:2,fontSize:10,fontWeight:600,color:"#fff",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
              🏁 {m.name}
            </div>
          ))}
        </div>;
      })}
    </div>
  </div>;
}

// ── CLIENT PORTAL ─────────────────────────────────────────────────────────────
function ClientPortal({jobs,logs,clientMode=false,onSignOut}){
  const [selJob,setSelJob]=useState(null);
  const [milestones,setMilestones]=useState([]);
  const [events,setEvents]=useState([]);
  const [loadingM,setLoadingM]=useState(false);
  const [lightbox,setLightbox]=useState(null);
  const [portalTab,setPortalTab]=useState("overview");

  // clientMode: jobs already pre-filtered; admin: use shared_with_client flag
  const sharedJobs=clientMode?jobs:jobs.filter(j=>j.shared_with_client);

  useEffect(()=>{
    if(!selJob)return;
    setLoadingM(true);
    Promise.all([
      supabase.from("milestones").select("*").eq("job_id",selJob.id).order("order_index"),
      supabase.from("events").select("*").eq("job_id",selJob.id).order("date"),
    ]).then(([ms,ev])=>{
      setMilestones(ms.data||[]);
      setEvents(ev.data||[]);
      setLoadingM(false);
    });
  },[selJob]);

  // Project list
  if(!selJob){
    return <div>
      {clientMode&&onSignOut&&<div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
        <button onClick={onSignOut} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:fb}}>Sign Out</button>
      </div>}
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
        </div>
      )}
      <div style={{display:"grid",gap:14}}>
        {sharedJobs.map(job=>{
          const jobLogs=logs.filter(l=>l.job_id===job.id&&l.visible_to_client);
          const allPhotos=jobLogs.flatMap(l=>l.photos||[]);
          return <div key={job.id} onClick={()=>{setSelJob(job);setPortalTab("overview");}} style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",cursor:"pointer",transition:"border-color 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=C.gold}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            {/* Photo strip preview */}
            {allPhotos.length>0&&<div style={{display:"flex",gap:3,height:80,overflow:"hidden"}}>
              {allPhotos.slice(0,5).map((ph,i)=><img key={i} src={ph.url||ph} alt="" style={{flex:1,objectFit:"cover",minWidth:0}}/>)}
            </div>}
            <div style={{padding:"16px 20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                <div>
                  <div style={{fontWeight:700,color:C.white,fontSize:17,fontFamily:font}}>{job.name}</div>
                  <div style={{color:C.muted,fontSize:12,marginTop:3}}>{job.address}</div>
                </div>
                <Badge label={job.status}/>
              </div>
              <div style={{marginTop:12}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:5}}>
                  <span>Overall Progress</span>
                  <span style={{color:C.gold,fontWeight:700,fontSize:13}}>{job.progress||0}%</span>
                </div>
                <div style={{background:C.border,borderRadius:6,height:8}}><div style={{background:C.gold,borderRadius:6,height:8,width:`${job.progress||0}%`,transition:"width 0.8s"}}/></div>
              </div>
            </div>
            <div style={{borderTop:`1px solid ${C.border}`,padding:"10px 20px",display:"flex",gap:20}}>
              <div style={{fontSize:11,color:C.muted}}><span style={{color:C.white,fontWeight:600}}>{jobLogs.length}</span> update{jobLogs.length!==1?"s":""}</div>
              {allPhotos.length>0&&<div style={{fontSize:11,color:C.muted}}><span style={{color:C.white,fontWeight:600}}>{allPhotos.length}</span> photo{allPhotos.length!==1?"s":""}</div>}
              <div style={{fontSize:11,color:C.gold,fontWeight:600,marginLeft:"auto"}}>View project →</div>
            </div>
          </div>;
        })}
      </div>
    </div>;
  }

  // ── Individual project view ──
  const jobLogs=logs.filter(l=>l.job_id===selJob.id&&l.visible_to_client).sort((a,b)=>b.date?.localeCompare(a.date));
  const allPhotos=jobLogs.flatMap(l=>(l.photos||[]).map(ph=>({url:ph.url||ph,date:l.date,notes:l.notes})));
  const done=milestones.filter(m=>m.status==="Completed").length;
  const inProgress=milestones.filter(m=>m.status==="In Progress").length;
  const total=milestones.length;
  const ps=selJob.payment_schedule||[];
  const totalPaid=ps.filter(p=>p.paid).reduce((s,p)=>s+(+p.amount||0),0);
  const totalContract=+selJob.value||0;
  const nextDue=ps.filter(p=>!p.paid&&p.due_date).sort((a,b)=>a.due_date.localeCompare(b.due_date))[0];

  const TABS=["overview","photos","schedule","payments","updates","messages"];

  return <div>
    <button onClick={()=>{setSelJob(null);setMilestones([]);}} style={{background:"none",border:"none",color:C.gold,cursor:"pointer",fontSize:13,fontFamily:fb,marginBottom:18,display:"flex",alignItems:"center",gap:6,padding:0}}>← All Projects</button>

    {/* ── Project header ── */}
    <div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",marginBottom:6}}>
      {allPhotos.length>0&&<div style={{height:140,overflow:"hidden",position:"relative"}}>
        <img src={allPhotos[0].url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, transparent 40%, #1F2A37ee)"}}/>
        <div style={{position:"absolute",bottom:14,left:20,right:20}}>
          <div style={{fontSize:10,color:C.gold,fontWeight:700,letterSpacing:1.5,marginBottom:3}}>TALL GUY BUILDS INC.</div>
          <h2 style={{fontFamily:font,color:C.white,fontSize:20,margin:0}}>{selJob.name}</h2>
          <div style={{color:"#ffffffaa",fontSize:12,marginTop:2}}>{selJob.address}</div>
        </div>
      </div>}
      {allPhotos.length===0&&<div style={{padding:"20px 24px 0"}}>
        <div style={{fontSize:10,color:C.gold,fontWeight:700,letterSpacing:1.5,marginBottom:3}}>TALL GUY BUILDS INC.</div>
        <h2 style={{fontFamily:font,color:C.white,fontSize:20,margin:0}}>{selJob.name}</h2>
        <div style={{color:C.muted,fontSize:12,marginTop:2}}>{selJob.address}</div>
      </div>}
      <div style={{padding:"16px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{color:C.muted,fontSize:12}}>{fmtDate(selJob.start_date)} → {fmtDate(selJob.end_date)}</span>
          <Badge label={selJob.status}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:8}}>
          <span style={{color:C.muted}}>Overall Progress</span>
          <span style={{color:C.gold,fontWeight:700,fontSize:18,fontFamily:font}}>{selJob.progress||0}%</span>
        </div>
        <div style={{background:C.border,borderRadius:8,height:12,overflow:"hidden"}}>
          <div style={{background:`linear-gradient(90deg,${C.gold},#e8c87a)`,borderRadius:8,height:12,width:`${selJob.progress||0}%`,transition:"width 1s",boxShadow:`0 0 8px ${C.gold}66`}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(80px,1fr))",gap:8,marginTop:14}}>
          {[
            {label:"Milestones",value:`${done}/${total}`},
            {label:"In Progress",value:inProgress},
            {label:"Updates",value:jobLogs.length},
            {label:"Photos",value:allPhotos.length},
          ].map(s=>(
            <div key={s.label} style={{background:C.navy,borderRadius:8,padding:"8px 10px",border:`1px solid ${C.border}`,textAlign:"center"}}>
              <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{s.label}</div>
              <div style={{fontSize:17,color:C.gold,fontWeight:700,fontFamily:font}}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ── Tab nav ── */}
    <div style={{display:"flex",gap:4,marginBottom:18,flexWrap:"wrap"}}>
      {TABS.map(t=><button key={t} onClick={()=>setPortalTab(t)} style={{padding:"7px 15px",borderRadius:20,border:`1px solid ${portalTab===t?C.gold:C.border}`,background:portalTab===t?C.gold+"22":"transparent",color:portalTab===t?C.gold:C.muted,fontFamily:fb,fontSize:12,fontWeight:portalTab===t?700:400,cursor:"pointer",textTransform:"capitalize"}}>{t}</button>)}
    </div>

    {/* ── OVERVIEW ── */}
    {portalTab==="overview"&&<>
      {/* Payment quick-card */}
      {totalContract>0&&<div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginBottom:16}}>
        <div style={{fontSize:13,color:C.white,fontWeight:700,marginBottom:12}}>💳 Payment Summary</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
          {[
            {label:"Contract Total",value:fmt$(totalContract),color:C.white},
            {label:"Paid to Date",value:fmt$(totalPaid),color:"#4ade80"},
            {label:"Remaining",value:fmt$(totalContract-totalPaid),color:totalContract-totalPaid===0?"#4ade80":C.warn},
          ].map(s=><div key={s.label} style={{background:C.navy,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{s.label}</div>
            <div style={{fontSize:15,color:s.color,fontWeight:700}}>{s.value}</div>
          </div>)}
        </div>
        <div style={{background:C.border,borderRadius:6,height:8,marginBottom:8}}>
          <div style={{background:"#4ade80",borderRadius:6,height:8,width:`${totalContract>0?Math.round((totalPaid/totalContract)*100):0}%`,transition:"width 1s"}}/>
        </div>
        {nextDue&&<div style={{fontSize:12,color:C.warn}}>⏰ Next payment due: <strong>{nextDue.label}</strong> — {fmt$(nextDue.amount)} on {fmtDate(nextDue.due_date)}</div>}
      </div>}

      {/* Recent photos strip */}
      {allPhotos.length>0&&<div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:13,color:C.white,fontWeight:700}}>📷 Recent Photos</div>
          <button onClick={()=>setPortalTab("photos")} style={{background:"none",border:"none",color:C.gold,fontSize:12,cursor:"pointer",fontFamily:fb}}>View all →</button>
        </div>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
          {allPhotos.slice(0,8).map((ph,i)=>(
            <div key={i} onClick={()=>setLightbox(ph.url)} style={{width:90,height:90,flexShrink:0,borderRadius:8,overflow:"hidden",cursor:"zoom-in"}}>
              <img src={ph.url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            </div>
          ))}
        </div>
      </div>}

      {/* Up Next — upcoming events + milestones combined */}
      {(events.filter(e=>e.date>=new Date().toISOString().slice(0,10)).length>0||milestones.filter(m=>m.status!=="Completed").length>0)&&
      <div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:13,color:C.white,fontWeight:700}}>🎯 Up Next</div>
          <button onClick={()=>setPortalTab("schedule")} style={{background:"none",border:"none",color:C.gold,fontSize:12,cursor:"pointer",fontFamily:fb}}>Full schedule →</button>
        </div>
        {[
          ...events.filter(e=>e.date>=new Date().toISOString().slice(0,10)).map(e=>({...e,_kind:"event"})),
          ...milestones.filter(m=>m.status!=="Completed"&&m.date).map(m=>({...m,title:m.name,_kind:"milestone"}))
        ].sort((a,b)=>a.date?.localeCompare(b.date)).slice(0,4).map(item=>{
          const isMilestone=item._kind==="milestone";
          const color=isMilestone?EC.milestone:(item.color||EC[item.type]||C.muted);
          return <div key={(isMilestone?"m":"e")+item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:8,height:8,borderRadius:2,background:color,flexShrink:0}}/>
              <span style={{color:C.white,fontSize:13}}>{item.title}</span>
              {isMilestone&&<Badge label={item.status}/>}
            </div>
            <div style={{fontSize:11,color:C.muted}}>{fmtDate(item.date)}</div>
          </div>;
        })}
      </div>}
    </>}

    {/* ── PHOTO TIMELINE ── */}
    {portalTab==="photos"&&<div>
      {allPhotos.length===0&&<div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:12,padding:40,textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:10}}>📷</div>
        <div style={{color:C.muted,fontSize:13}}>No photos yet. Check back as work progresses.</div>
      </div>}
      {/* Group photos by log date */}
      {Object.entries(jobLogs.reduce((acc,log)=>{
        const photos=(log.photos||[]);
        if(photos.length===0)return acc;
        acc[log.date]={notes:log.notes,photos:photos.map(ph=>ph.url||ph)};
        return acc;
      },{})).sort((a,b)=>b[0].localeCompare(a[0])).map(([date,{notes,photos}])=>(
        <div key={date} style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:C.gold,flexShrink:0}}/>
            <div style={{fontSize:13,color:C.gold,fontWeight:700}}>{fmtDate(date)}</div>
            <div style={{flex:1,height:1,background:C.border}}/>
          </div>
          {notes&&<p style={{color:C.muted,fontSize:12,lineHeight:1.7,margin:"0 0 10px 20px"}}>{notes.slice(0,180)}{notes.length>180?"…":""}</p>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8,marginLeft:20}}>
            {photos.map((url,i)=>(
              <div key={i} onClick={()=>setLightbox(url)} style={{aspectRatio:"1",borderRadius:10,overflow:"hidden",cursor:"zoom-in",boxShadow:"0 2px 10px #00000040"}}>
                <img src={url} alt="" style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.2s"}}
                  onMouseEnter={e=>e.target.style.transform="scale(1.05)"}
                  onMouseLeave={e=>e.target.style.transform="scale(1)"}/>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>}

    {/* ── MILESTONES ── */}
    {portalTab==="schedule"&&<ClientCalendar events={events} milestones={milestones} loading={loadingM}/>}

    {/* ── PAYMENTS ── */}
    {portalTab==="payments"&&<div>
      {(!ps||ps.length===0)&&<div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:12,padding:32,textAlign:"center"}}>
        <div style={{fontSize:28,marginBottom:8}}>💳</div>
        <div style={{color:C.muted,fontSize:13}}>No payment schedule has been set up for this project yet.</div>
      </div>}
      {ps.length>0&&<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
          {[
            {label:"Contract Total",value:fmt$(totalContract),color:C.white},
            {label:"Paid",value:fmt$(totalPaid),color:"#4ade80"},
            {label:"Outstanding",value:fmt$(totalContract-totalPaid),color:totalContract-totalPaid===0?"#4ade80":C.warn},
          ].map(s=><div key={s.label} style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px"}}>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:20,color:s.color,fontWeight:700}}>{s.value}</div>
          </div>)}
        </div>
        <div style={{background:C.border,borderRadius:6,height:10,marginBottom:20}}>
          <div style={{background:"#4ade80",borderRadius:6,height:10,width:`${totalContract>0?Math.round((totalPaid/totalContract)*100):0}%`,transition:"width 1s"}}/>
        </div>
        <div style={{display:"grid",gap:8}}>
          {ps.map(p=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,background:p.paid?"#14532d22":C.navyLight,border:`1px solid ${p.paid?"#4ade8033":C.border}`,borderRadius:10,padding:"12px 16px"}}>
              <span style={{fontSize:18}}>{p.paid?"✅":"⬜"}</span>
              <div style={{flex:1}}>
                <div style={{color:p.paid?C.muted:C.white,fontWeight:600,fontSize:13,textDecoration:p.paid?"line-through":"none"}}>{p.label}</div>
                {p.due_date&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>Due {fmtDate(p.due_date)}</div>}
              </div>
              <div style={{fontSize:16,color:p.paid?"#4ade80":C.gold,fontWeight:700}}>{fmt$(p.amount)}</div>
              <Badge label={p.paid?"Paid":"Pending"}/>
              {p.qb_synced&&<span style={{fontSize:10,color:"#4ade80",fontWeight:600,whiteSpace:"nowrap"}}>🟢 QB</span>}
            </div>
          ))}
        </div>
      </>}
    </div>}

    {/* ── SITE UPDATES ── */}
    {portalTab==="updates"&&<div>
      {jobLogs.length===0&&<div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:12,padding:32,textAlign:"center"}}>
        <div style={{fontSize:28,marginBottom:8}}>🏗️</div>
        <div style={{color:C.muted,fontSize:13}}>No site updates yet. Check back soon!</div>
      </div>}
      <div style={{display:"grid",gap:16}}>
        {jobLogs.map(log=>(
          <div key={log.id} style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
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
            <div style={{padding:"14px 18px"}}>
              <p style={{color:C.muted,fontSize:13,lineHeight:1.8,margin:0,whiteSpace:"pre-wrap"}}>{log.notes}</p>
            </div>
            {log.photos&&log.photos.length>0&&(
              <div style={{padding:"0 18px 18px"}}>
                <div style={{fontSize:11,color:C.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Photos ({log.photos.length})</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:8}}>
                  {log.photos.map((photo,pi)=>(
                    <div key={pi} onClick={()=>setLightbox(photo.url||photo)} style={{cursor:"zoom-in",borderRadius:8,overflow:"hidden",aspectRatio:"1",background:C.border}}>
                      <img src={photo.url||photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.2s"}}
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
    </div>}

    {/* ── MESSAGES ── */}
    {portalTab==="messages"&&<div>
      <div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:12,padding:20}}>
        <div style={{fontSize:13,color:C.white,fontWeight:700,marginBottom:4}}>💬 Project Messages</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Send a message to Tall Guy Builds — we'll reply here.</div>
        <MessageThread jobId={selJob?.id} senderType="client" senderName={selJob?.client||"Client"}/>
      </div>
    </div>}

    {/* Footer */}
    <div style={{textAlign:"center",padding:"32px 0 16px",borderTop:`1px solid ${C.border}`,marginTop:32}}>
      <div style={{fontSize:11,color:C.gold,letterSpacing:1.5,fontWeight:600}}>BUILT RIGHT. DESIGNED TO LAST.</div>
      <div style={{fontSize:11,color:C.muted,marginTop:4}}>Tall Guy Builds Inc. · (306)737-5407 · Regina, Saskatchewan</div>
    </div>

    {/* Lightbox */}
    {lightbox&&<div onClick={()=>setLightbox(null)} style={{position:"fixed",inset:0,background:"#000000DD",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"zoom-out"}}>
      <img src={lightbox} alt="" style={{maxWidth:"100%",maxHeight:"90vh",borderRadius:10,boxShadow:"0 0 80px #000"}}/>
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
      {[{label:"Active Jobs",value:active.length,sub:"in progress",color:C.gold},{label:"Pipeline",value:fmt$(pipe),sub:"open leads",color:"#60A5FA"},{label:"Remaining",value:fmt$(out),sub:"to invoice",color:C.warn},{label:"Won",value:fmt$(won),sub:"closed",color:"#4ade80"}].map(k=>(
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
      <div key={l.id} onClick={()=>setPage("leads")} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<3?`1px solid ${C.border}`:"none",flexWrap:"wrap",gap:7,cursor:"pointer"}}>
        <div><span style={{color:C.white,fontWeight:600,fontSize:12}}>{l.name}</span><span style={{color:C.muted,fontSize:11,marginLeft:7}}>{l.type}</span></div>
        <div style={{display:"flex",gap:9,alignItems:"center"}}><span style={{color:C.gold,fontWeight:700,fontSize:12}}>{fmt$(l.value)}</span><Badge label={l.stage}/></div>
      </div>
    ))}</Card>
  </div>;
}

// ── CLIENT ASSIGNMENT (in Jobs modal) ────────────────────────────────────────
function ClientAssignment({jobId,allClients,onClientsChange,onEmailSuggested}){
  const [assigned,setAssigned]=useState([]);
  const [loading,setLoading]=useState(true);
  const [adding,setAdding]=useState(false);
  const [newForm,setNewForm]=useState({name:"",email:"",phone:""});
  const [saving,setSaving]=useState(false);
  const [inviteSent,setInviteSent]=useState({});
  const nf=(k,v)=>setNewForm(p=>({...p,[k]:v}));

  useEffect(()=>{
    if(!jobId){setLoading(false);return;}
    supabase.from("client_jobs").select("client_id, clients(id,name,email,phone)").eq("job_id",jobId).then(({data})=>{
      setAssigned((data||[]).map(r=>r.clients).filter(Boolean));
      setLoading(false);
    });
  },[jobId]);

  async function sendInvite(email){
    if(!email)return;
    const {error}=await supabase.auth.signInWithOtp({
      email:email.trim().toLowerCase(),
      options:{emailRedirectTo:"https://app.tallguybuilds.ca?portal=1"}
    });
    if(!error)setInviteSent(p=>({...p,[email]:true}));
  }

  async function addExisting(clientId){
    const client=allClients.find(c=>c.id===clientId);
    if(!client||assigned.find(a=>a.id===clientId))return;
    await supabase.from("client_jobs").insert({job_id:jobId,client_id:clientId});
    const updated=[...assigned,client];
    setAssigned(updated);
    onClientsChange&&onClientsChange(updated);
    if(client.email){onEmailSuggested&&onEmailSuggested(client.email);await sendInvite(client.email);}
  }

  async function createAndAssign(){
    if(!newForm.name.trim()||!newForm.email.trim())return;
    setSaving(true);
    // Upsert client by email (in case they already exist)
    let {data:client}=await supabase.from("clients").upsert({name:newForm.name.trim(),email:newForm.email.trim().toLowerCase(),phone:newForm.phone||null},{onConflict:"email"}).select().single();
    if(!client){
      // If upsert returned nothing, fetch by email
      const res=await supabase.from("clients").select("*").eq("email",newForm.email.trim().toLowerCase()).single();
      client=res.data;
    }
    if(client&&!assigned.find(a=>a.id===client.id)){
      await supabase.from("client_jobs").insert({job_id:jobId,client_id:client.id});
      const updated=[...assigned,client];
      setAssigned(updated);
      onClientsChange&&onClientsChange(updated);
      if(client.email){onEmailSuggested&&onEmailSuggested(client.email);await sendInvite(client.email);}
    }
    setNewForm({name:"",email:"",phone:""});
    setAdding(false);
    setSaving(false);
  }

  async function remove(clientId){
    await supabase.from("client_jobs").delete().eq("job_id",jobId).eq("client_id",clientId);
    const updated=assigned.filter(a=>a.id!==clientId);
    setAssigned(updated);
    onClientsChange&&onClientsChange(updated);
  }

  const unassigned=allClients.filter(c=>!assigned.find(a=>a.id===c.id));

  if(loading)return <div style={{color:C.muted,fontSize:12,padding:"8px 0"}}>Loading...</div>;
  if(!jobId)return <div style={{color:C.muted,fontSize:12,padding:"8px 0"}}>Save the project first to assign clients.</div>;

  return <div style={{marginBottom:4}}>
    {/* Assigned chips */}
    <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:10}}>
      {assigned.length===0&&<div style={{color:C.muted,fontSize:12}}>No clients assigned yet.</div>}
      {assigned.map(c=>(
        <div key={c.id} style={{display:"flex",alignItems:"center",gap:6,background:C.gold+"22",border:`1px solid ${C.gold}44`,borderRadius:20,padding:"4px 10px 4px 12px"}}>
          <div>
            <div style={{fontSize:12,color:C.gold,fontWeight:600}}>{c.name}</div>
            <div style={{fontSize:10,color:C.muted}}>{c.email}</div>
          </div>
          <button onClick={()=>remove(c.id)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14,lineHeight:1,padding:"0 2px"}}>×</button>
        </div>
      ))}
    </div>

    {/* Add existing client */}
    {unassigned.length>0&&<div style={{marginBottom:8}}>
      <select onChange={e=>{if(e.target.value)addExisting(e.target.value);e.target.value="";}}
        style={{background:C.navy,border:`1px solid ${C.border}`,borderRadius:6,padding:"7px 10px",color:C.muted,fontSize:12,fontFamily:fb,outline:"none",maxWidth:240}}>
        <option value="">+ Assign existing client…</option>
        {unassigned.map(c=><option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}
      </select>
    </div>}

    {/* Add new client inline */}
    {!adding&&<button onClick={()=>setAdding(true)} style={{background:"none",border:`1px dashed ${C.border}`,color:C.muted,borderRadius:6,padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:fb}}>+ New client</button>}
    {adding&&<div style={{background:C.navy,borderRadius:8,padding:"12px",border:`1px solid ${C.border}`,marginTop:6}}>
      <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>New Client</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        <Inp label="Name" value={newForm.name} onChange={v=>nf("name",v)} placeholder="Jane Smith"/>
        <Inp label="Email" type="email" value={newForm.email} onChange={v=>nf("email",v)} placeholder="jane@email.com"/>
      </div>
      <Inp label="Phone (optional)" value={newForm.phone} onChange={v=>nf("phone",v)} placeholder="(306) 555-0000"/>
      <div style={{display:"flex",gap:8,marginTop:4}}>
        <Btn onClick={createAndAssign} style={{opacity:saving?0.6:1}}>{saving?"Saving…":"Add & Assign"}</Btn>
        <Btn variant="ghost" onClick={()=>{setAdding(false);setNewForm({name:"",email:"",phone:""});}}>Cancel</Btn>
      </div>
    </div>}
  </div>;
}

// ── PROJECTS ──────────────────────────────────────────────────────────────────
function Jobs({jobs,setJobs,leads,setMilestonesGlobal,clients=[]}){
  const [showM,setShowM]=useState(false);
  const [sel,setSel]=useState(null);
  const [form,setForm]=useState({});
  const [tab,setTab]=useState("details");
  const [linkSent,setLinkSent]=useState(false);
  const [sendingLink,setSendingLink]=useState(false);
  const [unreadCounts,setUnreadCounts]=useState({});
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  // Load unread message counts for all jobs (admin = messages where read_by_admin is false)
  useEffect(()=>{
    supabase.from("messages").select("job_id").eq("read_by_admin",false).then(({data})=>{
      const counts={};
      (data||[]).forEach(m=>{counts[m.job_id]=(counts[m.job_id]||0)+1;});
      setUnreadCounts(counts);
    });
  },[jobs]);

  // Build client list from leads (Won + all others deduplicated by name)
  const clientNames=[...new Set(leads.map(l=>l.name).filter(Boolean))].sort();

  function openNew(){setForm({name:"",client:"",client_email:"",address:"",type:"",status:"Upcoming",value:"",paid:"",start_date:"",end_date:"",progress:0,notes:"",shared_with_client:false,payment_schedule:[]});setSel(null);setTab("details");setLinkSent(false);setShowM(true);}
  function openEdit(j){setForm({...j,value:String(j.value||""),paid:String(j.paid||""),client_email:j.client_email||"",payment_schedule:j.payment_schedule||[]});setSel(j);setTab("details");setLinkSent(false);setShowM(true);}

  // When a client is selected from dropdown, also pull email if the lead has one
  function selectClient(name){
    const lead=leads.find(l=>l.name===name);
    f("client",name);
    if(lead?.email&&!form.client_email)f("client_email",lead.email||"");
  }

  // Send (or re-send) the magic link to the client's email
  async function sendPortalLink(email){
    if(!email){alert("Add the client's email address first, then send the portal link.");return;}
    setSendingLink(true);
    const {error}=await supabase.auth.signInWithOtp({
      email:email.trim().toLowerCase(),
      options:{emailRedirectTo:"https://app.tallguybuilds.ca?portal=1"}
    });
    setSendingLink(false);
    if(error){
      // Supabase rate-limits OTP sends to once per 60s — show a friendly message instead of a raw error
      if(error.message?.toLowerCase().includes("security purposes")||error.status===429){
        setLinkSent(true); // treat as success since the link was already sent moments ago
        setTimeout(()=>setLinkSent(false),5000);
      } else {
        alert("Couldn't send portal link: "+error.message);
      }
      return;
    }
    setLinkSent(true);
    setTimeout(()=>setLinkSent(false),5000);
  }

  async function save(switchToMilestones=false){
    // Strip any fields that don't exist as columns to avoid RLS/schema errors
    const u={
      name:form.name||"",
      client:form.client||null,
      client_email:form.client_email||null,
      address:form.address||null,
      type:form.type||null,
      status:form.status||"Upcoming",
      value:+form.value||0,
      paid:+form.paid||0,
      progress:+form.progress||0,
      start_date:form.start_date||null,
      end_date:form.end_date||null,
      notes:form.notes||null,
      shared_with_client:form.shared_with_client||false,
      payment_schedule:form.payment_schedule||[],
    };
    const wasShared=sel?.shared_with_client||false;
    const nowShared=form.shared_with_client||false;
    if(sel){
      const {data,error}=await supabase.from("jobs").update(u).eq("id",sel.id).select().single();
      if(error){alert("Save failed: "+error.message);return;}
      if(data)setJobs(js=>js.map(j=>j.id===sel.id?data:j));
    } else {
      const {data,error}=await supabase.from("jobs").insert(u).select().single();
      if(error){alert("Save failed: "+error.message);return;}
      if(data){setJobs(js=>[data,...js]);setSel(data);}
    }
    // Auto-send portal link the first time sharing is enabled
    if(!wasShared&&nowShared&&form.client_email){
      await sendPortalLink(form.client_email);
    }
    if(switchToMilestones){setTab("milestones");}else{setShowM(false);}
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
              {unreadCounts[job.id]>0&&<div style={{fontSize:10,color:"#fff",background:"#EF4444",borderRadius:12,padding:"1px 7px",marginTop:4,display:"inline-block",fontWeight:700}}>💬 {unreadCounts[job.id]} new</div>}
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
      <div style={{display:"flex",gap:6,marginBottom:16,borderBottom:`1px solid ${C.border}`,paddingBottom:8,flexWrap:"wrap"}}>
        {["details","milestones","payments","messages"].map(t=>(
          <button key={t} onClick={()=>{
            if((t==="milestones"||t==="payments"||t==="messages")&&!sel){save(true);}
            else if(t==="milestones"){save(true);}
            else{setTab(t);}
          }} style={{padding:"5px 13px",borderRadius:6,border:"none",fontFamily:fb,fontSize:12,cursor:"pointer",textTransform:"capitalize",background:tab===t?C.gold:"transparent",color:tab===t?C.navy:C.muted,fontWeight:tab===t?700:400,position:"relative"}}>
            {t}
            {t==="messages"&&sel&&unreadCounts[sel.id]>0&&<span style={{position:"absolute",top:-4,right:-4,background:"#EF4444",color:"#fff",borderRadius:"50%",width:14,height:14,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{unreadCounts[sel.id]}</span>}
          </button>
        ))}
      </div>
      {tab==="details"&&<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
          <Inp label="Project Name" value={form.name||""} onChange={v=>f("name",v)}/>
          <div style={{marginBottom:11}}>
            <label style={{display:"block",fontSize:11,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.06em"}}>Client</label>
            <select value={form.client||""} onChange={e=>selectClient(e.target.value)} style={{width:"100%",background:C.navy,border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 11px",color:form.client?C.white:C.muted,fontSize:13,fontFamily:fb,outline:"none",boxSizing:"border-box"}}>
              <option value="">Select client…</option>
              {clientNames.map(n=><option key={n} value={n}>{n}</option>)}
              <option value="__new__">+ Type a new name…</option>
            </select>
            {form.client==="__new__"&&<input autoFocus placeholder="Enter client name" style={{width:"100%",marginTop:6,background:C.navy,border:`1px solid ${C.gold}`,borderRadius:6,padding:"8px 11px",color:C.white,fontSize:13,fontFamily:fb,outline:"none",boxSizing:"border-box"}} onChange={e=>f("client",e.target.value||"__new__")}/>}
          </div>
        </div>
        <Inp label="Client Email (for milestone notifications)" type="email" value={form.client_email||""} onChange={v=>f("client_email",v)} placeholder="client@email.com"/>
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
        <div style={{padding:"14px 16px",background:C.navy,borderRadius:10,border:`1px solid ${form.shared_with_client?C.gold:C.border}`,marginBottom:4}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:13,color:C.white,fontWeight:600}}>Share with Client Portal</div>
              <div style={{fontSize:11,color:C.muted,marginTop:3}}>Client can see progress, milestones, and flagged site updates</div>
            </div>
            <Toggle checked={form.shared_with_client||false} onChange={v=>f("shared_with_client",v)}/>
          </div>
          {form.shared_with_client&&<div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            {form.client_email
              ?<>
                <button
                  onClick={()=>sendPortalLink(form.client_email)}
                  disabled={sendingLink}
                  style={{padding:"7px 14px",background:C.gold,border:"none",borderRadius:7,color:C.navy,fontFamily:fb,fontSize:12,fontWeight:700,cursor:sendingLink?"not-allowed":"pointer",opacity:sendingLink?0.6:1}}>
                  {sendingLink?"Sending…":"📨 Send Portal Link"}
                </button>
                {linkSent&&<span style={{fontSize:12,color:"#4ade80",fontFamily:fb}}>✓ Link sent to {form.client_email}</span>}
                {!linkSent&&<span style={{fontSize:11,color:C.muted}}>Sends a sign-in link to {form.client_email}</span>}
              </>
              :<span style={{fontSize:11,color:C.warn}}>⚠ Add a client email above to send the portal link</span>
            }
          </div>}
        </div>
        {/* Client assignment */}
        <div style={{background:C.navy,borderRadius:10,border:`1px solid ${C.border}`,padding:"14px 16px",marginTop:10}}>
          <div style={{fontSize:13,color:C.white,fontWeight:600,marginBottom:10}}>Assigned Clients</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:10}}>Clients below can log in and see this project in their portal.</div>
          <ClientAssignment jobId={sel?.id} allClients={clients} onEmailSuggested={email=>{if(!form.client_email)f("client_email",email);}}/>
        </div>
      </>}
      {tab==="milestones"&&sel&&<Milestones jobId={sel.id} job={{...sel,...form}} onAdd={m=>setMilestonesGlobal&&setMilestonesGlobal(prev=>[...prev,m])} onDelete={id=>setMilestonesGlobal&&setMilestonesGlobal(prev=>prev.filter(m=>m.id!==id))}/>}
      {tab==="milestones"&&!sel&&<div style={{color:C.muted,fontSize:12,padding:"20px 0",textAlign:"center"}}>Save the project first, then add milestones.</div>}
      {tab==="payments"&&<PaymentScheduleEditor schedule={form.payment_schedule||[]} contractValue={+form.value||0} onChange={v=>f("payment_schedule",v)}/>}
      {tab==="messages"&&sel&&<>
        <div style={{fontSize:11,color:C.muted,marginBottom:12}}>Direct messages with <strong style={{color:C.white}}>{sel.client||"client"}</strong>. Client sees these in their portal under the Messages tab.</div>
        <MessageThread jobId={sel.id} senderType="admin" senderName="Tall Guy Builds"/>
      </>}
      {tab==="messages"&&!sel&&<div style={{color:C.muted,fontSize:12,padding:"20px 0",textAlign:"center"}}>Save the project first to enable messaging.</div>}
      {tab!=="messages"&&<div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:14}}>
        {sel&&<Btn variant="danger" onClick={del}>Delete</Btn>}
        <Btn variant="ghost" onClick={()=>setShowM(false)}>Cancel</Btn>
        <Btn onClick={()=>save()}>Save</Btn>
      </div>}
    </Modal>}
  </div>;
}


// ── DECK DRAWING TOOL ──────────────────────────────────────────────────────────────
function DeckDrawingTool({ onApply }) {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [stairEdges, setStairEdges] = useState([]);
  const [scale, setScale] = useState(2);
  const [hoverPt, setHoverPt] = useState(null);

  const CELL = 30;
  const CW   = 810;
  const CH   = 570;

  const snap = (v) => Math.round(v / CELL) * CELL;
  const toFt = (px) => (px / CELL) * scale;

  function shoelace(pts) {
    let area = 0;
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += pts[i].x * pts[j].y;
      area -= pts[j].x * pts[i].y;
    }
    return Math.abs(area) / 2;
  }

  function perimeter(pts) {
    let p = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      const dx = pts[j].x - pts[i].x;
      const dy = pts[j].y - pts[i].y;
      p += Math.sqrt(dx * dx + dy * dy);
    }
    return p;
  }

  function edgeMidpoint(pts, ei) {
    const a = pts[ei], b = pts[(ei + 1) % pts.length];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  function nearestEdge(pts, mx, my, thresh) {
    thresh = thresh || 22;
    let best = -1, bestDist = thresh;
    for (let i = 0; i < pts.length; i++) {
      const mid = edgeMidpoint(pts, i);
      const d = Math.hypot(mid.x - mx, mid.y - my);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }

  function polygonClosed() {
    if (points.length < 3 || !hoverPt) return false;
    return Math.hypot(hoverPt.x - points[0].x, hoverPt.y - points[0].y) < CELL * 1.3;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CW, CH);

    ctx.fillStyle = '#1a2332';
    ctx.fillRect(0, 0, CW, CH);

    const cols = Math.floor(CW / CELL);
    const rows = Math.floor(CH / CELL);
    for (let c = 0; c <= cols; c++) {
      const major = c % 5 === 0;
      ctx.strokeStyle = major ? 'rgba(200,169,106,0.35)' : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = major ? 1 : 0.5;
      ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, CH); ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      const major = r % 5 === 0;
      ctx.strokeStyle = major ? 'rgba(200,169,106,0.35)' : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = major ? 1 : 0.5;
      ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(CW, r * CELL); ctx.stroke();
    }

    ctx.fillStyle = 'rgba(200,169,106,0.65)';
    ctx.font = '10px monospace';
    for (let c = 5; c <= cols; c += 5) {
      ctx.fillText((c * scale) + "'", c * CELL + 3, 11);
    }
    for (let r = 5; r <= rows; r += 5) {
      ctx.fillText((r * scale) + "'", 3, r * CELL - 3);
    }

    if (points.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fillStyle = 'rgba(200,169,106,0.15)';
      ctx.fill();
    }

    if (points.length >= 2) {
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        if (i === points.length - 1 && points.length < 3) continue;
        ctx.strokeStyle = '#e0c98a';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        const dx = b.x - a.x, dy = b.y - a.y;
        const eft = Math.round(Math.sqrt(dx*dx+dy*dy)/CELL*scale*10)/10;
        const mx2 = (a.x+b.x)/2, my2 = (a.y+b.y)/2;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(eft + "'", mx2 + 4, my2 - 4);
      }
      if (hoverPt && points.length >= 1 && !polygonClosed()) {
        const last = points[points.length - 1];
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(hoverPt.x, hoverPt.y); ctx.stroke();
        ctx.setLineDash([]);
        const ldx = hoverPt.x - last.x, ldy = hoverPt.y - last.y;
        const liveFt = Math.round(Math.sqrt(ldx*ldx+ldy*ldy)/CELL*scale*10)/10;
        if (liveFt > 0) {
          const lx = hoverPt.x + 10, ly = hoverPt.y - 10;
          const lbl = liveFt + "'";
          ctx.font = 'bold 13px sans-serif';
          const tw = ctx.measureText(lbl).width;
          ctx.fillStyle = 'rgba(26,35,50,0.85)';
          ctx.fillRect(lx - 3, ly - 14, tw + 8, 18);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(lbl, lx + 1, ly);
        }
      }
    }

    stairEdges.forEach(ei => {
      if (ei < points.length) {
        const a = points[ei], b = points[(ei + 1) % points.length];
        ctx.strokeStyle = '#ff9f43'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        const mid = edgeMidpoint(points, ei);
        ctx.fillStyle = '#ff9f43'; ctx.font = 'bold 11px sans-serif';
        ctx.fillText('STAIRS', mid.x - 22, mid.y - 8);
      }
    });

    points.forEach((p, idx) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, idx === 0 ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = idx === 0 ? '#C8A96A' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#1a2332'; ctx.lineWidth = 1.5; ctx.stroke();
    });

    if (hoverPt) {
      const nearFirst = points.length >= 3 && Math.hypot(hoverPt.x - points[0].x, hoverPt.y - points[0].y) < CELL * 1.3;
      ctx.beginPath();
      ctx.arc(nearFirst ? points[0].x : hoverPt.x, nearFirst ? points[0].y : hoverPt.y, nearFirst ? 9 : 5, 0, Math.PI * 2);
      ctx.strokeStyle = nearFirst ? '#C8A96A' : 'rgba(255,255,255,0.5)';
      ctx.lineWidth = nearFirst ? 2.5 : 1;
      ctx.stroke();
    }

    if (points.length >= 3) {
      const areaPx = shoelace(points);
      const areaSqFt = Math.round((areaPx / (CELL * CELL)) * scale * scale);
      const perimFt  = Math.round(perimeter(points) / CELL * scale * 10) / 10;
      ctx.fillStyle = 'rgba(26,35,50,0.85)';
      ctx.fillRect(CW - 168, CH - 54, 163, 48);
      ctx.strokeStyle = 'rgba(200,169,106,0.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(CW - 168, CH - 54, 163, 48);
      ctx.fillStyle = '#C8A96A'; ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Area: ' + areaSqFt + ' sq ft', CW - 160, CH - 33);
      ctx.fillStyle = '#e0e0e0'; ctx.font = '12px sans-serif';
      ctx.fillText('Perimeter: ' + perimFt + ' ft', CW - 160, CH - 14);
    }
  }, [points, stairEdges, hoverPt, scale]);

  function handleMouseMove(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = snap(e.clientX - rect.left);
    const sy = snap(e.clientY - rect.top);
    setHoverPt({ x: sx, y: sy });
  }

  function handleClick(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = snap(e.clientX - rect.left);
    const y = snap(e.clientY - rect.top);

    if (points.length === 0) { setPoints([{ x, y }]); return; }

    if (points.length >= 3) {
      const d = Math.hypot(x - points[0].x, y - points[0].y);
      if (d < CELL * 1.3) return; // close — do nothing on click, shape is done
    }

    // If shape is closed, clicks toggle stair edges
    if (polygonClosed() && points.length >= 3) {
      const ei = nearestEdge(points, x, y);
      if (ei >= 0) {
        setStairEdges(prev => prev.includes(ei) ? prev.filter(i => i !== ei) : [...prev, ei]);
        return;
      }
    }

    setPoints(prev => [...prev, { x, y }]);
  }

  function handleApply() {
    if (points.length < 3) return;
    const areaPx  = shoelace(points);
    const sqft    = Math.round((areaPx / (CELL * CELL)) * scale * scale);
    const perimFt = Math.round(perimeter(points) / CELL * scale * 10) / 10;
    const sc = stairEdges.length;
    const stairsVal = sc === 0 ? 'None' : sc === 1 ? '1 set' : sc === 2 ? '2 sets' : '3 sets';
    onApply({ sqft, perimeter: perimFt, stairs: stairsVal });
  }

  const sqftNow  = points.length >= 3 ? Math.round((shoelace(points) / (CELL * CELL)) * scale * scale) : 0;
  const perimNow = points.length >= 3 ? Math.round(perimeter(points) / CELL * scale * 10) / 10 : 0;
  const isClosed = polygonClosed() || (points.length >= 3 && hoverPt && Math.hypot(hoverPt.x - points[0].x, hoverPt.y - points[0].y) < CELL * 1.3);

  return (
    <div style={{ background:'#1F2A37', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, flexWrap:'wrap', gap:8 }}>
        <span style={{ color:'#C8A96A', fontWeight:700, fontSize:15 }}>Draw Deck Shape</span>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span style={{ color:'#aaa', fontSize:12 }}>Grid scale:</span>
          {[1,2,3,5].map(s => (
            <button key={s} onClick={() => { setPoints([]); setStairEdges([]); setScale(s); }}
              style={{ background: scale===s ? '#C8A96A' : '#2d3f55', color: scale===s ? '#1F2A37' : '#ddd',
                border:'none', borderRadius:5, padding:'4px 10px', fontSize:12, cursor:'pointer', fontWeight: scale===s ? 700 : 400 }}>
              {s}ft/cell
            </button>
          ))}
          <button onClick={() => { setPoints([]); setStairEdges([]); }}
            style={{ background:'#3d2020', color:'#ff8080', border:'none', borderRadius:5, padding:'4px 10px', fontSize:12, cursor:'pointer' }}>
            Clear
          </button>
        </div>
      </div>

      <div style={{ fontSize:12, color:'#7a8fa8', marginBottom:8, lineHeight:1.6 }}>
        <b style={{color:'#C8A96A'}}>Click</b> to place corners &nbsp;&#183;&nbsp;
        <b style={{color:'#C8A96A'}}>Click near gold dot</b> to close shape &nbsp;&#183;&nbsp;
        <b style={{color:'#ff9f43'}}>Click an edge midpoint</b> to mark stairs
      </div>

      <canvas ref={canvasRef} width={CW} height={CH}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverPt(null)}
        style={{ borderRadius:6, cursor:'crosshair', display:'block', maxWidth:'100%',
          border:'1px solid rgba(200,169,106,0.2)' }}
      />

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:10, flexWrap:'wrap', gap:8 }}>
        <div style={{ color:'#ccc', fontSize:13 }}>
          {points.length < 3
            ? <span style={{color:'#7a8fa8'}}>Place at least 3 corners to see measurements</span>
            : <span>
                <b style={{color:'#C8A96A'}}>{sqftNow} sq ft</b>
                <span style={{color:'#555'}}> &nbsp;&#183;&nbsp; </span>
                <b style={{color:'#C8A96A'}}>{perimNow} ft</b> perimeter
                {stairEdges.length > 0 && <span> &nbsp;&#183;&nbsp; <b style={{color:'#ff9f43'}}>{stairEdges.length} stair set{stairEdges.length!==1?'s':''}</b></span>}
              </span>
          }
        </div>
        <button onClick={handleApply} disabled={points.length < 3}
          style={{ background: points.length >= 3 ? '#C8A96A' : '#3a3a3a',
            color: points.length >= 3 ? '#1F2A37' : '#666',
            border:'none', borderRadius:6, padding:'8px 22px', fontWeight:700, fontSize:14,
            cursor: points.length >= 3 ? 'pointer' : 'not-allowed' }}>
          Use These Measurements
        </button>
      </div>
    </div>
  );
}

// ── ESTIMATOR ─────────────────────────────────────────────────────────────────
const EST_FIELDS={
  "Deck":[
    {key:"sqft",label:"Total Deck Sq Ft",type:"number",placeholder:"e.g. 264"},
    {key:"perimeter",label:"Perimeter (linear ft)",type:"number",placeholder:"e.g. 65"},
    {key:"height",label:"Height off ground (ft)",type:"number",placeholder:"e.g. 3"},
    {key:"material",label:"Decking Material",type:"select",options:["Pressure Treated","Cedar","Composite (Trex/Fiberon)"]},
    {key:"stairs",label:"Stair Sets",type:"select",options:["None","1 set","2 sets","3 sets"]},
    {key:"railing",label:"Railing",type:"select",options:["None","Wood railing","Glass/aluminum railing"]},
    {key:"demo",label:"Demo existing deck?",type:"select",options:["No","Yes — small","Yes — large"]},
    {key:"notes",label:"Additional Notes",type:"textarea",placeholder:"Fascia boards, lighting, pergola, etc."},
  ],
  "Basement Development":[
    {key:"sqft",label:"Total Sq Ft to Develop",type:"number",placeholder:"e.g. 900"},
    {key:"bedrooms",label:"Bedrooms",type:"select",options:["0","1","2","3"]},
    {key:"bathrooms",label:"Bathrooms",type:"select",options:["0","1 — 3pc","1 — 4pc","2"]},
    {key:"laundry",label:"Laundry Room",type:"select",options:["No","Yes — rough-in only","Yes — finished"]},
    {key:"wetbar",label:"Wet Bar",type:"select",options:["No","Yes — basic","Yes — full"]},
    {key:"egress",label:"Egress Window",type:"select",options:["No","Yes — 1 window","Yes — 2 windows"]},
    {key:"ceiling",label:"Ceiling Type",type:"select",options:["Drywall","Drop ceiling (T-bar)","Mix of both"]},
    {key:"flooring",label:"Flooring",type:"select",options:["LVP/Laminate","Carpet","Tile","Mix"]},
    {key:"notes",label:"Additional Notes",type:"textarea",placeholder:"Existing framing? Mechanical room?"},
  ],
  "Garage":[
    {key:"length",label:"Length (ft)",type:"number",placeholder:"e.g. 24"},
    {key:"width",label:"Width (ft)",type:"number",placeholder:"e.g. 26"},
    {key:"stalls",label:"Stalls",type:"select",options:["1 car","2 car","3 car"]},
    {key:"doors",label:"Garage Doors",type:"select",options:["1 standard","2 standard","1 oversized","2 oversized"]},
    {key:"sidedoor",label:"Side Entry Door",type:"select",options:["No","Yes — 1","Yes — 2"]},
    {key:"finish",label:"Interior Finish",type:"select",options:["Framed only","Insulated + drywalled","Fully finished with heat"]},
    {key:"electrical",label:"Electrical",type:"select",options:["Basic (lights + outlets)","Heavy (220V, panel, EV plug)","None — rough-in only"]},
    {key:"roof",label:"Roof Style",type:"select",options:["Standard gable","Hip roof","Gable with dormer"]},
    {key:"notes",label:"Additional Notes",type:"textarea",placeholder:"Heated slab? RV door? Extra height?"},
  ]
};

function EstFieldInput({field,value,onChange}){
  const s={width:"100%",background:C.navy,border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 11px",color:C.white,fontSize:13,fontFamily:fb,outline:"none",boxSizing:"border-box"};
  if(field.type==="select")return<select value={value||""} onChange={e=>onChange(field.key,e.target.value)} style={s}><option value="">Select...</option>{field.options.map(o=><option key={o} value={o}>{o}</option>)}</select>;
  if(field.type==="textarea")return<textarea value={value||""} onChange={e=>onChange(field.key,e.target.value)} placeholder={field.placeholder} rows={3} style={{...s,resize:"vertical"}}/>;
  return<input type="number" value={value||""} onChange={e=>onChange(field.key,e.target.value)} placeholder={field.placeholder} style={s}/>;
}

function Estimator({jobs=[],leads=[]}){
  const [estStep,setEstStep]=useState(1);
  const [projectType,setProjectType]=useState("");
  const [clientName,setClientName]=useState("");
  const [address,setAddress]=useState("");
  const [inputs,setInputs]=useState({});
  const [loading,setLoading]=useState(false);
  const [quote,setQuote]=useState(null);
  const [editingItem,setEditingItem]=useState(null);
  const [markup,setMarkup]=useState(20);
  const [drawMode,setDrawMode]=useState(false);
  // Save Estimate state
  const [showSaveModal,setShowSaveModal]=useState(false);
  const [saveTarget,setSaveTarget]=useState("lead"); // "lead" | "job"
  const [saveTargetId,setSaveTargetId]=useState("");
  const [saving,setSaving]=useState(false);
  const [savedMsg,setSavedMsg]=useState("");
  function setField(k,v){setInputs(p=>({...p,[k]:v}));}
  function resetEst(){setEstStep(1);setProjectType("");setClientName("");setAddress("");setInputs({});setQuote(null);setEditingItem(null);setSavedMsg("");}

  async function saveEstimate(){
    if(!saveTargetId){alert("Please select a project or lead to attach this estimate to.");return;}
    setSaving(true);
    const payload={
      project_type:projectType,client_name:clientName||null,address:address||null,
      summary:quote.summary,line_items:quote.lineItems,estimated_days:quote.estimatedDays,
      assumptions:quote.assumptions||[],exclusions:quote.exclusions||[],
      markup_pct:markup,subtotal,markup_amt:markupAmt,gst,total,
      job_id:saveTarget==="job"?saveTargetId:null,
      lead_id:saveTarget==="lead"?saveTargetId:null,
    };
    const {error}=await supabase.from("estimates").insert(payload);
    setSaving(false);
    if(error){alert("Could not save estimate: "+error.message);return;}
    setSavedMsg("Estimate saved!");setSavedMsg("");
    setShowSaveModal(false);
    setTimeout(()=>setSavedMsg("✓ Saved"),100);
    setTimeout(()=>setSavedMsg(""),3000);
  }

  async function generate(){
    setLoading(true);setQuote(null);
    const fields=EST_FIELDS[projectType];
    const summary=fields.map(f=>`${f.label}: ${inputs[f.key]||"not specified"}`).join("\n");
    try{
      const res=await fetch("/.netlify/functions/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,messages:[{role:"user",content:`You are an expert construction estimator for Tall Guy Builds Inc. in Regina, Saskatchewan.

CRITICAL RULES:
- Calculate ALL quantities mathematically from the dimensions provided. Do NOT guess or round up wildly.
- For a deck: perimeter = 2×(length+width). Fascia = perimeter lf. Decking boards = area (sqft). Joists = every 16" across width. Posts = every 8ft along perimeter.
- For a garage: floor area = length×width. Framing lumber based on actual wall heights and stud spacing.
- For a basement: all quantities must be derived from the square footage provided.
- Price ALL labour as FLAT RATES per scope of work — NEVER use hourly billing. Hourly billing penalizes efficiency and undervalues skilled work.- Each labour line item is one complete deliverable (e.g. "Framing &amp; structure", "Decking installation", "Stair build and landing", "Demo &amp; haul-away"). Price what that scope is WORTH in the Regina SK market, not hours spent.- Regina SK flat-rate labour benchmarks (2025-2026): Minor task $400–900 | Mid scope $1,200–3,500 | Large scope $4,000–12,000+. Price at full market value for quality craftsmanship.- DECK-SPECIFIC LABOUR RATES (labour component, apply whether labour-only or supply+install): Deck framing $6.50/sqft | Composite inlay decking $6/sqft | Composite border/picture frame $7/sqft | Stairs (fully enclosed supply+install — stringers, treads, risers, fascia, enclosed sides): $275 per linear foot of stair WIDTH (e.g. 6ft wide = $1,650 / 6ft10in wide = $1,869). Width is the main cost driver. For labour-only stair jobs use ~$800/set | Aluminum railing install $25/linear ft | Glass railing install $40/linear ft | Fascia install $5-6/linear ft (NOT sqft — fascia is priced per linear foot of deck perimeter). For supply+install jobs add materials + 20% markup on top of these labour rates. For labour-only jobs charge labour rates only.- TUDS MARKET BENCHMARKS (Regina SK, use to sanity-check deck quotes): ~263 sqft low deck (2–3 ft off grade, mid composite, single picture frame, aluminum railing): TUDS managed install $9,879–$10,918, total project $15,404–$17,024. ~288 sqft elevated deck (helical piles, mid composite, double picture frame, aluminum+glass railing): TUDS managed install $9,506–$11,049, total project $27,726–$32,232. Target 5–15% below TUDS total to be competitive.- NEVER output labour items with unit "hrs". All labour must be qty:1, unit:"ls" (lump sum). This is non-negotiable.

MATERIAL PRICING — use these exact prices from Fries Tallman Lumber Regina (contractor pricing, September 2025):

PRESSURE TREATED FRAMING LUMBER (Fries Tallman contractor prices):
- 2x8x10 PT: $21.69/board
- 2x8x16 PT: $34.71/board
- 2x10x16 PT: $45.85/board
- 2x12x12 PT (stair stringers): $48.39/board
- 4x4x8 PT post: $16.95/board
- Scale other sizes proportionally (e.g. 2x8x12 ~$26, 2x8x20 ~$43, 4x4x12 ~$25)
- Simpson LUS28Z 2x8 joist hanger (galvanized): $2.37/ea

COMPOSITE DECKING — Trex Transcend (high end, Fries Tallman contractor prices):
- 16ft grooved board: $159.98/board = $10.00/lf
- 20ft square edge board: $202.77/board = $10.14/lf
- 1x12 fascia 12ft board: $203.63/board
- Fascia boards come in 12ft or 20ft — always round perimeter UP to nearest full board length
- Cortex fascia fastener kit (100lf): $124.15/box
- Cortex field fastener kit (100lf): $156.19/box

COMPOSITE DECKING — Trex Enhance Naturals (mid grade, TUDS retail minus 15%):
- 16ft grooved: ~$79/board = $4.94/lf
- 20ft solid/grooved: ~$98/board
- 12ft grooved: ~$59/board
- 7.25" riser: ~$114/board
- 12" fascia (12ft): ~$183/board — round perimeter to nearest full board

COMPOSITE DECKING — Eva-Last Apex Plus (premium, TUDS retail minus 15%):
- 12ft grooved: ~$109/board = $9.08/lf
- 16ft grooved: ~$145/board
- 20ft solid/grooved: ~$181/board
- 7.25" riser: ~$139/board
- 12" fascia (12ft): ~$209/board — round perimeter to nearest full board

GLASS RAILING:
- Matelux tempered 6mm glass panels: $24.50/panel (Fries Tallman)
- Typical panel coverage ~6" wide, calculate panels from linear footage

ALUMINUM RAILING (Vista or Regal textured black — most common):
- Supply only: ~$55-70/lf

GENERAL RULES:
- Always round board counts UP — never partial boards
- Calculate ALL quantities mathematically from dimensions first
- For fascia: perimeter = 2x(length+width), round up to board lengths
- For decking: area = length x width, add 10% waste factor
- For joists: quantity = (deck width / 16") + 1, use nearest available board length
- Keep line items concise — 8-15 items max. Group similar work together.

Project: ${projectType}
Client: ${clientName||"TBD"}, Address: ${address||"TBD"}
Details:
${summary}

Return ONLY valid JSON, no markdown, no explanation:
{"summary":"one sentence scope","estimatedDays":5,"lineItems":[{"category":"Labour","description":"item","qty":1,"unit":"ls","rate":4500,"total":4500},{"category":"Materials","description":"item","qty":20,"unit":"ea","rate":25.00,"total":500}],"assumptions":["string"],"exclusions":["string"]}`}]})});
      const rawText=await res.text();
      if(!res.ok){alert("API error "+res.status+": "+rawText.slice(0,200));setLoading(false);return;}
      let data;try{data=JSON.parse(rawText);}catch(je){alert("Bad response (status "+res.status+"): "+rawText.slice(0,300));setLoading(false);return;}
      const text=data.content?.find(b=>b.type==="text")?.text||"";
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      setQuote(parsed);setEstStep(3);
    }catch(e){alert("Error generating estimate: "+e.message);}
    setLoading(false);
  }

  function updateItem(idx,field,val){setQuote(q=>{const items=[...q.lineItems];items[idx]={...items[idx],[field]:field==="description"||field==="unit"?val:parseFloat(val)||0};if(field==="qty"||field==="rate")items[idx].total=items[idx].qty*items[idx].rate;return{...q,lineItems:items};});}
  function removeItem(idx){setQuote(q=>({...q,lineItems:q.lineItems.filter((_,i)=>i!==idx)}));}
  function addItem(cat){setQuote(q=>({...q,lineItems:[...q.lineItems,{category:cat,description:"New item",qty:1,unit:"ls",rate:0,total:0}]}));}

  const subtotal=quote?.lineItems?.reduce((s,i)=>s+i.total,0)||0;
  const markupAmt=subtotal*(markup/100);
  const gst=(subtotal+markupAmt)*0.05;
  const total=subtotal+markupAmt+gst;
  const fmt$=n=>"$"+n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,",");

  function printQuote(){
    const w=window.open("","_blank");
    const today=new Date().toLocaleDateString("en-CA");
    const labourItems=quote.lineItems.filter(i=>i.category==="Labour");
    const matItems=quote.lineItems.filter(i=>i.category==="Materials");
    const tr=items=>items.map(i=>i.unit==="ls"?`<tr><td>${i.description}</td><td colspan="3" style="color:#C8A96A;font-size:11px;font-weight:700;letter-spacing:0.5px">FLAT RATE</td><td style="font-weight:700">${fmt$(i.total)}</td></tr>`:`<tr><td>${i.description}</td><td>${i.qty}</td><td>${i.unit}</td><td>${fmt$(i.rate)}</td><td style="font-weight:700">${fmt$(i.total)}</td></tr>`).join("");
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Estimate — ${clientName||projectType}</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;color:#1F2A37}.hdr{background:#1F2A37;padding:28px 40px}.co{font-size:22px;font-weight:700;color:#C8A96A}.sub{font-size:11px;color:#aaa;margin-top:4px}.body{padding:28px 40px}.meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;background:#f5f5f5;padding:16px;border-radius:8px;margin-bottom:24px}.ml{font-size:10px;text-transform:uppercase;color:#888;margin-bottom:2px}.mv{font-size:13px;font-weight:600}h3{font-size:12px;text-transform:uppercase;color:#C8A96A;margin:20px 0 8px;border-bottom:2px solid #C8A96A;padding-bottom:4px}table{width:100%;border-collapse:collapse}th{background:#1F2A37;color:#fff;padding:8px 10px;font-size:11px;text-align:left}td{padding:8px 10px;font-size:12px;border-bottom:1px solid #eee}tr:nth-child(even) td{background:#fafafa}.totals{display:flex;justify-content:flex-end;margin-top:20px}.tbox{min-width:280px}.trow{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid #eee}.tfinal{display:flex;justify-content:space-between;padding:10px 0 0;font-size:17px;font-weight:700;border-top:2px solid #C8A96A;margin-top:4px}.notes{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px}.nbox{background:#f5f5f5;padding:14px;border-radius:6px}.nbox h4{font-size:10px;text-transform:uppercase;color:#888;margin-bottom:8px}.nbox li{font-size:11px;color:#555;margin-bottom:4px;list-style:disc;margin-left:14px}.disc{margin-top:24px;background:#fff8ee;border:1px solid #C8A96A;border-radius:6px;padding:12px;font-size:11px;color:#777}.ftr{background:#1F2A37;color:#888;text-align:center;padding:14px;font-size:11px;margin-top:32px}.ftr span{color:#C8A96A}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div class="hdr"><div class="co">TALL GUY BUILDS INC.</div><div class="sub">Built Right. Designed to Last. | tallguybuilds.ca | 306-737-5407 | Regina, SK</div></div><div class="body"><div style="display:flex;justify-content:space-between;margin-bottom:20px"><div><div style="font-size:22px;font-weight:700">ESTIMATE</div><div style="color:#666;font-size:13px;margin-top:4px">${quote.summary}</div></div><div style="text-align:right"><div style="font-size:10px;color:#888">Date</div><div style="font-weight:600">${today}</div></div></div><div class="meta"><div><div class="ml">Client</div><div class="mv">${clientName||"—"}</div></div><div><div class="ml">Address</div><div class="mv">${address||"—"}</div></div><div><div class="ml">Project</div><div class="mv">${projectType}</div></div><div><div class="ml">Duration</div><div class="mv">${quote.estimatedDays} working days</div></div></div>${labourItems.length?`<h3>Labour</h3><table><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Total</th></tr></thead><tbody>${tr(labourItems)}</tbody></table>`:""}${matItems.length?`<h3>Materials</h3><table><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Total</th></tr></thead><tbody>${tr(matItems)}</tbody></table>`:""}<div class="totals"><div class="tbox"><div class="trow"><span>Subtotal</span><span>${fmt$(subtotal)}</span></div><div class="trow"><span>Overhead &amp; Profit (${markup}%)</span><span>${fmt$(markupAmt)}</span></div><div class="trow"><span>GST (5%)</span><span>${fmt$(gst)}</span></div><div class="tfinal"><span>TOTAL</span><span>${fmt$(total)}</span></div></div></div><div class="notes">${quote.assumptions?.length?`<div class="nbox"><h4>Assumptions</h4><ul>${quote.assumptions.map(a=>`<li>${a}</li>`).join("")}</ul></div>`:""}${quote.exclusions?.length?`<div class="nbox"><h4>Exclusions</h4><ul>${quote.exclusions.map(e=>`<li>${e}</li>`).join("")}</ul></div>`:""}</div><div class="disc"><strong>Note:</strong> Preliminary estimate only. Final pricing subject to site visit. Valid 30 days. All prices CAD.</div></div><div class="ftr"><span>Tall Guy Builds Inc.</span> | Regina, SK | 306-737-5407 | tallguybuilds.ca | @tallguybuildssk</div><script>window.onload=()=>window.print();</script></body></html>`);
    w.document.close();
  }

  const IS=s=>({width:"100%",background:C.navy,border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 11px",color:C.white,fontSize:13,fontFamily:fb,outline:"none",boxSizing:"border-box",...s});
  const TYPES=["Deck","Basement Development","Garage"];
  const ICONS={"Deck":"🪵","Basement Development":"🏗️","Garage":"🚗"};

  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
      <h1 style={{fontFamily:font,color:C.white,fontSize:26,margin:0}}>Estimator</h1>
      {estStep>1&&<div style={{display:"flex",gap:6,alignItems:"center"}}>
        {["Type","Details","Quote"].map((s,i)=><div key={s} style={{display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:22,height:22,borderRadius:"50%",background:estStep>=i+1?C.gold:C.border,color:estStep>=i+1?C.navy:C.muted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{estStep>i+1?"✓":i+1}</div>
          <span style={{fontSize:11,color:estStep===i+1?C.gold:C.muted}}>{s}</span>
          {i<2&&<span style={{color:C.border,fontSize:10}}>›</span>}
        </div>)}
      </div>}
      {estStep>1&&<Btn variant="ghost" onClick={resetEst}>+ New Estimate</Btn>}
    </div>

    {estStep===1&&<div>
      <p style={{color:C.muted,fontSize:13,marginBottom:20}}>Select a project type to get started</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
        {TYPES.map(type=><div key={type} onClick={()=>setProjectType(type)} style={{background:projectType===type?C.navyLight:C.navy,border:`2px solid ${projectType===type?C.gold:C.border}`,borderRadius:12,padding:"24px 16px",cursor:"pointer",textAlign:"center",transition:"all 0.15s"}}>
          <div style={{fontSize:32,marginBottom:10}}>{ICONS[type]}</div>
          <div style={{color:C.white,fontWeight:700,fontSize:14,marginBottom:4}}>{type}</div>
        </div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
        <div><label style={{color:C.muted,fontSize:11,fontWeight:700,display:"block",marginBottom:5,textTransform:"uppercase"}}>Client Name (optional)</label><input value={clientName} onChange={e=>setClientName(e.target.value)} placeholder="e.g. John Smith" style={IS()}/></div>
        <div><label style={{color:C.muted,fontSize:11,fontWeight:700,display:"block",marginBottom:5,textTransform:"uppercase"}}>Project Address (optional)</label><input value={address} onChange={e=>setAddress(e.target.value)} placeholder="e.g. 123 Main St, Regina" style={IS()}/></div>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end"}}><Btn onClick={()=>setEstStep(2)} disabled={!projectType}>Next: Project Details →</Btn></div>
    </div>}

    {estStep===2&&<div>
      <div style={{marginBottom:20}}>
        <button onClick={()=>setEstStep(1)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,padding:0,marginBottom:8}}>← Back</button>
        <h2 style={{color:C.white,fontFamily:font,fontSize:20,margin:"0 0 4px"}}>{projectType}</h2>
        <p style={{color:C.muted,fontSize:13,margin:0}}>Fill in what you know — AI will estimate anything left blank</p>
      </div>
      {projectType==="Deck"&&(drawMode?<DeckDrawingTool onApply={({sqft,perimeter,stairCount})=>{setField('sqft',String(sqft));setField('perimeter',String(perimeter));setField('stairs',stairCount>0?stairCount+' set'+(stairCount>1?'s':''):'None');setDrawMode(false);}} onCancel={()=>setDrawMode(false)}/>:<button onClick={()=>setDrawMode(true)} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:'10px 16px',background:'#0f1f35',border:'1px dashed #3b82f6',borderRadius:8,color:'#93c5fd',fontSize:13,fontWeight:600,cursor:'pointer',marginBottom:12}}>&#x270F; Draw custom shape — auto-calc sq ft, perimeter &amp; stairs</button>)}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {EST_FIELDS[projectType].map(field=><div key={field.key} style={field.type==="textarea"?{gridColumn:"1 / -1"}:{}}>
          <label style={{color:C.muted,fontSize:11,fontWeight:700,display:"block",marginBottom:5,textTransform:"uppercase"}}>{field.label}</label>
          <EstFieldInput field={field} value={inputs[field.key]} onChange={setField}/>
        </div>)}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:24}}>
        <Btn variant="ghost" onClick={()=>setEstStep(1)}>← Back</Btn>
        <Btn onClick={generate} disabled={loading} style={{minWidth:200}}>{loading?"⚙️ Generating...":"✨ Generate Estimate"}</Btn>
      </div>
    </div>}

    {estStep===3&&quote&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <div>
          <button onClick={()=>setEstStep(2)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,padding:0,marginBottom:6}}>← Edit Details</button>
          <h2 style={{color:C.white,fontFamily:font,fontSize:20,margin:"0 0 4px"}}>{projectType} Estimate</h2>
          <p style={{color:C.muted,fontSize:12,margin:0}}>{quote.summary}</p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <Btn variant="ghost" onClick={generate} disabled={loading}>{loading?"...":"↺ Regenerate"}</Btn>
          <Btn variant="ghost" onClick={()=>setShowSaveModal(true)}>💾 Save Estimate</Btn>
          <Btn onClick={printQuote}>🖨 Print / PDF</Btn>
          {savedMsg&&<span style={{color:"#4ade80",fontSize:12,fontFamily:fb}}>{savedMsg}</span>}
        </div>
      </div>

      {/* ── Save Estimate Modal ── */}
      {showSaveModal&&<Modal title="Save Estimate" onClose={()=>setShowSaveModal(false)}>
        <div style={{fontSize:12,color:C.muted,marginBottom:14}}>Attach this estimate to a lead or project so you can find it later.</div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {["lead","job"].map(t=>(
            <button key={t} onClick={()=>{setSaveTarget(t);setSaveTargetId("");}} style={{flex:1,padding:"9px 0",borderRadius:8,border:`2px solid ${saveTarget===t?C.gold:C.border}`,background:saveTarget===t?C.gold+"22":"transparent",color:saveTarget===t?C.gold:C.muted,fontFamily:fb,fontSize:13,fontWeight:saveTarget===t?700:400,cursor:"pointer"}}>
              {t==="lead"?"📋 Lead / Pipeline":"⬡ Active Project"}
            </button>
          ))}
        </div>
        {saveTarget==="lead"&&<>
          <label style={{display:"block",fontSize:11,color:C.muted,marginBottom:5,textTransform:"uppercase"}}>Select Lead</label>
          <select value={saveTargetId} onChange={e=>setSaveTargetId(e.target.value)} style={{width:"100%",background:C.navy,border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 11px",color:saveTargetId?C.white:C.muted,fontSize:13,fontFamily:fb,outline:"none",boxSizing:"border-box",marginBottom:14}}>
            <option value="">Choose a lead…</option>
            {leads.map(l=><option key={l.id} value={l.id}>{l.name}{l.type?` — ${l.type}`:""}</option>)}
          </select>
        </>}
        {saveTarget==="job"&&<>
          <label style={{display:"block",fontSize:11,color:C.muted,marginBottom:5,textTransform:"uppercase"}}>Select Project</label>
          <select value={saveTargetId} onChange={e=>setSaveTargetId(e.target.value)} style={{width:"100%",background:C.navy,border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 11px",color:saveTargetId?C.white:C.muted,fontSize:13,fontFamily:fb,outline:"none",boxSizing:"border-box",marginBottom:14}}>
            <option value="">Choose a project…</option>
            {jobs.map(j=><option key={j.id} value={j.id}>{j.name}{j.client?` — ${j.client}`:""}</option>)}
          </select>
        </>}
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn variant="ghost" onClick={()=>setShowSaveModal(false)}>Cancel</Btn>
          <Btn onClick={saveEstimate} style={{opacity:saving?0.6:1}}>{saving?"Saving…":"Save Estimate"}</Btn>
        </div>
      </Modal>}

      {(clientName||address)&&<div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 16px",marginBottom:16,display:"flex",gap:24,flexWrap:"wrap"}}>
        {clientName&&<div><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",marginBottom:1}}>Client</div><div style={{color:C.white,fontSize:13,fontWeight:600}}>{clientName}</div></div>}
        {address&&<div><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",marginBottom:1}}>Address</div><div style={{color:C.white,fontSize:13,fontWeight:600}}>{address}</div></div>}
        <div><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",marginBottom:1}}>Duration</div><div style={{color:C.white,fontSize:13,fontWeight:600}}>{quote.estimatedDays} working days</div></div>
      </div>}

      {["Labour","Materials"].map(cat=>{
        const items=quote.lineItems.filter(i=>i.category===cat);
        return <div key={cat} style={{marginBottom:16}}>
          <div style={{color:C.gold,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6,paddingBottom:5,borderBottom:`2px solid ${C.gold}`}}>{cat}</div>
          <div style={{background:C.navyLight,borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
            <div style={{display:"grid",gridTemplateColumns:"3fr 70px 70px 90px 100px 50px",padding:"7px 12px",background:C.navy}}>
              {["Description","Qty","Unit","Rate","Total",""].map(h=><div key={h} style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{h}</div>)}
            </div>
            {items.length===0&&<div style={{padding:"12px",color:C.muted,fontSize:12}}>No items</div>}
            {items.map(item=>{
              const gi=quote.lineItems.indexOf(item);
              const isE=editingItem===gi;
              const IS2=s=>({...IS(),padding:"5px 8px",fontSize:12,...s});
              return <div key={gi} style={{display:"grid",gridTemplateColumns:"3fr 70px 70px 90px 100px 50px",padding:"8px 12px",borderTop:`1px solid ${C.border}`,alignItems:"center",background:isE?C.navy:"transparent"}}>
                {isE?<>
                  <input value={item.description} onChange={e=>updateItem(gi,"description",e.target.value)} style={IS2()}/>
                  <input type="number" value={item.qty} onChange={e=>updateItem(gi,"qty",e.target.value)} style={IS2()}/>
                  <input value={item.unit} onChange={e=>updateItem(gi,"unit",e.target.value)} style={IS2()}/>
                  <input type="number" value={item.rate} onChange={e=>updateItem(gi,"rate",e.target.value)} style={IS2()}/>
                  <div style={{color:C.gold,fontWeight:700,fontSize:13}}>{fmt$(item.total)}</div>
                  <button onClick={()=>setEditingItem(null)} style={{background:C.gold,border:"none",borderRadius:5,color:C.navy,cursor:"pointer",padding:"4px 6px",fontWeight:700,fontSize:11}}>✓</button>
                </>:<>
                  <div style={{color:C.white,fontSize:13}}>{item.description}</div>
                  <div style={{color:C.muted,fontSize:12}}>{item.unit==="ls"?"":item.qty}</div>
                  <div style={{color:C.muted,fontSize:12}}>{item.unit==="ls"?<span style={{background:"rgba(200,169,106,0.15)",color:C.gold,borderRadius:3,padding:"1px 6px",fontSize:10,fontWeight:700,letterSpacing:0.5}}>FLAT RATE</span>:item.unit}</div>
                  <div style={{color:C.muted,fontSize:12}}>{item.unit==="ls"?"":fmt$(item.rate)}</div>
                  <div style={{color:C.gold,fontWeight:700,fontSize:13}}>{fmt$(item.total)}</div>
                  <div style={{display:"flex",gap:3}}>
                    <button onClick={()=>setEditingItem(gi)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,padding:0}}>✏️</button>
                    <button onClick={()=>removeItem(gi)} style={{background:"none",border:"none",color:C.danger,cursor:"pointer",fontSize:15,fontWeight:700,padding:0}}>×</button>
                  </div>
                </>}
              </div>;
            })}
          </div>
          <button onClick={()=>addItem(cat)} style={{background:"none",border:`1px dashed ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",width:"100%",padding:"7px",fontSize:12,marginTop:5}}>+ Add {cat} Line</button>
        </div>;
      })}

      <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
        <div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:12,padding:18,minWidth:290}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`,fontSize:13,color:C.white}}><span>Subtotal</span><span>{fmt$(subtotal)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${C.border}`,fontSize:13,color:C.white}}>
            <span>Overhead & Profit</span>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <input type="number" value={markup} onChange={e=>setMarkup(+e.target.value||0)} style={{width:44,background:C.navy,border:`1px solid ${C.border}`,borderRadius:5,padding:"3px 5px",color:C.white,fontFamily:fb,fontSize:12}}/>
              <span style={{color:C.muted,fontSize:12}}>%</span>
              <span style={{color:C.gold}}>{fmt$(markupAmt)}</span>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`,fontSize:13,color:C.white}}><span>GST (5%)</span><span>{fmt$(gst)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",fontSize:18,fontWeight:700,color:C.gold}}><span>TOTAL</span><span>{fmt$(total)}</span></div>
        </div>
      </div>

      {(quote.assumptions?.length>0||quote.exclusions?.length>0)&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:20}}>
        {quote.assumptions?.length>0&&<div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:10,padding:14}}>
          <div style={{color:C.gold,fontSize:11,fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Assumptions</div>
          {quote.assumptions.map((a,i)=><div key={i} style={{color:C.muted,fontSize:12,marginBottom:4}}>• {a}</div>)}
        </div>}
        {quote.exclusions?.length>0&&<div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:10,padding:14}}>
          <div style={{color:C.danger,fontSize:11,fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Exclusions</div>
          {quote.exclusions.map((e,i)=><div key={i} style={{color:C.muted,fontSize:12,marginBottom:4}}>• {e}</div>)}
        </div>}
      </div>}
    </div>}
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
function Schedule({events,setEvents,jobs,milestones=[],setMilestones}){
  const [showM,setShowM]=useState(false);const [sel,setSel]=useState(null);const [form,setForm]=useState({});
  const [view,setView]=useState("calendar");
  const [calDate,setCalDate]=useState(()=>{const n=new Date();return new Date(Date.UTC(n.getFullYear(),n.getMonth(),1));});
  const [filterJob,setFilterJob]=useState("");
  const [dragId,setDragId]=useState(null);
  const [dragOver,setDragOver]=useState(null);
  const dragJustHappened=useRef(false);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  function openNew(dateStr=""){setForm({title:"",job_id:"",date:dateStr||todayStr(),date_end:"",time:"09:00",type:"site",color:""});setSel(null);setShowM(true);}
  function openEdit(e){setForm({...e,job_id:e.job_id||""});setSel(e);setShowM(true);}

  async function save(){
    const u={...form,job_id:form.job_id||null,date_end:form.date_end||null,color:form.color||null};
    if(sel){
      const {data,error}=await supabase.from("events").update(u).eq("id",sel.id).select().single();
      if(error){alert("Save failed: "+error.message);return;}
      if(data)setEvents(es=>es.map(e=>e.id===sel.id?data:e));
    }else{
      const {data,error}=await supabase.from("events").insert(u).select().single();
      if(error){alert("Save failed: "+error.message);return;}
      if(data)setEvents(es=>[...es,data]);
    }
    setShowM(false);
  }
  async function del(){await supabase.from("events").delete().eq("id",sel.id);setEvents(es=>es.filter(e=>e.id!==sel.id));setShowM(false);}

  // ── Drag handlers (events only, not milestones) ──
  function onDragStart(e,evId){e.stopPropagation();setDragId(evId);e.dataTransfer.effectAllowed="move";}
  function onDragOver(e,ds){e.preventDefault();e.dataTransfer.dropEffect="move";setDragOver(ds);}
  function onDragLeave(){setDragOver(null);}
  async function onDrop(e,ds){
    e.preventDefault();e.stopPropagation();setDragOver(null);
    if(!dragId||!ds)return;
    const ev=events.find(x=>x.id===dragId);
    if(!ev||ev.date===ds){setDragId(null);return;}
    dragJustHappened.current=true;
    setTimeout(()=>{dragJustHappened.current=false;},200);
    const updated={...ev,date:ds};
    setEvents(es=>es.map(x=>x.id===dragId?updated:x));
    await supabase.from("events").update({date:ds}).eq("id",dragId);
    setDragId(null);
  }
  function onDragEnd(){setDragId(null);setDragOver(null);}

  // Calendar helpers
  // calYear/calMonth derived purely from state — no local Date math
  const calYear=calDate.getUTCFullYear();
  const calMonth=calDate.getUTCMonth();

  function calDays(){
    // Build ISO string for first of month — parsed as UTC, getUTCDay() is timezone-proof
    const mm=String(calMonth+1).padStart(2,"0");
    const firstDay=new Date(`${calYear}-${mm}-01T00:00:00Z`).getUTCDay();
    // Last day of month: first of NEXT month minus 1ms
    const nextMm=String(calMonth===11?1:calMonth+2).padStart(2,"0");
    const nextYy=calMonth===11?calYear+1:calYear;
    const total=new Date(Date.UTC(calYear,calMonth+1,0)).getUTCDate();
    const days=[];
    for(let i=0;i<firstDay;i++)days.push(null);
    for(let d=1;d<=total;d++)days.push(d);
    while(days.length%7!==0)days.push(null);
    return days;
  }
  function calStr(d){
    if(!d)return"";
    const mm=String(calMonth+1).padStart(2,"0"),dd=String(d).padStart(2,"0");
    return`${calYear}-${mm}-${dd}`;
  }
  function prevMonth(){
    const d=new Date(Date.UTC(calYear,calMonth-1,1));
    setCalDate(d);
  }
  function nextMonth(){
    const d=new Date(Date.UTC(calYear,calMonth+1,1));
    setCalDate(d);
  }
  const DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];

  const today=todayStr();
  const sorted=[...events].sort((a,b)=>a.date?.localeCompare(b.date));
  const filtered=sorted.filter(e=>!filterJob||e.job_id===filterJob);
  const upcoming=filtered.filter(e=>e.date>=today);
  const past=filtered.filter(e=>e.date<today);
  const mFiltered=milestones.filter(m=>m.date&&(!filterJob||m.job_id===filterJob));
  const allUpcoming=[...upcoming.map(e=>({...e,_type:"event"})),...mFiltered.filter(m=>m.date>=today).map(m=>({...m,title:m.name,_type:"milestone"}))].sort((a,b)=>a.date?.localeCompare(b.date));
  const allPast=[...past.map(e=>({...e,_type:"event"})),...mFiltered.filter(m=>m.date<today).map(m=>({...m,title:m.name,_type:"milestone"}))].sort((a,b)=>b.date?.localeCompare(a.date));

  function evColor(ev){return ev.color||(EC[ev.type]||C.muted);}

  return <div>
    {/* ── Header ── */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
      <h1 style={{fontFamily:fb,fontWeight:800,color:C.white,fontSize:24,margin:0}}>Schedule</h1>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",background:C.navy,borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          {["list","calendar"].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{padding:"7px 16px",border:"none",background:view===v?C.gold:"transparent",color:view===v?C.navy:C.muted,fontFamily:fb,fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:"0.03em"}}>{v==="list"?"☰  List":"▦  Calendar"}</button>
          ))}
        </div>
        <Btn onClick={()=>openNew()}>+ Add Event</Btn>
      </div>
    </div>

    {/* ── Toolbar: project filter + legend ── */}
    <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:16}}>
      <select value={filterJob} onChange={e=>setFilterJob(e.target.value)} style={{background:C.navy,border:`1px solid ${filterJob?C.gold:C.border}`,borderRadius:6,padding:"7px 12px",color:filterJob?C.white:C.muted,fontSize:12,fontFamily:fb,outline:"none",minWidth:180}}>
        <option value="">All Projects</option>
        {jobs.map(j=><option key={j.id} value={j.id}>{j.name}</option>)}
      </select>
      {filterJob&&<button onClick={()=>setFilterJob("")} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,fontFamily:fb}}>✕ Clear</button>}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginLeft:4}}>
        {Object.entries(ET_LABELS).map(([k,lbl])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:10,height:10,borderRadius:2,background:EC[k]}}/>
            <span style={{fontSize:11,color:C.muted,fontFamily:fb}}>{lbl}</span>
          </div>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <div style={{width:10,height:10,borderRadius:2,background:EC.milestone}}/>
          <span style={{fontSize:11,color:C.muted,fontFamily:fb}}>Milestone</span>
        </div>
      </div>
    </div>

    {/* ── LIST VIEW ── */}
    {view==="list"&&<>
      {allUpcoming.length===0&&<div style={{color:C.muted,textAlign:"center",padding:"28px 0",fontSize:13}}>No upcoming events.</div>}
      <div style={{display:"grid",gap:8,marginBottom:24}}>
        {allUpcoming.map(ev=>{
          const job=jobs.find(j=>j.id===ev.job_id);
          const isMilestone=ev._type==="milestone";
          const tc=isMilestone?EC.milestone:evColor(ev);
          return <Card key={(isMilestone?"m":"e")+ev.id} onClick={isMilestone?undefined:()=>openEdit(ev)} style={{padding:"12px 14px",borderLeft:`4px solid ${tc}`,cursor:isMilestone?"default":"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,alignItems:"center"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:8,height:8,borderRadius:2,background:tc,flexShrink:0}}/>
                  <span style={{fontWeight:700,color:C.white,fontSize:13}}>{isMilestone?"🏁 ":""}{ev.title}</span>
                  <span style={{fontSize:10,color:tc,background:tc+"22",padding:"1px 7px",borderRadius:10,fontWeight:600}}>{isMilestone?"Milestone":ET_LABELS[ev.type]||ev.type}</span>
                </div>
                {job&&<div style={{fontSize:11,color:C.muted,marginTop:3,marginLeft:15}}>📁 {job.name}</div>}
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:12,color:C.white,fontWeight:600}}>
                  {fmtDate(ev.date)}{ev.date_end&&ev.date_end>ev.date?` → ${fmtDate(ev.date_end)}`:""}
                </div>
                {ev.time&&!ev.date_end&&<div style={{fontSize:11,color:C.muted}}>{ev.time}</div>}
              </div>
            </div>
          </Card>;
        })}
      </div>
      {allPast.length>0&&<>
        <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Past</div>
        <div style={{display:"grid",gap:6,opacity:0.55}}>
          {allPast.slice(0,5).map(ev=>(
            <Card key={(ev._type==="milestone"?"m":"e")+ev.id} style={{padding:"9px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,color:C.muted}}>{ev._type==="milestone"?"🏁 ":""}{ev.title}</span>
                <span style={{fontSize:11,color:C.muted}}>{fmtDate(ev.date)}</span>
              </div>
            </Card>
          ))}
        </div>
      </>}
    </>}

    {/* ── CALENDAR VIEW ── */}
    {view==="calendar"&&<div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",width:"100%",boxSizing:"border-box"}}>
      {/* Month nav */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 22px",borderBottom:`1px solid ${C.border}`,background:C.navy}}>
        <button onClick={prevMonth} style={{background:"none",border:"none",color:C.gold,fontSize:22,cursor:"pointer",lineHeight:1,padding:"0 10px"}}>‹</button>
        <div style={{fontFamily:fb,fontWeight:800,color:C.white,fontSize:18,letterSpacing:"0.02em"}}>{MONTHS[calMonth]} {calYear}</div>
        <button onClick={nextMonth} style={{background:"none",border:"none",color:C.gold,fontSize:22,cursor:"pointer",lineHeight:1,padding:"0 10px"}}>›</button>
      </div>
      {/* Day-of-week headers */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",borderBottom:`1px solid ${C.border}`,background:C.navy,width:"100%"}}>
        {DAYS.map((d,i)=><div key={d} style={{textAlign:"center",padding:"10px 0",fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:i===0||i===6?"#4B5563":C.muted,overflow:"hidden"}}>{d}</div>)}
      </div>
      {/* Cells — full-height rows */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",width:"100%"}}>
        {calDays().map((d,i)=>{
          const ds=calStr(d);
          const dayEvents=events.filter(e=>{
            if(!d||!ds)return false;
            if(filterJob&&e.job_id!==filterJob)return false;
            if(e.date_end&&e.date_end>e.date)return ds>=e.date&&ds<=e.date_end;
            return e.date===ds;
          });
          const dayMilestones=milestones.filter(m=>m.date===ds&&(!filterJob||m.job_id===filterJob));
          const isToday=ds===today;
          const isDragOver=dragOver===ds&&ds!=="";
          const isWeekend=i%7===0||i%7===6;
          return <div
            key={i}
            onDragOver={d?e=>onDragOver(e,ds):undefined}
            onDragLeave={onDragLeave}
            onDrop={d?e=>onDrop(e,ds):undefined}
            onClick={()=>d&&!dragJustHappened.current&&openNew(ds)}
            style={{
              minHeight:120,
              padding:"8px 8px 6px",
              borderRight:i%7!==6?`1px solid ${C.border}`:"none",
              borderBottom:`1px solid ${C.border}`,
              background:isDragOver?C.gold+"18":isToday?C.gold+"0D":isWeekend?"#1a2535":"transparent",
              cursor:d?"pointer":"default",
              opacity:d?1:0.3,
              transition:"background 0.1s",
              verticalAlign:"top",
              boxSizing:"border-box",
              overflow:"hidden",
            }}>
            {d&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
              <div style={{
                width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",
                borderRadius:"50%",fontSize:13,fontWeight:isToday?800:400,
                background:isToday?C.gold:"transparent",
                color:isToday?C.navy:C.muted,
              }}>{d}</div>
              {(dayEvents.length+dayMilestones.length)>3&&<span style={{fontSize:9,color:C.muted}}>+{dayEvents.length+dayMilestones.length-3}</span>}
            </div>}
            {/* Event chips */}
            {dayEvents.slice(0,3).map(ev=>{
              const tc=evColor(ev);
              const isDragging=dragId===ev.id;
              const isMultiDay=ev.date_end&&ev.date_end>ev.date;
              const isStart=ev.date===ds;
              const isEnd=ev.date_end===ds;
              const chipStyle=isMultiDay?{
                background:tc,borderRadius:isStart?"4px 0 0 4px":isEnd?"0 4px 4px 0":"0",
                marginLeft:isStart?0:-1,marginRight:isEnd?0:-1,
                borderLeft:isStart?`3px solid ${tc+"BB"}`:"none",
              }:{background:tc,borderRadius:4};
              return <div
                key={"e"+ev.id}
                draggable={!isMultiDay}
                onDragStart={!isMultiDay?e=>onDragStart(e,ev.id):undefined}
                onDragEnd={onDragEnd}
                onClick={e=>{e.stopPropagation();openEdit(ev);}}
                style={{
                  ...chipStyle,
                  padding:"3px 7px",
                  marginBottom:3,
                  fontSize:11,
                  fontWeight:600,
                  color:"#fff",
                  overflow:"hidden",
                  whiteSpace:"nowrap",
                  textOverflow:"ellipsis",
                  cursor:isMultiDay?"pointer":"grab",
                  opacity:isDragging?0.4:1,
                  transition:"opacity 0.15s",
                  userSelect:"none",
                }}
                title={ev.title+(isMultiDay?` (${fmtDate(ev.date)} – ${fmtDate(ev.date_end)})`:"")}>
                {(ev.time&&isStart?ev.time.slice(0,5)+" ":"")+ev.title}
              </div>;
            })}
            {/* Milestone chips */}
            {dayMilestones.slice(0,3-Math.min(dayEvents.length,3)).map(m=>(
              <div key={"m"+m.id} onClick={e=>e.stopPropagation()} style={{background:EC.milestone,borderRadius:4,padding:"3px 7px",marginBottom:3,fontSize:11,fontWeight:600,color:"#fff",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",cursor:"default",userSelect:"none"}} title={m.name}>🏁 {m.name}</div>
            ))}
          </div>;
        })}
      </div>
    </div>}

    {/* ── ADD / EDIT MODAL ── */}
    {showM&&<Modal title={sel?"Edit Event":"Add Event"} onClose={()=>setShowM(false)}>
      <Inp label="Event Title" value={form.title||""} onChange={v=>f("title",v)}/>
      <Sel label="Project (optional)" value={form.job_id||""} onChange={v=>f("job_id",v)} options={["",...jobs.map(j=>j.id)]} display={["(No project)",...jobs.map(j=>j.name)]}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9}}>
        <Inp label="Start Date" type="date" value={form.date||""} onChange={v=>f("date",v)}/>
        <Inp label="End Date (optional)" type="date" value={form.date_end||""} onChange={v=>f("date_end",v)}/>
        <Inp label="Time" type="time" value={form.time||""} onChange={v=>f("time",v)}/>
      </div>
      <Sel label="Type" value={form.type||"site"} onChange={v=>f("type",v)} options={EVENT_TYPES} display={EVENT_TYPES.map(t=>ET_LABELS[t]||t)}/>
      {/* Colour picker */}
      <div style={{marginBottom:11}}>
        <label style={{display:"block",fontSize:11,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>Chip Colour (optional — overrides type default)</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          {["","#F59E0B","#3B82F6","#22C55E","#EC4899","#A855F7","#06B6D4","#F97316","#EF4444","#6B7280"].map(clr=>(
            <div key={clr||"default"} onClick={()=>f("color",clr)}
              style={{width:22,height:22,borderRadius:4,background:clr||EC[form.type||"site"],border:`2px solid ${(form.color||"")===(clr)?"#fff":"transparent"}`,cursor:"pointer",flexShrink:0,boxSizing:"border-box",position:"relative"}}
              title={clr?"Custom colour":"Use type default"}>
              {!clr&&<span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",fontWeight:700}}>↺</span>}
            </div>
          ))}
          <input type="color" value={form.color||EC[form.type||"site"]} onChange={e=>f("color",e.target.value)}
            style={{width:28,height:28,border:"none",borderRadius:4,cursor:"pointer",background:"none",padding:0}} title="Pick any colour"/>
        </div>
      </div>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:12}}>
        {sel&&<Btn variant="danger" onClick={del}>Delete</Btn>}
        <Btn variant="ghost" onClick={()=>setShowM(false)}>Cancel</Btn>
        <Btn onClick={save}>Save</Btn>
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
  const [uploadingPhotos,setUploadingPhotos]=useState(false);
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
  // ── Photo upload: stores files in Supabase Storage (bucket: daily-log-photos)
  // rather than as base64 data URLs in the DB row — much better for performance.
  async function handlePhotos(e){
    const files=Array.from(e.target.files);
    e.target.value="";
    if(!files.length)return;
    setUploadingPhotos(true);
    const uploaded=[];
    for(const file of files){
      const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"-");
      const path=`logs/${Date.now()}-${safeName}`;
      const {error:upErr}=await supabase.storage.from("daily-log-photos").upload(path,file,{cacheControl:"3600",upsert:false});
      if(upErr){alert("Photo upload failed: "+upErr.message);continue;}
      const {data:{publicUrl}}=supabase.storage.from("daily-log-photos").getPublicUrl(path);
      uploaded.push({id:Date.now()+Math.random(),name:file.name,url:publicUrl,path});
    }
    if(uploaded.length)setForm(p=>({...p,photos:[...(p.photos||[]),...uploaded]}));
    setUploadingPhotos(false);
  }
  async function removePhoto(photo,idx){
    if(photo.path)await supabase.storage.from("daily-log-photos").remove([photo.path]);
    setForm(p=>({...p,photos:(p.photos||[]).filter((_,i)=>i!==idx)}));
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
        <button onClick={()=>!uploadingPhotos&&fileRef.current.click()} style={{padding:"8px 14px",background:"transparent",border:`1px dashed ${uploadingPhotos?C.muted:C.gold}`,borderRadius:7,color:uploadingPhotos?C.muted:C.gold,fontSize:12,cursor:uploadingPhotos?"not-allowed":"pointer",fontFamily:fb}}>{uploadingPhotos?"⏳ Uploading...":"📷 Upload Photos"}</button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handlePhotos}/>
        {(form.photos||[]).length>0&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(70px,1fr))",gap:6,marginTop:10}}>
            {(form.photos||[]).map((photo,pi)=>(
              <div key={pi} style={{position:"relative",borderRadius:6,overflow:"hidden",aspectRatio:"1",background:C.border}}>
                <img src={photo.url||photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                <button onClick={()=>removePhoto(photo,pi)} style={{position:"absolute",top:2,right:2,background:"#00000099",border:"none",borderRadius:"50%",width:18,height:18,color:C.white,cursor:"pointer",fontSize:12,lineHeight:"18px",padding:0}}>×</button>
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
  const [ej,setEj]=useState({});
  const [qb,setQb]=useState({});
  const [saved,setSaved]=useState(false);
  const [qbSaved,setQbSaved]=useState(false);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    async function loadSettings(){
      const [ejRow,qbRow]=await Promise.all([
        supabase.from("settings").select("value").eq("key","emailjs").maybeSingle(),
        supabase.from("settings").select("value").eq("key","quickbooks").maybeSingle(),
      ]);
      if(ejRow.data?.value){setEj(ejRow.data.value);localStorage.setItem("tgb_emailjs",JSON.stringify(ejRow.data.value));}
      else{const local=JSON.parse(localStorage.getItem("tgb_emailjs")||"{}");setEj(local);}
      if(qbRow.data?.value)setQb(qbRow.data.value);
      setLoading(false);
    }
    loadSettings();
  },[]);

  async function saveEj(){
    await supabase.from("settings").upsert({key:"emailjs",value:ej},{onConflict:"key"});
    localStorage.setItem("tgb_emailjs",JSON.stringify(ej));
    setSaved(true);setTimeout(()=>setSaved(false),2500);
  }
  async function saveQb(){
    await supabase.from("settings").upsert({key:"quickbooks",value:qb},{onConflict:"key"});
    setQbSaved(true);setTimeout(()=>setQbSaved(false),2500);
  }
  async function handleSignOut(){await supabase.auth.signOut();window.location.href="/";}

  return <div>
    <h1 style={{fontFamily:font,color:C.white,fontSize:26,marginBottom:20}}>Settings</h1>
    <Card style={{marginBottom:16}}>
      <div style={{fontWeight:700,color:C.white,fontSize:15,marginBottom:6}}>Tall Guy Builds Inc.</div>
      <div style={{fontSize:12,color:C.gold,fontWeight:600,letterSpacing:1}}>BUILT RIGHT. DESIGNED TO LAST.</div>
      <div style={{fontSize:11,color:C.muted,marginTop:8}}>Regina, Saskatchewan · (306)737-5407</div>
    </Card>

    {/* EmailJS config */}
    <Card style={{marginBottom:16}}>
      <div style={{fontWeight:700,color:C.white,fontSize:15,marginBottom:4}}>📧 Milestone Email Notifications</div>
      <div style={{fontSize:11,color:C.muted,marginBottom:14,lineHeight:1.6}}>
        Automatically emails your client when you mark a milestone complete. Uses <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" style={{color:C.gold}}>EmailJS</a> (free — 200 emails/month).
        <br/>Setup: emailjs.com → Add Service (Gmail) → Create Template → copy your IDs here.
        <br/>Template variables: <span style={{color:C.gold,fontFamily:"monospace"}}>{"{{to_email}} {{client_name}} {{project_name}} {{milestone_name}} {{portal_url}}"}</span>
      </div>
      {loading?<div style={{color:C.muted,fontSize:12}}>Loading…</div>:<>
        <div style={{display:"grid",gap:9}}>
          <Inp label="Service ID" value={ej.service_id||""} onChange={v=>setEj(p=>({...p,service_id:v}))} placeholder="service_xxxxxxx"/>
          <Inp label="Template ID" value={ej.template_id||""} onChange={v=>setEj(p=>({...p,template_id:v}))} placeholder="template_xxxxxxx"/>
          <Inp label="Public Key" value={ej.public_key||""} onChange={v=>setEj(p=>({...p,public_key:v}))} placeholder="your public key"/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:12}}>
          <Btn onClick={saveEj}>Save Email Settings</Btn>
          {saved&&<span style={{color:"#4ade80",fontSize:12}}>✓ Saved to cloud</span>}
        </div>
      </>}
      <div style={{marginTop:12,padding:"10px 14px",background:C.navy,borderRadius:8,fontSize:11,color:C.muted}}>
        💡 <strong style={{color:C.white}}>To enable emails:</strong> Go to each project → add the client's email address in the Client Email field. Emails fire automatically when you tick a milestone as Complete.
      </div>
    </Card>

    {/* QuickBooks Integration */}
    <Card style={{marginBottom:16}}>
      <div style={{fontWeight:700,color:C.white,fontSize:15,marginBottom:4}}>🟢 QuickBooks Integration</div>
      <div style={{fontSize:11,color:C.muted,marginBottom:14,lineHeight:1.7}}>
        When an invoice is marked paid in QuickBooks, the matching payment automatically updates to ✅ Paid in the client portal.
        <br/><strong style={{color:C.gold}}>Step 1:</strong> Create a free account at <a href="https://developer.intuit.com" target="_blank" rel="noreferrer" style={{color:C.gold}}>developer.intuit.com</a> → New App → get your Client ID + Secret.
        <br/><strong style={{color:C.gold}}>Step 2:</strong> In your QB app settings, add a webhook subscription. Set the endpoint URL to the one below.
        <br/><strong style={{color:C.gold}}>Step 3:</strong> Paste your Verifier Token below and save. QB will start sending payment events automatically.
      </div>
      {loading?<div style={{color:C.muted,fontSize:12}}>Loading…</div>:<>
        <div style={{background:C.navy,borderRadius:8,padding:"10px 14px",marginBottom:14,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Webhook Endpoint (paste this in QuickBooks)</div>
          <div style={{fontSize:12,color:C.gold,fontFamily:"monospace",wordBreak:"break-all",userSelect:"all"}}>https://ptczgktyxifzbaxcsqan.supabase.co/functions/v1/qb-webhook</div>
        </div>
        <Inp label="Verifier Token (from QuickBooks developer dashboard)" value={qb.verifier_token||""} onChange={v=>setQb(p=>({...p,verifier_token:v}))} placeholder="Paste your QB verifier token"/>
        <Inp label="Client ID" value={qb.client_id||""} onChange={v=>setQb(p=>({...p,client_id:v}))} placeholder="QB App Client ID"/>
        <Inp label="Client Secret" value={qb.client_secret||""} onChange={v=>setQb(p=>({...p,client_secret:v}))} placeholder="QB App Client Secret"/>
        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:4}}>
          <Btn onClick={saveQb}>Save QB Settings</Btn>
          {qbSaved&&<span style={{color:"#4ade80",fontSize:12}}>✓ Saved</span>}
          {qb.verifier_token&&<span style={{fontSize:11,color:"#4ade80"}}>● Connected</span>}
          {!qb.verifier_token&&<span style={{fontSize:11,color:C.muted}}>○ Not configured</span>}
        </div>
      </>}
      <div style={{marginTop:12,padding:"10px 14px",background:C.navy,borderRadius:8,fontSize:11,color:C.muted,lineHeight:1.6}}>
        💡 Payment items matched by <strong style={{color:C.white}}>amount + project</strong>. When QB marks an invoice line paid, the matching payment in that project's schedule gets auto-checked. The client sees ✅ Paid in their portal immediately.
      </div>
    </Card>

    <Card>
      <div style={{fontWeight:600,color:C.white,fontSize:14,marginBottom:10}}>Account</div>
      <Btn variant="danger" onClick={handleSignOut}>Sign Out</Btn>
    </Card>
  </div>;
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({onSwitchToClient}){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function handleLogin(){
    if(!email||!password){setError("Please enter your email and password.");return;}
    setLoading(true);setError("");
    const {error:err}=await supabase.auth.signInWithPassword({email,password});
    if(err){setError(err.message);}
    setLoading(false);
  }

  return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:fb,padding:20}}>
    <div style={{width:"100%",maxWidth:380}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <img src="https://tallguybuilds.ca/assets/img-002.webp" alt="TGB" style={{width:64,height:64,borderRadius:12,objectFit:"cover",marginBottom:16,boxShadow:"0 4px 20px #00000060"}}/>
        <h1 style={{fontFamily:font,color:C.white,fontSize:24,margin:0}}>Tall Guy Builds</h1>
        <div style={{color:C.gold,fontSize:10,letterSpacing:2,fontWeight:600,marginTop:6}}>BUILT RIGHT. DESIGNED TO LAST.</div>
      </div>
      <div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:14,padding:28}}>
        <div style={{fontSize:15,color:C.white,fontWeight:700,marginBottom:20}}>Admin sign in</div>
        {error&&<div style={{background:"#7f1d1d33",border:`1px solid #ef444444`,borderRadius:7,padding:"10px 14px",color:"#F87171",fontSize:13,marginBottom:14}}>{error}</div>}
        <Inp label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com"/>
        <Inp label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••"/>
        <Btn onClick={handleLogin} style={{width:"100%",marginTop:6,justifyContent:"center",opacity:loading?0.6:1}}>
          {loading?"Signing in…":"Sign In"}
        </Btn>
      </div>
      {onSwitchToClient&&<div style={{textAlign:"center",marginTop:20}}>
        <button onClick={onSwitchToClient} style={{background:"none",border:"none",color:C.muted,fontSize:11,cursor:"pointer",fontFamily:fb}}>Client? Sign in to your project portal</button>
      </div>}
    </div>
  </div>;
}

// ── CLIENT LOGIN (magic link) ─────────────────────────────────────────────────
function ClientLogin({onSwitch}){
  const [email,setEmail]=useState("");
  const [sent,setSent]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  async function sendLink(){
    if(!email.trim()){setError("Please enter your email.");return;}
    setLoading(true);setError("");
    // Always redirect back to the portal URL — ensures ?portal=1 is preserved
    // so the client login form is shown if the session somehow drops
    const {error:err}=await supabase.auth.signInWithOtp({
      email:email.trim().toLowerCase(),
      options:{emailRedirectTo:"https://app.tallguybuilds.ca?portal=1"}
    });
    if(err){setError(err.message);setLoading(false);}
    else{setSent(true);setLoading(false);}
  }

  return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:fb,padding:20}}>
    <div style={{width:"100%",maxWidth:380}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <img src="https://tallguybuilds.ca/assets/img-002.webp" alt="TGB" style={{width:64,height:64,borderRadius:12,objectFit:"cover",marginBottom:16,boxShadow:"0 4px 20px #00000060"}}/>
        <h1 style={{fontFamily:font,color:C.white,fontSize:24,margin:0}}>Tall Guy Builds</h1>
        <div style={{color:C.gold,fontSize:10,letterSpacing:2,fontWeight:600,marginTop:6}}>CLIENT PORTAL</div>
      </div>
      <div style={{background:C.navyLight,border:`1px solid ${C.border}`,borderRadius:14,padding:28}}>
        {!sent?<>
          <div style={{fontSize:15,color:C.white,fontWeight:700,marginBottom:8}}>Sign in to your portal</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:20}}>We'll email you a one-click sign-in link. No password needed.</div>
          {error&&<div style={{background:"#7f1d1d33",border:"1px solid #ef444444",borderRadius:7,padding:"10px 14px",color:"#F87171",fontSize:13,marginBottom:14}}>{error}</div>}
          <Inp label="Email" type="email" value={email} onChange={setEmail} placeholder="your@email.com"/>
          <Btn onClick={sendLink} style={{width:"100%",marginTop:6,justifyContent:"center",opacity:loading?0.6:1}}>
            {loading?"Sending…":"Send Sign-In Link"}
          </Btn>
        </>:<>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:14}}>📬</div>
            <div style={{fontSize:16,color:C.white,fontWeight:700,marginBottom:8}}>Check your email</div>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>We sent a sign-in link to <strong style={{color:C.gold}}>{email}</strong>. Click the link to access your project portal.</div>
            <button onClick={()=>{setSent(false);setEmail("");}} style={{marginTop:18,background:"none",border:"none",color:C.muted,fontSize:12,cursor:"pointer",fontFamily:fb}}>Use a different email</button>
          </div>
        </>}
      </div>
      <div style={{textAlign:"center",marginTop:20}}>
        <button onClick={onSwitch} style={{background:"none",border:"none",color:C.muted,fontSize:11,cursor:"pointer",fontFamily:fb}}>Admin? Sign in here</button>
      </div>
    </div>
  </div>;
}

// ── CLIENT PORTAL WRAPPER (client auth mode) ──────────────────────────────────
function ClientPortalWrapper({session,onSignOut}){
  const [jobs,setJobs]=useState([]);
  const [logs,setLogs]=useState([]);
  const [milestones,setMilestones]=useState([]); // FIX: milestones were missing — Schedule tab was empty
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);

  useEffect(()=>{
    async function load(){
      try{
        // Find this client's record by email
        const {data:client}=await supabase.from("clients").select("id").eq("email",session.user.email).single();
        if(!client){setError("Your account isn't linked to any projects yet. Contact Tall Guy Builds at (306)737-5407.");setLoading(false);return;}
        // Get their job IDs
        const {data:cj}=await supabase.from("client_jobs").select("job_id").eq("client_id",client.id);
        const jobIds=(cj||[]).map(r=>r.job_id);
        if(jobIds.length===0){setJobs([]);setLogs([]);setMilestones([]);setLoading(false);return;}
        // Fetch jobs, client-visible logs, and milestones
        const [j,lg,ms]=await Promise.all([
          supabase.from("jobs").select("*").in("id",jobIds),
          supabase.from("daily_logs").select("*").in("job_id",jobIds).eq("visible_to_client",true).order("date",{ascending:false}),
          supabase.from("milestones").select("*").in("job_id",jobIds).order("date"),
        ]);
        setJobs(j.data||[]);setLogs(lg.data||[]);setMilestones(ms.data||[]);
      }catch(err){setError("Could not load your projects: "+err.message);}
      finally{setLoading(false);}
    }
    load();
  },[session]);

  if(loading)return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:C.gold,fontFamily:font,fontSize:18}}>Loading your portal…</div>;
  if(error)return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
    <div style={{maxWidth:400,textAlign:"center"}}>
      <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
      <div style={{color:C.danger,fontFamily:fb,fontSize:14,marginBottom:20}}>{error}</div>
      <Btn variant="ghost" onClick={onSignOut}>Sign Out</Btn>
    </div>
  </div>;

  return <div style={{background:C.bg,minHeight:"100vh",fontFamily:fb}}>
    <div style={{maxWidth:760,margin:"0 auto",padding:"24px 16px"}}>
      <ClientPortal jobs={jobs} logs={logs} milestones={milestones} clientMode={true} onSignOut={onSignOut}/>
    </div>
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
  {id:"estimator",label:"Estimator",icon:"💲"},
  {id:"settings",label:"Settings",icon:"⚙"},
];

export default function App(){
  const [page,setPage]=useState("dashboard");
  const [session,setSession]=useState(undefined);
  const [isClient,setIsClient]=useState(false); // true if logged-in user is a portal client
  const [clientMode,setClientMode]=useState(()=>new URLSearchParams(window.location.search).get("portal")==="1"); // auto-switches to client login when ?portal=1 is in URL (from magic link email)
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [jobs,setJobs]=useState([]);
  const [leads,setLeads]=useState([]);
  const [subs,setSubs]=useState([]);
  const [events,setEvents]=useState([]);
  const [logs,setLogs]=useState([]);
  const [milestones,setMilestones]=useState([]);
  const [clients,setClients]=useState([]);

  // Auth listener
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>setSession(session));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>setSession(session));
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(session===undefined)return; // still checking
    if(!session){setLoading(false);return;} // not logged in
    async function load(){
      try{
        // Check if this user is a client (email in clients table)
        const {data:clientRow}=await supabase.from("clients").select("id").eq("email",session.user.email).maybeSingle();
        if(clientRow){
          // This is a client user — portal-only mode
          setIsClient(true);setLoading(false);return;
        }
        // Admin: load all data (including settings to sync EmailJS to localStorage)
        const [j,l,s,e,lg,ms,cl,st]=await Promise.all([
          supabase.from("jobs").select("*").order("created_at",{ascending:false}),
          supabase.from("leads").select("*").order("created_at",{ascending:false}),
          supabase.from("subs").select("*").order("name"),
          supabase.from("events").select("*").order("date"),
          supabase.from("daily_logs").select("*").order("date",{ascending:false}),
          supabase.from("milestones").select("*").order("date"),
          supabase.from("clients").select("*").order("name"),
          supabase.from("settings").select("*"),
        ]);
        if(j.error)throw j.error;
        setJobs(j.data||[]);setLeads(l.data||[]);setSubs(s.data||[]);setEvents(e.data||[]);setLogs(lg.data||[]);setMilestones(ms.data||[]);setClients(cl.data||[]);
        // Sync EmailJS credentials from DB to localStorage so sendMilestoneEmail() works on any device
        const ejRow=(st.data||[]).find(r=>r.key==="emailjs");
        if(ejRow?.value)localStorage.setItem("tgb_emailjs",JSON.stringify(ejRow.value));
      }catch(err){setError("Could not connect to database: "+err.message);}
      finally{setLoading(false);}
    }
    load();
  },[session]);

  async function handleSignOut(){await supabase.auth.signOut();setIsClient(false);setClientMode(false);}

  if(session===undefined)return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:C.gold,fontFamily:font,fontSize:18}}>Loading...</div>;
  if(!session)return clientMode
    ?<ClientLogin onSwitch={()=>setClientMode(false)}/>
    :<Login onSwitchToClient={()=>setClientMode(true)}/>;
  if(loading)return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:C.gold,fontFamily:font,fontSize:18}}>Loading...</div>;
  if(error)return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:C.danger,fontFamily:fb,fontSize:14,padding:24,textAlign:"center"}}>{error}</div>;
  if(isClient)return <ClientPortalWrapper session={session} onSignOut={handleSignOut}/>;

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
        {page==="jobs"&&<Jobs jobs={jobs} setJobs={setJobs} leads={leads} setMilestonesGlobal={setMilestones} clients={clients}/>}
        {page==="leads"&&<Leads leads={leads} setLeads={setLeads}/>}
        {page==="schedule"&&<Schedule events={events} setEvents={setEvents} jobs={jobs} milestones={milestones} setMilestones={setMilestones}/>}
        {page==="subs"&&<Subs subs={subs} setSubs={setSubs}/>}
        {page==="logs"&&<DailyLog logs={logs} setLogs={setLogs} jobs={jobs}/>}
        {page==="portal"&&<ClientPortal jobs={jobs} logs={logs} milestones={milestones}/>}
        {page==="estimator"&&<Estimator jobs={jobs} leads={leads}/>}
        {page==="settings"&&<Settings/>}
      </div>
    </div>
  </div>;
}
