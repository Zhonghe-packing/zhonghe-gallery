const {createClient}=supabase;
const client=createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY);
const bucket=window.SUPABASE_BUCKET;
const defs=[['company','公司形象','Company','▦'],['factory','厂房环境','Factory','▤'],['workshop','生产车间','Workshop','⚙'],['vffs','VFFS设备','VFFS Machine','▥'],['food','食品包装','Food Packaging','◈'],['weighing','自动称重','Weighing System','⌗'],['cases','项目案例','Case Studies','▣'],['videos','视频中心','Video','▶']];
let items=[],heroDesktop=null,heroMobile=null;
const SITE_DEFAULTS = {
  nav_home:'首页', nav_about:'公司概况', nav_gallery:'品牌图库', nav_solution:'解决方案', nav_contact:'联系我们',
  hero_eyebrow:'SHANGHAI ZHONGHE PACKAGING MACHINERY', hero_title:'品牌形象图库', hero_subtitle:'用影像，记录我们的专业与实力', hero_en:'BRAND GALLERY', hero_desc:'Photos & Videos　|　Our Factory · Our Machines · Our Team',
  about_title:'公司概况', about_en:'ABOUT US', about_text:'上海众和包装机械有限公司是一家专注于 VFFS 立式包装机及食品包装解决方案的高新技术企业。公司拥有专业的研发团队和先进的制造工艺，致力于为客户提供高效、稳定、智能的包装设备。', about_features:[['高品质设备','精工制造 品质可靠','◇'],['定制化方案','满足多样化需求','⚙'],['全球服务','快速响应 专业支持','◎'],['合作共赢','与客户共同成长','♢']],
  gallery_title:'精选图库', gallery_en:'FEATURED GALLERY',
  video_title:'VFFS 包装系统方案演示视频', video_desc:'从薄膜放卷、制袋、计量到成品输出，展示高效、稳定、智能的包装解决方案。', video_button:'浏览视频内容　▶',
  contact_company_title:'上海众和包装机械有限公司', contact_company_text:'专注包装机械及自动化包装系统，为食品及相关行业提供设备与整体解决方案。',
  contact_title:'联系我们', contact_address:'地址：上海市松江区玉佳支路88号', contact_phone:'电话：021-57817120-106', contact_mobile:'手机：13301975098',
  contact_gallery_title:'品牌图库', contact_gallery_text:'厂房环境 · 生产车间 · VFFS设备 · 食品包装\n自动称重 · 项目案例 · 视频中心', footer:'© 上海众和包装机械有限公司',
  categories:[['company','公司形象','Company','▦'],['factory','厂房环境','Factory','▤'],['workshop','生产车间','Workshop','⚙'],['vffs','VFFS设备','VFFS Machine','▥'],['food','食品包装','Food Packaging','◈'],['weighing','自动称重','Weighing System','⌗'],['cases','项目案例','Case Studies','▣'],['videos','视频中心','Video','▶']]
};
let siteSettings = structuredClone(SITE_DEFAULTS);
let siteSettingsRow = null;

const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2300)}
function ext(file){const p=file.name.split('.');return p.length>1?p.pop().toLowerCase():'bin'}
function pathFromUrl(url){const marker=`/storage/v1/object/public/${bucket}/`;const i=(url||'').indexOf(marker);return i>=0?url.slice(i+marker.length):null}
function grouped(){const out={};defs.forEach(d=>out[d[0]]=[]);items.filter(x=>!['hero','hero_desktop','hero_mobile','hero_center','hero_left','hero_right'].includes(x.slot_key)).forEach(x=>(out[x.slot_key]??=[]).push(x));return out}

