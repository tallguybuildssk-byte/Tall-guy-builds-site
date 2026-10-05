// Owner-only, read-only queries. RLS remains the authority; no service key here.
export const SOURCE_FIELDS='source_system,company_id,estimate_id,original_revision,job_id,recorded_at,captured_at,estimate_number:original_snapshot->DocNumber,client_name:original_draft->clientName,address:original_snapshot->ShipAddr,contract_total_cents:original_draft->contractTotalCents,tax_cents:original_draft->taxCents,revenue_cents:original_draft->contractRevenueCents,scope:original_draft->scope,schedule:original_draft->schedule,accepted_date:original_draft->acceptedDate,source_updated_at:original_draft->sourceUpdatedAt';
export async function loadContractSource(client,jobId){
 if(!jobId)return {status:'new-project'};
 const owner=await client.rpc('portal_is_owner');
 if(owner.error||owner.data!==true)return {status:'restricted'};
 const source=await client.from('connector_estimate_sources').select(SOURCE_FIELDS).eq('job_id',jobId).maybeSingle();
 if(source.error)return {status:'unavailable'};
 if(!source.data)return {status:'unlinked'};
 const revisions=await client.from('connector_estimate_revisions')
  .select('revision,captured_at,recorded_at,total_cents:draft->contractTotalCents,status:snapshot->TxnStatus',{count:'exact'})
  .eq('source_system',source.data.source_system).eq('company_id',source.data.company_id)
  .eq('estimate_id',source.data.estimate_id).order('recorded_at',{ascending:false}).limit(20);
 return {status:'linked',source:source.data,revisions:revisions.data||[],
  revisionCount:revisions.count??0,revisionError:Boolean(revisions.error)};
}

export function money(value,{cents=false}={}){
 if(value===null||value===undefined||value===''||!Number.isFinite(Number(value)))return 'Not recorded';
 return new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD'}).format(Number(value)/(cents?100:1));
}
export function displayDate(value){
 if(typeof value!=='string'||!value)return 'Not recorded';
 if(/^\d{4}-\d{2}-\d{2}$/.test(value))return value;
 const d=new Date(value);return Number.isFinite(+d)?new Intl.DateTimeFormat('en-CA',{
  dateStyle:'medium',timeStyle:'short',timeZone:'America/Regina'}).format(d)+' (Regina)': 'Not recorded';
}
