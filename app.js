const SUPABASE_URL='https://vrifdeskapwepbafeuvv.supabase.co';
const SUPABASE_KEY='sb_publishable_7R4OeXDJIJ9kFGQ0s7Axvw_BItBPtSK';

async function loadSupabase(){
  if(window.supabase) return window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
  return window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
}

(async()=>{
  const langBtn=document.getElementById('langBtn');
  let lang='mn';
  if(langBtn){
    function setLang(next){
      lang=next; document.documentElement.lang=lang;
      document.querySelectorAll('[data-mn]').forEach(el=>{el.innerHTML=el.dataset[lang]});
      langBtn.textContent=lang==='mn'?'EN':'MN';
    }
    langBtn.addEventListener('click',()=>setLang(lang==='mn'?'en':'mn'));
  }

  const form=document.getElementById('form');
  const toast=document.getElementById('toast');
  if(!form) return;
  const supabase=await loadSupabase();
  const fmt=n=>new Intl.NumberFormat('mn-MN').format(n)+'₮';

  async function ensureSession(){
    const {data:{session}}=await supabase.auth.getSession();
    if(session) return session;
    const email=prompt('Захиалгаа хадгалахын тулд имэйл хаягаа оруулна уу:');
    if(!email) return null;
    const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin+'/account.html'}});
    if(error) throw error;
    alert('Нэвтрэх холбоос таны имэйлд илгээгдлээ. Эхлээд холбоосоор нэвтэрч, дараа нь захиалгаа үргэлжлүүлнэ үү.');
    return null;
  }

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    const qty=Math.max(1,Number(data.qty||1));
    const prices={Улиас:69000,Бургас:79000,Хайлаас:89000};
    const total=(prices[data.tree]||0)*qty;
    if(!total){alert('Модны үнийг тодорхойлох боломжгүй байна.');return;}
    try{
      const session=await ensureSession();
      if(!session) return;
      const orderNumber='NS-'+Date.now().toString().slice(-8);
      const {data:row,error}=await supabase.from('orders').insert({
        user_id:session.user.id,
        order_number:orderNumber,
        tree_type:data.tree,
        quantity:qty,
        total_amount_mnt:total,
        payment_status:'paid',
        payment_confirmation_status:'pending_confirmation',
        planting_status:'ordered',
        location:'Бага модны ам',
        honoree_name:data.honoree||null,
        dedication:data.dedication||null
      }).select().single();
      if(error) throw error;
      localStorage.setItem('nogoonSuvargaDraft',JSON.stringify({...data,orderId:row.id,orderNumber,createdAt:new Date().toISOString()}));
      document.getElementById('oid').textContent=orderNumber;
      document.getElementById('ref').textContent=orderNumber;
      document.getElementById('summary').textContent=`${data.name} — ${data.tree}, ${qty} ширхэг. Нийт үнэ: ${fmt(total)}. Захиалга үйл ажиллагааны хувьд идэвхтэй; төлбөрийн банкны баталгаажуулалт хүлээгдэж байна.`;
      const msg=`Ногоон Суварга\nЗахиалга: ${orderNumber}\nНэр: ${data.name}\nУтас: ${data.phone}\nМод: ${data.tree}\nТоо: ${qty}\nНийт үнэ: ${fmt(total)}\nҮйлчилгээ: ${data.service}\nБайршил: Бага модны ам\nДурсах хүн: ${data.honoree||'-'}\nДурсгалын үг: ${data.dedication||'-'}`;
      document.getElementById('whatsapp').href='https://wa.me/97689630150?text='+encodeURIComponent(msg);
      document.getElementById('payment').classList.add('show');
      document.getElementById('payment').scrollIntoView({behavior:'smooth',block:'center'});
      if(toast){toast.textContent='Захиалга бүртгэгдлээ. Төлбөрийг баталгаажуулахад хүлээгдэж байгаа боловч захиалгын үйл явц үргэлжилнэ.';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),4200)}
    }catch(err){console.error(err);alert('Захиалга хадгалахад алдаа гарлаа. Дахин оролдоно уу.');}
  });
})();