function settingsFields(){
 const fields=[
  ['nav_home','导航：首页','input'],['nav_about','导航：公司概况','input'],['nav_gallery','导航：品牌图库','input'],['nav_solution','导航：解决方案（跳转视频）','input'],['nav_contact','导航：联系我们','input'],
  ['hero_eyebrow','首页 Banner 英文眉题','input'],['hero_title','首页 Banner 标题','input'],['hero_subtitle','首页 Banner 副标题','input'],['hero_en','首页 Banner 英文小标题','input'],['hero_desc','首页 Banner 说明','input'],
  ['about_title','公司概况标题','input'],['about_en','公司概况英文','input'],['about_text','公司概况正文','textarea'],
  ['gallery_title','图库标题','input'],['gallery_en','图库英文','input'],
  ['video_title','视频区标题','input'],['video_desc','视频区说明','textarea'],['video_button','视频按钮','input'],
  ['contact_company_title','联系我们左侧公司名','input'],['contact_company_text','联系我们左侧说明','textarea'],['contact_title','联系我们标题','input'],['contact_address','地址','input'],['contact_phone','电话','input'],['contact_mobile','手机','input'],['contact_gallery_title','联系我们右侧标题','input'],['contact_gallery_text','图库分类说明','textarea'],['footer','页脚文字','input']
 ];
 const html=fields.map(([k,label,type])=>`<div class="field"><label>${label}</label>${type==='textarea'?`<textarea id="site-${k}" rows="3">${esc(siteSettings[k]||'')}</textarea>`:`<input id="site-${k}" value="${esc(siteSettings[k]||'')}">`}</div>`).join('');
 const feats=siteSettings.about_features||SITE_DEFAULTS.about_features;
 const featHtml=feats.map((f,i)=>`<div class="field"><label>优势 ${i+1} 名称</label><input id="feat-${i}" value="${esc(f[0])}"></div><div class="field"><label>优势 ${i+1} 说明</label><input id="featt-${i}" value="${esc(f[1])}"></div>`).join('');
 const cats=siteSettings.categories||SITE_DEFAULTS.categories;
 const catHtml=cats.map((c,i)=>`<div class="field"><label>分类 ${i+1} 中文名称</label><input id="cat-${i}" value="${esc(c[1])}"></div><div class="field"><label>分类 ${i+1} 英文名称</label><input id="cate-${i}" value="${esc(c[2])}"></div>`).join('');
 $('siteSettingsForm').innerHTML=`<div class="settings-group"><h3>页面文字</h3><div class="settings-grid-inner">${html}</div></div><div class="settings-group"><h3>公司概况右侧四项优势</h3><div class="settings-grid-inner">${featHtml}</div></div><div class="settings-group"><h3>8 个图库分类名称</h3><div class="settings-grid-inner">${catHtml}</div></div>`;
}
async function loadSiteSettings(){
 const {data,error}=await client.from('gallery_items').select('*').eq('slot_key','site_settings').order('created_at',{ascending:true}).limit(1);
 if(error){$('siteSettingsStatus').textContent='读取网站文字失败：'+error.message;return}
 siteSettingsRow=data?.[0]||null;
 if(siteSettingsRow?.description){try{siteSettings={...SITE_DEFAULTS,...JSON.parse(siteSettingsRow.description)}}catch(e){}}
 settingsFields();
}
async function saveSiteSettings(){
 const payload={...siteSettings};
 const fields=['nav_home','nav_about','nav_gallery','nav_solution','nav_contact','hero_eyebrow','hero_title','hero_subtitle','hero_en','hero_desc','about_title','about_en','about_text','gallery_title','gallery_en','video_title','video_desc','video_button','contact_company_title','contact_company_text','contact_title','contact_address','contact_phone','contact_mobile','contact_gallery_title','contact_gallery_text','footer'];
 fields.forEach(k=>{const e=$('site-'+k);if(e)payload[k]=e.value.trim()});
 payload.about_features=(siteSettings.about_features||SITE_DEFAULTS.about_features).map((f,i)=>[($('feat-'+i).value.trim()||f[0]),($('featt-'+i).value.trim()||f[1]),f[2]]);
 payload.categories=(siteSettings.categories||SITE_DEFAULTS.categories).map((c,i)=>[c[0],$('cat-'+i).value.trim()||c[1],$('cate-'+i).value.trim()||c[2],c[3]]);
 const rowPayload={slot_key:'site_settings',title:'网站文字设置',description:JSON.stringify(payload),image_url:'',video_url:'',sort_order:-999,published:true};
 let r;
 if(siteSettingsRow) r=await client.from('gallery_items').update(rowPayload).eq('id',siteSettingsRow.id);
 else r=await client.from('gallery_items').insert(rowPayload);
 if(r.error){$('siteSettingsStatus').textContent='保存失败：'+r.error.message;return}
 siteSettings=payload;
 $('siteSettingsStatus').textContent='网站文字已保存';
 await loadAll();
}
window.loadSiteSettings=loadSiteSettings;
window.saveSiteSettings=saveSiteSettings;

