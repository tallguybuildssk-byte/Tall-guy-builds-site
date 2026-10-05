export const AUTO_IMPORT_STATE_KEY='qbo_auto_import_state';
const errors={connection:'QuickBooks connection needs attention.',source_read:'The latest QuickBooks check could not finish.',
 import_write:'A project import needs attention.',state_write:'Check results could not be saved.',overlap:'Another check is still running.'};
const timestamp=v=>typeof v==='string'&&Number.isFinite(Date.parse(v))?v:null;
export function parseAutoImportStatus(value,now=Date.now()){
 if(!value)return {status:'not-configured',label:'Automatic checks are not configured.'};
 if(!Number.isInteger(value.version)||value.version<1||value.mode!=='assistant_hourly'||typeof value.enabled!=='boolean')return {status:'unavailable',label:'Automatic check status is unavailable.'};
 const checked=timestamp(value.last_checked_at),success=timestamp(value.last_success_at);
 const enabled=value.enabled===true;
 const hourly=value.interval_minutes===60;
 const baseline=timestamp(value.baseline_at);
 const baselineOnly=Boolean(success&&baseline&&Date.parse(success)<=Date.parse(baseline));
 const hasRun=Boolean(success&&!baselineOnly);
 const errorCode=value.last_error_code??value.last_error?.code;
 const error=errorCode?errors[errorCode]||'The latest automatic check needs attention.':null;
 const reference=hasRun?success:timestamp(value.enabled_at);
 const stale=enabled&&Boolean(reference)&&now-Date.parse(reference)>2*60*60*1000;
 return {status:!enabled?'paused':error?'error':stale?'overdue':hasRun?'active':'waiting',enabled,
  label:!enabled?'Automatic checks are paused.':error?'Automatic checks need attention.':
   stale?'Automatic checks are enabled; a successful check is overdue.':
   hasRun?(hourly?'Hourly automatic checks are enabled.':'Automatic checks are enabled.'):
   'Automatic checks are enabled; awaiting the first successful hourly check.',
  checked,success,error,baselineOnly,cadence:hourly?'Hourly':null};
}
export async function loadAutoImportStatus(client,now=Date.now()){
 const owner=await client.rpc('portal_is_owner');
 if(owner.error||owner.data!==true)return {status:'restricted'};
 // Do not broaden this filter or fetch the legacy quickbooks credential row.
 // Project only status fields, never the baseline, lease or arbitrary error text.
 const row=await client.from('settings').select('version:value->version,enabled:value->enabled,mode:value->mode,interval_minutes:value->interval_minutes,enabled_at:value->enabled_at,baseline_at:value->baseline_at,last_checked_at:value->last_checked_at,last_success_at:value->last_success_at,last_error_code:value->last_error->code')
  .eq('key',AUTO_IMPORT_STATE_KEY).maybeSingle();
 return row.error?{status:'unavailable',label:'Automatic check status could not be loaded.'}:parseAutoImportStatus(row.data,now);
}
