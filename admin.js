const {createClient}=supabase;
const client=createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY);
const bucket=window.SUPABASE_BUCKET;
const defs=[['company','公司形象','Company','▦'],['factory','厂房环境','Factory','▤'],['workshop','生产车间','Workshop','⚙'],['vffs','VFFS设备','VFFS Machine','▥'],['food','食品包装','Food Packaging','◈'],['weighing','自动称重','Weighing System','⌗'],['cases','项目案例','Case Studies','▣'],['videos','视频中心','Video','▶']];
let items=[],hero=null;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2300)}
function ext(file){const p=file.name.split('.');return p.length>1?p.pop().toLowerCase():'bin'}
function pathFromUrl(url){const marker=`/storage/v1/object/public/${bucket}/`;const i=(url||'').indexOf(marker);return i>=0?url.slice(i+marker.length):null}
function grouped(){const out={};defs.forEach(d=>out[d[0]]=[]);items.filter(x=>x.slot_key!=='hero').forEach(x=>(out[x.slot_key]??=[]).push(x));return out}
async function loadAll(){
 const {data,error}=await client.from('gallery_items').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:true});
 if(error)throw error;items=data||[];hero=items.find(x=>x.slot_key==='hero')||null;
 renderHero();render();
}
function renderHero(){
 const box=$('heroBox');
 box.innerHTML=`<div class="hero-preview">${hero?.image_url?`<img src="${esc(hero.image_url)}" alt="">`:'<div>暂未设置顶部背景</div>'}</div>
 <div class="hero-actions"><label class="secondary">上传/更换背景 <input hidden type="file" accept="image/*" onchange="uploadHero(this)"></label>
 ${hero?.image_url?'<button class="danger" onclick="deleteHero()">删除背景</button>':''}
 </div>`;
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
async function uploadHero(input){
 const file=input.files?.[0];if(!file)return;
 const path=`hero/background-${Date.now()}.${ext(file)}`;
 const {error}=await client.storage.from(bucket).upload(path,file,{upsert:false,contentType:file.type||undefined});
 if(error)return toast('背景上传失败：'+error.message);
 const {data}=client.storage.from(bucket).getPublicUrl(path);
 if(hero){
   const old=pathFromUrl(hero.image_url);if(old)await client.storage.from(bucket).remove([old]);
   const r=await client.from('gallery_items').update({image_url:data.publicUrl,published:true,title:'图库首页背景'}).eq('id',hero.id);
   if(r.error)return toast('背景保存失败：'+r.error.message);
 }else{
   const r=await client.from('gallery_items').insert({slot_key:'hero',title:'图库首页背景',description:'',image_url:data.publicUrl,video_url:'',sort_order:0,published:true});
   if(r.error)return toast('背景保存失败：'+r.error.message);
 }
 toast('顶部背景已更新');await loadAll();
}
window.uploadHero=uploadHero;
async function deleteHero(){
 if(!hero)return;if(!confirm('确定删除首页顶部背景吗？'))return;
 const p=pathFromUrl(hero.image_url);if(p)await client.storage.from(bucket).remove([p]);
 const {error}=await client.from('gallery_items').delete().eq('id',hero.id);if(error)return toast('删除失败：'+error.message);
 toast('背景已删除');await loadAll();
}
window.deleteHero=deleteHero;
function showLogin(){$('loginBox').style.display='block';$('dashboard').style.display='none'}
async function showDashboard(session){$('loginBox').style.display='none';$('dashboard').style.display='block';$('userLabel').textContent=session.user.email;try{await loadAll()}catch(e){$('adminGrid').innerHTML=`<div class="notice">读取后台失败：${esc(e.message)}</div>`}}
$('loginBtn').onclick=async()=>{const email=$('email').value.trim(),password=$('password').value;$('loginStatus').textContent='登录中…';const {error}=await client.auth.signInWithPassword({email,password});$('loginStatus').textContent=error?'登录失败：'+error.message:''};
$('logoutBtn').onclick=()=>client.auth.signOut();
(async()=>{const {data:{session}}=await client.auth.getSession();if(session)showDashboard(session);else showLogin();client.auth.onAuthStateChange((_e,s)=>s?showDashboard(s):showLogin())})();