async function loadAll(){
 const {data,error}=await client.from('gallery_items').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:true});
 if(error)throw error;items=data||[];heroDesktop=items.find(x=>x.slot_key==='hero_desktop')||null;heroMobile=items.find(x=>x.slot_key==='hero_mobile')||null;
 const row=items.find(x=>x.slot_key==='site_settings'); if(row?.description){try{siteSettings={...SITE_DEFAULTS,...JSON.parse(row.description)}}catch(e){}};
 renderHero();render(); settingsFields();
}
function renderHero(){
 const box=$('heroBox');
 const part=(key,label,item,note)=>`<div class="hero-part"><h3>${label}</h3><p class="small hero-part-note">${note}</p><div class="hero-part-preview">${item?.image_url?`<img src="${esc(item.image_url)}" alt="">`:'<div>暂未设置</div>'}</div><div class="hero-part-actions"><label class="primary">${item?'更换':'上传'}图片 <input hidden type="file" accept="image/*" onchange="uploadHeroPart(this,'${key}')"></label>${item?`<button class="danger" onclick="deleteHeroPart('${key}')">删除</button>`:''}</div></div>`;
 box.innerHTML=part('hero_desktop','电脑端主图',heroDesktop,'建议准备横向高清 Banner，例如 1920×600 或 2560×800。')+part('hero_mobile','手机端主图',heroMobile,'建议准备竖向高清 Banner，例如 750×1000 或 1080×1200。手机端会完整显示这张图。');
}
function render(){
 const groups=grouped();
 $('adminGrid').innerHTML=defs.map(d=>{
   const arr=groups[d[0]]||[];
   return `<section class="admin-category">
    <div class="cat-head"><div><h2>${d[1]} <span>${d[2]}</span></h2><p class="small">当前 ${arr.length} 个内容</p></div>
      <div class="cat-upload"><label class="primary">批量上传图片 <input hidden type="file" accept="image/*" multiple onchange="uploadBatch(this,'${d[0]}','image')"></label>
      <label class="secondary">批量上传视频 <input hidden type="file" accept="video/*" multiple onchange="uploadBatch(this,'${d[0]}','video')"></label></div>
    </div>
    ${arr.length?arr.map((x,i)=>itemEditor(x,i,arr.length)).join(''):'<div class="empty-admin">还没有内容，点击上方“批量上传图片”即可添加第一张。</div>'}
   </section>`;
 }).join('');
}
function itemEditor(x,i,len){
 const media=x.image_url?`<img src="${esc(x.image_url)}" alt="">`:x.video_url?`<video src="${esc(x.video_url)}" controls></video>`:'';
 return `<article class="admin-card">
  <div class="thumb">${media||'<span>无媒体</span>'}</div>
  <div class="small">内容 #${i+1} · ${esc(x.slot_key)}</div>
  <div class="row"><div class="field"><label>标题</label><input id="title-${x.id}" value="${esc(x.title||'')}"></div>
  <div class="field"><label>排序</label><input id="sort-${x.id}" type="number" value="${x.sort_order??0}"></div></div>
  <div class="field"><label>说明</label><textarea id="desc-${x.id}">${esc(x.description||'')}</textarea></div>
  <label class="check"><input id="pub-${x.id}" type="checkbox" ${x.published?'checked':''}> 发布到公开图库</label>
  <div class="row admin-buttons">
   <button class="primary" onclick="saveItem(${x.id})">保存信息</button>
   <label class="secondary">替换图片 <input hidden type="file" accept="image/*" onchange="replaceMedia(${x.id},this,'image')"></label>
   <label class="secondary">替换视频 <input hidden type="file" accept="video/*" onchange="replaceMedia(${x.id},this,'video')"></label>
   <button class="danger" onclick="deleteItem(${x.id})">删除此内容</button>
  </div>
  <div class="move"><button class="secondary" onclick="moveItem(${x.id},-1)">↑ 上移</button><button class="secondary" onclick="moveItem(${x.id},1)">↓ 下移</button></div>
  <div class="status" id="status-${x.id}"></div>
 </article>`;
}
async function saveItem(id){
 const x=items.find(a=>a.id===id);if(!x)return;
 const payload={title:$(`title-${id}`).value.trim(),description:$(`desc-${id}`).value.trim(),sort_order:Number($(`sort-${id}`).value)||x.sort_order,published:$(`pub-${id}`).checked};
 const {error}=await client.from('gallery_items').update(payload).eq('id',id);
 if(error)return toast('保存失败：'+error.message);toast('已保存');await loadAll();
}
window.saveItem=saveItem;
async function uploadBatch(input,slot,type){
 const files=[...(input.files||[])];if(!files.length)return;
 const group=items.filter(x=>x.slot_key===slot&&x.slot_key!=='hero');
 let next=Math.max(0,...group.map(x=>Number(x.sort_order)||0))+1;
 for(const file of files){
   const path=`gallery/${slot}/${type}-${Date.now()}-${Math.random().toString(36).slice(2,7)}.${ext(file)}`;
   const {error}=await client.storage.from(bucket).upload(path,file,{upsert:false,contentType:file.type||undefined});
   if(error){toast('上传失败：'+error.message);continue}
   const {data}=client.storage.from(bucket).getPublicUrl(path);
   const payload={slot_key:slot,title:file.name.replace(/\.[^.]+$/,''),description:'',image_url:type==='image'?data.publicUrl:'',video_url:type==='video'?data.publicUrl:'',sort_order:next++,published:true};
   const r=await client.from('gallery_items').insert(payload);
   if(r.error){toast('数据库写入失败：'+r.error.message);continue}
 }
 toast(`已上传 ${files.length} 个文件`);await loadAll();
}
window.uploadBatch=uploadBatch;
async function replaceMedia(id,input,type){
 const file=input.files?.[0];if(!file)return;const x=items.find(a=>a.id===id);if(!x)return;
 const path=`gallery/${x.slot_key}/${type}-${Date.now()}.${ext(file)}`;
 const {error}=await client.storage.from(bucket).upload(path,file,{upsert:false,contentType:file.type||undefined});
 if(error)return toast('上传失败：'+error.message);
 const {data}=client.storage.from(bucket).getPublicUrl(path);
 const old=type==='image'?x.image_url:x.video_url;
 const payload=type==='image'?{image_url:data.publicUrl}:{video_url:data.publicUrl};
 const r=await client.from('gallery_items').update(payload).eq('id',id);
 if(r.error)return toast('数据库更新失败：'+r.error.message);
 const oldPath=pathFromUrl(old);if(oldPath)await client.storage.from(bucket).remove([oldPath]);
 toast('已替换媒体');await loadAll();
}
window.replaceMedia=replaceMedia;
async function deleteItem(id){
 const x=items.find(a=>a.id===id);if(!x)return;
 if(!confirm(`确定删除“${x.title||'此内容'}”吗？`))return;
 const paths=[pathFromUrl(x.image_url),pathFromUrl(x.video_url)].filter(Boolean);
 if(paths.length)await client.storage.from(bucket).remove(paths);
 const {error}=await client.from('gallery_items').delete().eq('id',id);
 if(error)return toast('删除失败：'+error.message);
 toast('已删除');await loadAll();
}
window.deleteItem=deleteItem;
async function moveItem(id,delta){
 const same=items.filter(x=>x.slot_key===items.find(y=>y.id===id)?.slot_key).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
 const i=same.findIndex(x=>x.id===id),j=i+delta;if(i<0||j<0||j>=same.length)return;
 const a=same[i],b=same[j];
 let r=await client.from('gallery_items').update({sort_order:b.sort_order}).eq('id',a.id);if(r.error)return toast('排序失败');
 r=await client.from('gallery_items').update({sort_order:a.sort_order}).eq('id',b.id);if(r.error)return toast('排序失败');
 toast('排序已更新');await loadAll();
}
window.moveItem=moveItem;
async function uploadHeroPart(input,key){
 const file=input.files?.[0];if(!file)return;
 const path=`hero/${key}-${Date.now()}.${ext(file)}`;
 const {error}=await client.storage.from(bucket).upload(path,file,{upsert:false,contentType:file.type||undefined});
 if(error)return toast('Banner 上传失败：'+error.message);
 const {data}=client.storage.from(bucket).getPublicUrl(path);
 const existing=key==='hero_desktop'?heroDesktop:heroMobile;
 const title=key==='hero_desktop'?'首页电脑端主图':'首页手机端主图';
 const payload={image_url:data.publicUrl,published:true,title};
 let r;
 if(existing){
   const old=pathFromUrl(existing.image_url);
   r=await client.from('gallery_items').update(payload).eq('id',existing.id);
   if(r.error)return toast('Banner 保存失败：'+r.error.message);
   if(old)await client.storage.from(bucket).remove([old]);
 }else{
   r=await client.from('gallery_items').insert({slot_key:key,title,description:'',image_url:data.publicUrl,video_url:'',sort_order:key==='hero_desktop'?-100:-99,published:true});
   if(r.error)return toast('Banner 保存失败：'+r.error.message);
 }
 toast('Banner 已更新');await loadAll();
}
window.uploadHeroPart=uploadHeroPart;
async function deleteHeroPart(key){
 const item=key==='hero_desktop'?heroDesktop:heroMobile;
 if(!item)return;if(!confirm('确定删除这张首页 Banner 吗？'))return;
 const p=pathFromUrl(item.image_url);if(p)await client.storage.from(bucket).remove([p]);
 const {error}=await client.from('gallery_items').delete().eq('id',item.id);if(error)return toast('删除失败：'+error.message);
 toast('Banner 已删除');await loadAll();
}
window.deleteHeroPart=deleteHeroPart;
function showLogin(){$('loginBox').style.display='block';$('dashboard').style.display='none'}
async function showDashboard(session){$('loginBox').style.display='none';$('dashboard').style.display='block';$('userLabel').textContent=session.user.email;try{await loadAll();await loadSiteSettings()}catch(e){$('adminGrid').innerHTML=`<div class="notice">读取后台失败：${esc(e.message)}</div>`}}
$('loginBtn').onclick=async()=>{const email=$('email').value.trim(),password=$('password').value;$('loginStatus').textContent='登录中…';const {error}=await client.auth.signInWithPassword({email,password});$('loginStatus').textContent=error?'登录失败：'+error.message:''};
$('logoutBtn').onclick=()=>client.auth.signOut();
$('saveSiteSettingsBtn').onclick=saveSiteSettings;
(async()=>{const {data:{session}}=await client.auth.getSession();if(session)showDashboard(session);else showLogin();client.auth.onAuthStateChange((_e,s)=>s?showDashboard(s):showLogin())})();
